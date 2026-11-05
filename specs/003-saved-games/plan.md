# Plan — Spec 003 saved-games

No code in this document. Decisions only. Every decision points at the RF it serves.
Planned 2026-11-05 by sdd-planner (fable), reviewed by the orchestrator (see "Orchestrator review" at the end, which
wins over the body where they differ).

## Approach
Two optional fields on the working lineup (`gameId`, `gameAt`) carry the link; a saved game stays
`{id, name, at, state}`. All comparison/cap/merge/format/name logic is pure in `stats.js` (`Stats.*`, blank state and
clock passed in). The RF-8/9/10 start is one boolean `fresh` in `index.html`: while it is true, `save()` does not
write `K_CUR`, and `applyRemote("current")` updates a `stored` copy (the recovery candidate) instead of `S`. Header,
sheets, `#ask` and the Abrir list are the existing components with small extensions (a third `#ask` button, one
header button set for both layouts, sheet items filtered by "not visible in this layout"). No new dialog, no new
dependency, no document or rules change.

## Modules / files
| Module or file | Responsibility | RFs | New/mod |
|---|---|---|---|
| `stats.js` "juegos guardados" section | `differs`, `isEmpty`, `unsaved`, `gameName`, `fmtDate`, `fmtDateTime`, `result`, `asNew`, `upsertGame`, `trimGames`, `mergeGames` | 1–5, 8–12, 16, 17, 19, 20, 25, 35, 36 | mod |
| `stats.js` "nombres" section | `shortName` (moved from index.html, same rule), `shortNames` (disambiguation) | 30 | mod |
| `tests/games.test.js` | compare/empty/unsaved, as-new copy, upsert, cap, merge, result, name/date formats | 1–5, 8–12, 17, 19, 20, 35, 36 | new |
| `tests/names.test.js` | `shortName` keeps today's outputs; `shortNames` collisions | 30 | new |
| `index.html` estado | `normalizeState(st)` (ensureState + dedupe + normalizeGameRoster parametrized, 4 callers), `linkedGame()`, `hasUnsaved()`, link fields survive `save`/Abrir/backup | 4, 13, 14 | mod |
| `index.html` `#ask` | third button `#askAlt` + `askChoice(title,msg,yes,alt,cb)`; `askConfirm`/`askText` hide it | 10, 16 | mod |
| `index.html` guardar/cargar | Guardar (link/update/new/conflict/cap/toasts/error), `#btnSaveNew`, Abrir rows (time, result, pills, empty text, Abierto marker), open + RF-5 guard, delete, Nuevo texts | 1–5, 11–13, 15, 16, 19–21, 36–40 | mod |
| `index.html` capture | RF-6 upsert + RF-7 rollback, RF-26 toast, title/button labels, focus on Cerrar, legend | 6, 7, 25, 26, 31, 33 | mod |
| `index.html` boot + cloud (`S` boot, `save`, `applyRemote`, `firstSnapshot`, `mergeFirst`) | `fresh`/`stored`, no write at start, recovery offer, RF-10 ask, `mergeGames` in `mergeFirst` | 8, 9, 10, 17 | mod |
| `index.html` `<header>` + CSS ≤680 + `SHEETS`/`openSheet` + `renderHeader()` | one `.tools` for both layouts, offstage action buttons, labels, key styles, sheets as desktop menus, game name + ● | 15, 18, 22–24, 35, 41 | mod |
| `index.html` `paForm` | `<details>` "Más detalles" with `f.more`, chip default style | 27, 28, 42 | mod |
| `index.html` `updateScore`/`renderInnings` + `.score` CSS; `btnImport` | team names in the final scoreboard; import confirm | 32, 34 | mod |
| `index.html` slot CSS ≤680 + `POS[].mx/my` | `max(10px, …cqw)` on the four slot texts; re-placed phone slots | 29 | mod |
| `index.html` `#recover` banner (markup + CSS) | RF-9 offer, outside `[data-view]` so every phone tab shows it | 9, 10 | mod |
| `sw.js` | `VERSION` bump (no new asset) | NFR | mod |

## Data model
- **Working lineup `S`** gains `gameId: string` and `gameAt: ISO string`, both absent/`null` when unlinked (not in
  `blankState()`; "Nuevo", RF-3 and RF-8 produce none). Old versions keep unknown keys, so the link survives a round
  trip through an old device (RF-14).
