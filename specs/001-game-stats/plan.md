# Plan — Spec 001 game-stats

No code in this document. Decisions only. Every decision points at the RF it serves.
Planned 2026-10-23 by sdd-planner (fable); reviewed by the orchestrator.

## Approach
One new pure file `stats.js` (global `Stats`, also `module.exports`) holds every calculation; `index.html` gets
three new `<dialog>`s (capture sheet, PA picker, stats views) written like `#teamRoster`/`#saved`, and a fourth
synced document `stats` wired into the **existing** `SYNC`/`KEY_OF`/`firstSnapshot`/`applyRemote` machinery with
one `name === "stats"` branch each — no parallel sync. The stats document is a flat JSON array of records and
deletion markers merged by id (RF-14), so every snapshot (first or later) is merged with the same function.
Part A (capture + save + sync) ships alone; Part B adds the views on top of the same data.

## Modules / files
| Module or file | Responsibility | RFs | New/mod |
|---|---|---|---|
| `stats.js` | Pure logic: codes/labels, row refresh, fit/columns, run check, merge, aggregation, rates, sort, games, labels. No DOM, no Firebase, no clock. Dual export: top-level `var Stats = {...}` + `if(typeof module !== "undefined") module.exports = Stats;` | 2,5,6,8,14,16,18–23,31,33,36,38 | new |
| `tests/sheet.test.js` | Part A sheet logic | 2,5,6,8,30,31,33,36,38 | new |
| `tests/merge.test.js` | Merge (first sync, live, backup import) | 14,16 | new |
| `tests/views.test.js` | Part B aggregation, rates, sort, games, labels, player lines | 18–23 | new |
| `index.html` storage block (~L1239, L1266–1268) | `K_STATS = NS + "stats.v1"`, `SYNC[K_STATS]="stats"`, `KEY_OF.stats` | 13 | mod |
| `index.html` cloud-down block (L2981–3058) | `applyRemote` else-branch uses `KEY_OF[name]` (today hard-codes `K_SAVED`); `mergeFirst` gets a `stats` branch *before* the `current` fallback; watch list adds `"stats"`; live path for stats re-uses `firstSnapshot` | 13,14,37 | mod |
| `index.html` backup (L2461–2483) | export adds `stats`; import merges with `Stats.merge` | 16 | mod |
| `index.html` `#capture` + `#paPick` dialogs (markup after `#saved`; JS section "estadísticas: anotar" after the innings block ~L2367) | open/refresh record, grid, cell picker, substitute, row remove, +/− innings, save, close guard | 1–12,15,27–39 | mod |
| `index.html` `#statsView` + ☰ entry (`SHEETS.more`, topbar `.tgroup`, `ICONS.chart`) | Jugadores / Juegos / player detail, delete game, open game | 17–26 | mod (B) |
| `index.html` `.innings-head` (L1045) | button `btnCapture` "Anotar estadísticas" (Juego tab on phone, innings card on desktop) | 1 | mod |
| `index.html` `<style>` | `.sheet-scroll`, `table.sheet` sticky first column, `.sheet-cell`, `.inn-bad`, dialog widths (copy `#teamRoster` L485) | NFR | mod |
| `sw.js` | `ASSETS` += `"stats.js"`, `VERSION` `v3`→`v4` | NFR offline | mod |
| `index.html` `<script src="stats.js">` before the main `<script>` (L1207) | `Stats` exists before `D10.start` runs | all | mod |

## Data model
- **Document `users/{uid}/data/stats`**, field `json` (string) like the other three, via `cloud.put`. Local key
  `diamante10.u.<uid>.stats.v1`. Content `Entry[]`, each either
  - **Record** `{id, savedAt, game:{date, team, opp, home, innings, us[], them[]}, rows:[{pid, num, name, pos,
    pas:[{inn, code, run, rbi, sb}]}]}` (`pos` = internal key incl. `"DH"`, or `null`), or
  - **Marker** `{id, deletedAt}`.
  - One entry per `id`; timestamps ISO UTC from `new Date().toISOString()` (taken in index.html, passed in);
    `id` from `nid()` (L1333). At most one row per `pid` (RF-36).
- **`S.statsId`** (string, optional): set only on save from the current game (RF-7). Not added to `blankState()`
  or `ensureState()`: absent = no record, so old states load unchanged (RF-9, NFR backward compat), and
  "Alineación nueva" clears it for free because it rebuilds `S` from `blankState()` (RF-10). `applyRemote("current")`
  keeps it (replaces `S` whole). Saved lineups deep-copy `S`, so they carry it (RF-9).
- **Must NOT change**: `current`/`team`/`saved` formats, their `SYNC` names, `mergeFirst` rules for them, the
  `K_MIGRATED` `ready` check (legacy keys only), the logout prefix wipe (already covers `K_STATS`), `hasDirty`
  (generic), `firestore.rules` (wildcard already allows `stats`).