- **Saved game** `{id, name, at, state}` unchanged; `state` may carry `gameId/gameAt` of its own (ignored: the link
  is looked up by the entry's `id`). Order: most recently saved first (`upsertGame` puts the saved entry at 0). Cap
  200 (`trimGames`), only on add (RF-11/12).
- **Compared fields** (spec): `us/them` compared as ints; `statsId` absent ≡ `null`. **Empty** = compared minus
  `date, roster` equal to `blankState()`. Both sides pass `normalizeState` before `Stats.differs` (the pure function
  assumes normalized input).
- **Linked game** = entry of `lsGet(K_SAVED)` whose `id === S.gameId`; not found ⇒ no link (RF-13 needs no write).
- **Recovery copy (RF-8/9)**: `stored` = the normalized working lineup read from `K_CUR` at boot, replaced by every
  remote/other-tab `current` that arrives while `fresh`. Lives only in memory + where it already is (`K_CUR`,
  `current` in Firestore). `fresh` flips to false on Recuperar, Descartar or the first real change.
- **Dirty flags**: unchanged. While `fresh`, `lsSet(K_CUR)` is never called, so no `dirty.current` and no
  `queuePut("current")`; `firstSnapshot("current")` keeps today's rules (a dirty local wins and is pushed, else the
  remote is applied → goes to `stored`).
- **Must NOT change**: `K_*` keys, `SYNC`/`KEY_OF`, `Stats.merge` (stats), `putMerged`, `firestore.rules`, the saved
  entry shape, `current` beyond the two optional keys, `hasPA`, 001/002 records.

## Contracts (`Stats.*`, pure, no DOM, no clock; lists never mutated)
- `differs(a, b, ignore?)` → bool over the compared fields; `ignore` = field names to skip (RF-5/9/16/35).
- `isEmpty(st, blank)` → `!differs(st, blank, ["date","roster"])` (RF-8/35).
- `unsaved(st, linkedState|null, blank)` → `linkedState ? differs(st, linkedState) : !isEmpty(st, blank)`.
- `gameName(st)` → `"<team|Equipo> vs <opp|rival>"` + `" · dd/mm/aaaa"` when `date` (RF-9/20).
- `fmtDate("aaaa-mm-dd")` → `"dd/mm/aaaa"`, `""` on empty (RF-19/25; the title uses the first 5 chars).
- `fmtDateTime(Date)` → `"dd/mm/aaaa · h:mm a. m."`/`"p. m."` from local getters, 12-hour, no seconds (RF-19).
- `result(st)` → `""` when both sums are 0, else `"Ganado 6–5" | "Perdido 3–4" | "Empate 2–2"` (en dash, ours
  first) (RF-36).
- `asNew(st, today)` → copy keeping `team, opp, home, roster, assign, order, dh, enabledSF, enabled4F, enabledDH`;
  `date = today`, `innings 7`, `us/them` seven zeros, no `statsId`, no `gameId/gameAt`, `start/end ""` (RF-3).
- `upsertGame(list, game)` → new list: `game` first, any entry with the same `id` removed (RF-1/2/3/6).
- `trimGames(list, max)` → `{kept, dropped}`; `dropped` = entries beyond `max` with the lowest `at` (ties: later
  position) (RF-11/12).
- `mergeGames(a, b)` → union by `id`, newer `at` wins, sorted by `at` desc, no cut (RF-17).
- `shortName(n)` → exactly today's `index.html` rule. `shortNames(names)` → array aligned to input: `shortName`;
  equal results → `"<first word> <initial of the word shortName used>."`; still equal → full name (RF-30).
- index.html: `normalizeState(st)` → normalized copy (uses `TEAM`); `linkedGame()` → entry|null; `hasUnsaved()`;
  `cardNames()` → `{id: display}` from `Stats.shortNames` over assigned + DH players, used by the field, the image and
  the ticket; `askChoice(title, msg, yesLabel, altLabel, cb(choice))`, `choice ∈ {"yes","alt"}`; `renderHeader()`;
  `saveGame(name|null)` (the one write path for RF-1/2/3/6); `writeGames(list)` → bool.

## Algorithms / rules
- **Guardar (RF-1/2/12/16/20/21/39)**: `g = linkedGame()`. No `g` ⇒ `askText("Guardar juego", …,
  Stats.gameName(S))` ⇒ add. `g.at !== S.gameAt` ⇒ `askChoice("Este juego cambió en otro dispositivo", …,
  "Reemplazar", "Guardar como nuevo")`. Else replace. Replace = `upsertGame(list, {id:g.id, name:g.name, at:now,
  state:copy(S)})`; add = same with `nid()` + name, then `trimGames(list, 200)`: `dropped.length` ⇒ `askConfirm`
  naming them first, cancel ⇒ nothing. `writeGames` false ⇒ toast "No se pudo guardar en este navegador", link
  untouched. Success ⇒ `S.gameId/gameAt` set, `save()`, `renderHeader()`, toast.
- **Guardar como nuevo (RF-3)**: name asked with `gameName(asNew(S, today))`; on confirm `S = asNew(S, today)` then
  the add path; previous entry untouched.
- **Abrir (RF-4/5)**: `hasUnsaved()` ⇒ `askConfirm("Hay cambios sin guardar", "Se pierden al abrir «name».",
  "Abrir")`. Load = `S = normalizeState(item.state)`, `gameId/gameAt = item.id/item.at`, `renderAll`, toast "Juego
  abierto". Nuevo: always confirms (title "Nuevo juego"); message starts with "Hay cambios sin guardar." when
  `hasUnsaved()` (RF-5/40).
- **Stats save (RF-6/7/26)**: after today's `K_STATS` + `K_CUR` writes, if `cap.fromCurrent && link matched &&
  linkedGame()` ⇒ `writeGames(upsertGame(...whole S, at now))`; false ⇒ restore the five fields + `lsSet(K_CUR, old)` +
  `K_STATS` as today, toast, return (sheet stays open). RF-6 does not run the RF-16 check (spec: "as RF-1 does").
- **Start (RF-8)**: boot normalizes `K_CUR` into `stored` (existing path), then `S` = the fresh lineup (see review
  R2), `freshState = copy(S)`, `fresh = true`. `save()`: `if(fresh){ if(!Stats.differs(S, freshState)) return;
  touched(); }`. `renderAll()` at boot writes nothing. `dedupeGameRoster` keeps its one-off write.
- **Offer (RF-9)**: `renderOffer()` shows `#recover` iff `fresh && stored && Stats.unsaved(stored, linked(stored),
  blank)`; text `gameName(stored)`. Recuperar ⇒ `S = stored; fresh = false; renderAll()`. Descartar ⇒ `askConfirm` ⇒
  `fresh = false; renderAll()` (writes the fresh lineup to `K_CUR` and the cloud: that is the drop).
  `applyRemote("current")`: `if(fresh){ stored = normalizeState(parsed); renderOffer(); return; }` (localStorage still
  updated) — covers "arrives after start" and the two-tab `storage` event.
- **RF-10**: `touched()`: if the offer is visible ⇒ `fresh = false; askChoice("¿Descartar lo último sin guardar?",
  …, "Descartar", "Recuperar")`: yes ⇒ `lsSet(K_CUR,S)`, hide offer; alt ⇒ `S = stored; renderAll()`. Dismissal: see
  review R1. Not visible ⇒ `fresh = false` and write.
- **Header (RF-15/18/35)**: `renderHeader()` from `renderAll`, the Guardar paths, Abrir, delete,
  `applyRemote("saved")`. Text: linked ⇒ name; unlinked and unsaved ⇒ "Juego sin guardar"; else "Softball · Lineups"
  (desktop) / hidden (phone). Marker = `<span class="unsaved" role="img" aria-label="cambios sin guardar">●</span>`
  before the text; name span `title` = full name; ellipsis on the text, not the dot. `#btnSaveNew.hidden = !linked`.
- **Header set (RF-22/23/24/41)**: one `.tools`: `btnNew, btnSave(btn-key), btnSaveNew, btnLoad "Abrir", btnStats,
  btnShareMenu, btnMoreMenu` + an offstage group (`class="offstage"`, `display:none`, never the `hidden` attr) holding
  `btnInstall, btnCopyImg, btnTicket "Térmica", btnPrint, btnTeamRoster "Roster", btnBackup, btnLogout "Cerrar
  sesión"`. ≤680: `#btnNew,#btnSaveNew,#btnLoad,#btnStats{display:none}`; Compartir/Más use a text span hidden on
  phone + `aria-label`. `SHEETS.more` = `[btnNew, btnSaveNew, btnLoad, btnStats, btnTeamRoster, btnBackup,
  btnInstall, sep, btnLogout]`, title "Más"; `openSheet` keeps `!hidden` and adds "the button itself is shown in this
  layout ⇒ leave it out of the sheet", so one list yields RF-23 on phone and RF-41 on desktop. `.mtools` removed.
- **Picker (RF-27/28/42)**: `f.more` = initial `rbi||sb||outs!==defaultOuts(code)`; `draw()` renders `<details
  open=f.more>` "Más detalles" with CI/BR/Outs; `toggle` ⇒ `f.more = open`; picking HR/SF/BO ⇒ `f.more = true`.
  `chip(label, on, fn, isDefault)`: class `btn btn-default` (2 px accent border, no fill, `aria-pressed=true`) when
  `isDefault && on`, `btn-key` when `on && !isDefault`.