- Logout/offline/dirty: nothing new. `lsSet(K_STATS, …)` marks `dirty.stats`, queues the put, `flushPut` clears
  it on confirm — the whole of RF-13.

## Contracts
`Stats` (all pure; timestamps passed in):
- `CODES: [{code, pick, cell}]` — 12 entries in picker order (RF-2). `cellLabel(pa)` → cell label + `"•"` when
  `run` (RF-2).
- `refreshRows(rows, lineup)` — `lineup = [{pid, num, name, pos}]` built in index.html from `S.order` + `posOf`.
  Stored rows kept (pos, pas); missing pids appended; duplicate pids dropped. `rows = []` ⇒ RF-1; else RF-8/RF-24;
  RF-36.
- `fit(rec)` — `innings = max(innings, minInnings(rec))` (so never below 3); `us`/`them` padded with 0 / truncated to
  `innings` (RF-31, RF-38). `minInnings(rec)` → `max(3, highest inn with a PA)` (RF-30).
- `runCheck(rec)` → `[{sheet, board, diff}]` per inning; `signed(n)` → `"+1" | "−2" | ""` (U+2212) (RF-5, RF-6).
- `hasPA(rec)` (RF-33).
- `merge(a, b)` — by id, later `deletedAt||savedAt` wins, tie → marker, one-sided ids kept; order: a's, then
  b's new ids (RF-14, RF-16). `live(entries)` → records only.
- Part B: `players(entries, team)` → `{rows:[{pid, num, name, g, pa, ab, h, b2, b3, hr, r, rbi, bb, k, sb, avg,
  obp, slg, ops}], team:{…, g = live record count}}` (RF-18, RF-21); `rates(counts)` → numbers rounded to
  thousandths or `null` (RF-19); `fmt(x)` → `".333" | "1.083" | "—"`; `sortPlayers(rows, key, desc)` (RF-20);
  `playerGames(entries, pid)` → `{lines:[{id, date, opp, ab, h, r, rbi, bb, k, seq}], total}` (RF-22);
  `games(entries)` → `{list:[{id, date, opp, savedAt, us, them, result:"W"|"L"|"T"}], w, l, t, runsFor,
  runsAgainst}` (RF-23; UI shows G/P/E).
- index.html: `openCapture(rec, fromCurrent)` (RF-1/8/24/35), `saveCapture()` (RF-7/15/32/33/34/39),
  `tryCloseCapture()` (RF-11), `openStats(view)` (RF-17). Toasts use the exact spec strings. `lsSet` returning
  `false` is the only "write failed".

## Algorithms / rules
- **Open (RF-1/8/9/12/24/35)**: `rec` = entry with `id === S.statsId` in `lsGet(K_STATS)`; none → if
  `!S.order.length` toast RF-12 and stop; else new `{id:nid(), rows:[]}`; `fromCurrent = true`. From Juegos
  (RF-24): `fromCurrent = (rec.id === S.statsId)`. When `fromCurrent`: `rec.game` = copy of `S`
  `{date, team, opp, home, innings, us, them}`, rows = `refreshRows(rec.rows, lineup)`; else stored. Then `fit`.
  Keep `cap = {rec (deep copy), opened: JSON.stringify(rec), fromCurrent, linkId: S.statsId || null}`.
- **Save (RF-7/15/32/33/34/39)**: `!hasPA` → "Anota al menos un turno"; `!rec.game.date` → "Ponle fecha al
  juego"; else `rec.savedAt = now`; `prev = lsGet(K_STATS, [])`; `ok1 = lsSet(K_STATS, merge(prev, [rec]))`.
  `!ok1` → RF-15 toast, stay open. If `fromCurrent && (S.statsId||null) === cap.linkId` → copy `date, innings,
  us, them` into `S`, `S.statsId = rec.id`, `ok2 = save()`; `!ok2` → `lsSet(K_STATS, prev)`, restore the five `S`
  fields, RF-15 toast, stay open. Else `renderAll()`, toast "Estadísticas guardadas", close. Atomic locally only;
  the cloud put is queued and retried by the existing flush (accepted, RF-39).
- **Sync (RF-13/14/37)**: watch `"stats"` like the others. First snapshot: `firstSnapshot` unchanged,
  `mergeFirst("stats")` → `merge(remote, local)`. **Live path**: in the watch callback, before the generic
  early-return (L3054): `if(name === "stats"){ if(remote == null || remote === synced[name]) return;
  firstSnapshot(name, remote, local); return; }` — merge is commutative and idempotent, so the first-snapshot rule
  is right for every stats snapshot: dirty → merge, apply if changed, flush if `val !== remote`; not dirty →
  `applyRemote(remote)`. `current/team/saved` keep "ignore remote while pending". `applyRemote("stats")` only
  writes localStorage (and re-renders `#statsView` if open); the capture sheet is an in-memory copy (RF-37).
- **Upload of `stats` is a transaction (amended 2026-10-23 after T4 review BLOCK)**: a plain `setDoc` is a blind
  overwrite, so two devices that saved offline lose one record (B's queued `setDoc` replaces A's; A, not dirty,
  then applies B's copy). Fix: `cloud.putMerged(name, json)` in `cloudFor` uses `runTransaction`: read the server
  doc, `Stats.merge(serverEntries, localEntries)`, write the result (same `{json, updatedAt}` shape), resolve
  with it. `flushPut` calls `putMerged` instead of `put` for `"stats"` only. Transactions need the server, so on
  rejection (offline) the json goes back to `pending.stats` (unless a newer one is there) and `dirty.stats`
  stays; the retry happens on the next `stats` snapshot that is not `fromCache` (connection back) via
  `flushPut("stats")`. On success `setDirty(false)` keeps its existing rule; the merged doc then arrives as a
  normal snapshot and is applied (or merged if a newer local change exists). Logout stays safe: `hasDirty` blocks
  it while `dirty.stats` is set. `current/team/saved` keep `setDoc`.
- **Merge (RF-14)**: index by id; `ts(e) = e.deletedAt || e.savedAt`; greater ISO string wins; equal → marker.
- **Run check (RF-5/6)**: `sheet[inn-1]` = PAs with `run` in `inn`; `diff = sheet − (us[inn-1]||0)`; header
  class `inn-bad` + `signed(diff)` when `diff !== 0`; saving never blocked.
- **Aggregation (RF-18/19)**: per pid over `live(entries)`; `g` = records with ≥1 PA for that pid; team = sums,
  `g` = live record count. `round3(n/d) = Math.round(n*1000/d)/1000`; `null` when the denominator is 0;
  `ops = round3(obp_exact + slg_exact)`, `null` if either is null. `fmt`: `toFixed(3)` without the leading `0`.
- **Sort (RF-20)**: numeric keys desc by default, `name` asc; same header again → reverse; `null` always last;
  ties `name.localeCompare(b, "es")` asc; default `avg` desc.
- **Label (RF-21)**: `TEAM` by pid, else `{num, name}` from the newest record (RF-23 order) where the player has
  ≥ 1 PA (same records that count for G).
- **OPS rounding (amended after T10 review)**: summing the two float rates breaks half-up (h19 ab48 bb2 tb21 gives
  .857 instead of .858), so OPS is computed in integers: `round3((h+bb)*ab + tb*od, od*ab)` with
  `od = ab+bb+sf`.
- **Games (RF-23)**: `live` sorted by `date` desc then `savedAt` desc; score `Σus − Σthem`; W/L/T; totals.
  Player detail (RF-22) same order; `seq` = cell labels joined with `" · "` in inning order, entry order within.
- **Capture UI**: cell picker copies `openPicker` (L1777) and `.pickitem`: 12 code buttons + run toggle + rbi/sb
  chip buttons; confirm disabled without a code (RF-2); filled cell → its 1–2 PAs with "Editar"/"Borrar" (RF-3,
  RF-27) + "Otro turno en este inning" only with 1 PA (RF-28). Substitute (RF-4): `openActions`-style list of
  `TEAM` players without a row → inserted after the row with `pos:null`, `S.order` untouched. Row menu "⋯" offers "Quitar fila" only when
  `pas.length === 0` (RF-29). Dirty check (RF-11): `JSON.stringify(cap.rec) !== cap.opened` →
  `askConfirm("¿Salir sin guardar?", "Se pierden los cambios.", "Salir", …)`; Esc through the `cancel` event;
  the generic backdrop handler (L2973) skips `#capture` and routes to the same guard.

## Screens (DOM)
- **`#capture`** `<dialog>` (pattern `#teamRoster`), `min(980px, calc(100vw − 28px))` on desktop; bottom sheet
  (90vh) on phone. Head: "Estadísticas · <opp>", `<input type=date>`, `+`/`−` innings, "Guardar" (`btn-key`),
  "Cerrar". Body: `.sheet-scroll{overflow-x:auto}` around `table.sheet`: `thead` = batter header + one `th` per
  inning (red + signed diff when mismatched); `tbody` = one row per `rows[]` with sticky first `th`
  (num · name · `posLabel(pos)||"—"` + row menu: substitute / remove) and a ≥40×40 `td` button per inning;
  `tfoot` = "Nosotros"/"Ellos" numeric inputs copying `table.inn` (L2310–2321) (RF-30). Only vertical scroll in
  the dialog body.
- **`#paPick`** `<dialog>` over `#capture` (nested modals already exist: `askConfirm` from `#teamRoster`).
- **`#statsView`** `<dialog>` (Part B), same width. Head: chips "Jugadores"/"Juegos", "Cerrar". Jugadores =
  `.sheet-scroll` table, sticky name column, tappable `th`, totals row; player detail with "← Jugadores";
  Juegos = summary + `.pickitem` list (copy `btnLoad` L2420–2455: "Abrir" → `openCapture`, ✕ → RF-25 confirm →
  `lsSet(K_STATS, merge(list, [{id, deletedAt:now}]))`). Empty state `empty-note` (RF-26).
- Entry points: `btnCapture` in `.innings-head` (RF-1); `btnStats` in the topbar `.tgroup` + `SHEETS.more` row
  `["btnStats","chart","Estadísticas","Jugadores y juegos"]` (RF-17).

## Test strategy
Command: **`node --test 'tests/*.test.js'`** (verified 2026-10-23: `node --test tests/` fails on Node 22.23.3
with MODULE_NOT_FOUND). `node:test` + `node:assert` only; fixtures inline per file; fixed timestamp strings.
- RF-2 `cellLabel`: `RO` → "Rol", run → "1B•". RF-1/8/36 `refreshRows`: empty ⇒ order copy; stored rows kept
  incl. pos; new pid appended; duplicate pid dropped; rows not in order kept. RF-31/38 `fit`: PA in inning 9 with
  `innings:7` ⇒ 9, `us/them` padded; truncation on −. RF-30 `minInnings`. RF-5/6 `runCheck` counts and sign,
  `signed(−2)` is U+2212. RF-33 `hasPA`.
- RF-14 `merge`: one-sided kept; later `savedAt` wins; record saved after a marker wins; tie ⇒ marker;
  commutative as sets; idempotent. RF-16: `merge(local, [])` = local.
- RF-18 `players`: 2 games, 3 players (0 PA ⇒ absent; absent from game 2 ⇒ `g:1`); team sums, `g` = 2.
  RF-19: `1/3 → ".333"`, `13/12 → "1.083"`, `5/16 → ".313"`, `ab:0 → "—"`, ops `null` when slg null.
  RF-20: default, nulls last both ways, ties by name, name asc/desc. RF-21 TEAM vs newest record. RF-22 order,
  `seq`, totals. RF-23 order, result, W-L-T, run totals, markers excluded.
- Manual (phone ≥360 px and desktop), in each UI task's "Done when": RF-1 (BD, —); RF-3/27/28; RF-4/29;
  RF-7/32 write-back + `S.statsId`; RF-9 saved lineup round trip; RF-10; RF-11 (button, Esc, backdrop);
  RF-12/15/33/34 toasts; RF-13 offline → reload → online → second device; RF-14 two devices with unsent changes;
  RF-16 backup round trip; RF-17/24/25/26; NFR horizontal scroll + sticky column; `sw.js` update.

## Part A / Part B split
- **Part A** (shippable alone): `stats.js` sheet functions; merge; sync wiring + backup; capture markup/CSS/script
  tag/`sw.js`; grid + run check + innings/score rows; PA picker; substitute/remove row; open + save + close guard
  + `btnCapture`.
- **Part B**: players/rates/fmt/sort/label; games/playerGames; `#statsView` Jugadores + detail; Juegos + ☰ entry.

## Risks
- `toast()` relocates into the first `dialog[open]` in DOM order (L1595): no toasts while `#paPick` is open;
  `#capture` sits before `#paPick` in the DOM.
- Generic backdrop-click handler closes any dialog (L2973) → one-line skip for `#capture`.
- `applyRemote` else-branch hard-codes `K_SAVED` → `KEY_OF[name]`; identical for `saved`.
- `mergeFirst` falls into the `current` rule for unknown names → the `stats` branch goes first.
- Live stats merge through `firstSnapshot` may re-flush once (harmless, idempotent). Clock skew, document size
  and two-device first-save duplicates: accepted per spec.
- OPS is rounded once from unrounded OBP + SLG (standard), not the sum of the shown values.

## Constitution check
1. Simplicity — complies: no deps, ES5 style, one new file, dialogs copy existing ones.
2. Spec rules — complies: every module maps to RFs.
3. Logic apart from UI — complies: `stats.js` has no DOM/Firebase/clock.
4. Tests as the gate — complies; command corrected to `node --test 'tests/*.test.js'` (constitution wording fixed
   2026-10-23).
5. Data — complies: new document only; `current/team/saved` untouched; `S.statsId` optional; deletions confirmed.
6. Offline first — complies: `stats.js` in `ASSETS`, `VERSION` v4.
7. Language — complies.
8. Ask first — complies: no deps, no rules change, no push.