- **Field cards (RF-29/30)**: `font-size:max(10px, Xcqw)` on `.slot-num/.slot-key/.slot-jersey/.slot-name` at ≤680;
  the stage at 360 px is ≈326 px wide ⇒ cards ≈28 px tall vs vertical gaps P/DH/C ≈28–31 px ⇒ `my` of P, DH, C (and
  the width) re-tuned by hand; checked with `impeccable detect`.
- **Scoreboard (RF-32)**: `updateScore` sets the two `<small>` to `"<name> · Visita"` / `"<name> · Casa"` with
  Nosotros/Ellos fallbacks; ellipsis via max-width; aria-labels carry the name.
- **Import (RF-34)**: parse first; not a backup object ⇒ toast; else `askConfirm("Importar respaldo", <spec text>,
  "Importar")` wrapping today's body.

## Test strategy
Command (repo root): `node --test 'tests/*.test.js'`. Fixtures inline (a `blank()` literal mirroring
`blankState()`, a `lineup()` builder).
- `tests/games.test.js`: `differs` (each compared field flips it; `at`, key order, roster names, `gameId` do not;
  `us` `"3"` vs `3` equal); `isEmpty` (date/roster ignored, `statsId` counts); `unsaved` both branches; `asNew`;
  `upsertGame` (first, dedupe by id, input untouched); `trimGames` (200 ⇒ none; 201 ⇒ lowest `at` dropped, not the
  last position); `mergeGames` (union, newer `at`, no cut at 300, commutative); `result` (0–0 ⇒ `""`, three outcomes,
  string scores); `gameName` (fallbacks, no date); `fmtDate`/`fmtDateTime` (`new Date(2026,10,5,14,5)` ⇒
  `"05/11/2026 · 2:05 p. m."`, midnight ⇒ `12:00 a. m.`).
- `tests/names.test.js`: `shortName` keeps today's outputs; `shortNames` (["Kevin Pérez","Keven Pérez"] ⇒
  ["Kevin P.","Keven P."]; still equal ⇒ full names; no collision ⇒ unchanged).
- Manual, on `http://localhost:8000` (`python3 -m http.server 8000 < /dev/null`, demo seed that bypasses Firebase) at
  360/375/800/1440 px: RF-4–10, 13, 15, 16 (two tabs), 18, 21–29, 31–34, 37–42, the Done-criteria flow and the
  critique re-run. RF-16 and RF-9 "arrives after start" use two tabs (the `storage` event stands in for Firestore).

## Risks
- `renderHeader` parses `K_SAVED` (≤200 states) on renders → only when `S.gameId` is set; memoize by raw string only
  if a phone shows jank.
- `ensureState`/`normalizeGameRoster` mutate global `S` → parametrizing them touches 4 call sites; done first under
  the existing tests + a boot check.
- An old-version device still cuts `saved` to 60 (accepted); `mergeGames` never cuts.
- RF-29 slot re-placement is trial and error: timebox 30 min, else report.
- `askChoice` reuses `#ask`: `askConfirm`/`askText` must hide `#askAlt` on every call.

## Constitution check
1. Simplicity — complies: no deps, no build, two test files, ES5, existing components extended.
2. Spec rules — complies: every module maps to RF-1…42.
3. Logic apart from UI — complies: compare/empty/unsaved/cap/merge/formats/result/names in `stats.js`.
4. Tests as the gate — complies: `node --test 'tests/*.test.js'` + manual list per task.
5. Data — complies: two optional keys on `current`, saved shape unchanged, old entries open unlinked, nothing
   deleted without a confirm, merge never cuts.
6. Offline first — complies: `sw.js` `VERSION` bump, no new asset.
7. Language — complies.
8. Ask first — complies: no deps, no rules/auth change, no push; deletions (RF-12 drop, RF-9 Descartar) confirmed.

## Orchestrator review (2026-11-05) — wins over the body
- R1 (RF-10 dismissal): the "¿Descartar lo último sin guardar?" dialog cannot be dismissed with Esc/backdrop; the
  user must pick Descartar or Recuperar (principle 5: a stray Esc must not drop a lineup).
- R2 (RF-8 fresh lineup): follow the spec assumption Kevin approved at G1 — the fresh lineup is `blankState()` with
  today's local date: permanent roster (`TEAM`) kept, players of the game **not** carried over, team name cleared.
  The planner's "keep stored.roster" is rejected.
- R3 (RF-6 without the RF-16 check): accepted as the spec words it; a stats save overwrites the linked game.
- R4 (`.mtools` removal / one `.tools`): accepted; the phone tab bar and every sheet must keep working, checked by
  hand at 360 px in the header task.
- Every module maps to an RF; nothing cut. Tasks in `tasks.md`.
