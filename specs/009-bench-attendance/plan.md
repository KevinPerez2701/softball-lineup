# Plan — Spec 009 bench-attendance

No code in this document. Planned 2026-11-06 by sdd-planner (fable); line numbers are of HEAD 97623df (index.html 4392
lines, stats.js 678 lines). Format copied from `specs/008-critique-third/plan.md`.

## Orchestrator review (wins over the text below)
- D1 (revised after the T4 review): `dropStored` does NOT reset the fold. It keeps the same `S` and runs inside a
  "Vino" press on the fresh lineup ("Equipo" open); resetting there folded the list on the next "Vino" while Kevin was
  still marking players — the opposite of RF-9's intent. Also: the `toggle` listener only writes while the section is
  in the page (`isConnected`), so a late event from a removed section cannot overwrite the choice.
- D2: the "—" badge on bench rows stays (RF-13); ≈ 82 px for the name at 360 px, ellipsis. Kevin may ask later.
- Checked: `setTab` does not call `save()`/`renderAll()`, so switching phone tabs does not drop the undo.
- RF-4 over-drop (team rename, scoreboard edit) accepted, as 008 D2.
- Every map is every RF; no scope beyond the spec. Wave 1 = T1, T2, T3 in parallel worktrees; T4 after T1+T3; T5 is the
  orchestrator's demo.

## Approach
Two pure helpers in `stats.js` (`absent`, `absentTitle`) carry the NFR's node-tested logic. `renderBench` (2555) grows a
"No vino" button per row and a `details#absent` section after `#benchList`, built from those helpers. "No vino" copies the
"Campo vaciado" undo pattern (2604–2609) with the 008 sticky toast; the undo snapshot lives in one module var that
`save()` (1841, "todo cambio pasa por aquí") drops, which covers every local edit, game switch and remote `current`/`team`
arrival in one hook. "Vino" copies the Roster checkbox block (2405–2418) literally, so RF-8 is `touched()` for free. The
open/folded choice is one module var reset when the `S` object is replaced (every game switch creates a new `S`). No new
file besides the test, no dependency, no data-shape change, no `sw.js` bump (the worker revalidates `index.html` and
`stats.js` network-first).

## Modules / files
| path | responsibility | RFs served | new/modified |
|---|---|---|---|
| `stats.js` | `Stats.absent`, `Stats.absentTitle` (append after `asNew`, 559–567, section "juegos guardados") | RF-6, RF-9 (title), NFR | modified |
| `tests/bench.test.js` | node tests for both helpers | RF-6, NFR | new |
| `index.html` CSS | `#absent` rules after 465; RF-12 rule after 731 | RF-1, RF-6, RF-12 | modified |
| `index.html` HTML | 1203 `<h2>` gets `id="benchTitle" tabindex="-1"` | RF-11 | modified |
| `index.html` JS | `save()` 1841 drop hook; `renderBench` 2555 buttons + section; module vars; `dropStored` 1863 | RF-1–RF-11, RF-13 | modified |

## Data model
No change. `S.roster` entries stay `{id,num,name}` (pushed exactly as 2410 does); `TEAM`, `K_CUR`, `K_SAVED`,
`firestore.rules`, `sw.js` untouched. Every press writes `current` through `save()` like the checkbox. The open/folded
choice and the undo snapshot are in memory only (RF-9 "not stored").

## Contracts
stats.js (pure, no DOM):
- `Stats.absent(team, roster)` → the `team` entries (same objects, team order) whose `id` is not in `roster`. `[]` for an
  empty team or everybody present; the whole team when `roster` is empty. Match by id only (`normalizeGameRoster` 1635
  guarantees roster ids are team ids); a renamed team entry is returned with its current name/num.
- `Stats.absentTitle(absent, roster)` → `"No vinieron (<absent.length>)"`, or `"Equipo (<absent.length>)"` when
  `roster.length === 0`. No singular form.

index.html (HEAD lines):
- RF-1: in the `bench.forEach` loop (2564) a `button.btn.btn-sm` "No vino", `title` and `aria-label`
  `pl.name + " no vino: retirarlo del partido"`, appended to `r.acts` before `add` (2582). 360 px: row content ≈ 300 px;
  jersey 27 + badge ≈ 24 + acts ≈ 143 + gaps 24 → name ≈ 82 px. The grid `auto minmax(0,1fr) auto auto` (376) and
  `.row .nm` nowrap/ellipsis (394) already keep one line; no grid change.
- RF-2: handler: `snap = {id, roster: S.roster.slice(), dh: S.dh}`; `removePlayerEverywhere(pl.id)` (2383);
  `renderAll()`; `toast(pl.name + " no vino", undoFn, true)` (008 sticky: Deshacer + ✕ "Cerrar aviso"); then
  `benchUndo = snap` (after `renderAll`, so its own `save()` does not drop it).
- RF-3: `undoFn`: `u = benchUndo; benchUndo = null;` RF-5 guard; `S.roster = u.roster; S.dh = u.dh; renderAll()`. The
  header is derived (`renderHeader` 1674), so "●"/"Guardado ✓" come back by themselves.
- RF-4: `var benchUndo = null` near `toastT` (1883). First line of `save()`:
  `if(benchUndo){ benchUndo = null; $("toast").classList.remove("on"); }`. All `renderAll()` callers are state changes or
  game switches (Nuevo 3250, Abrir `load` 3340, `recoverStored` 1861, `applyRemote` current 4103 / team 4108, saveGame
  3272, capture close 3195, field/order/toggle edits); scoreboard inputs call `save()` directly. Another toast rebuilds
  `#toast` (1892), so the Deshacer button disappears.
- RF-5: in `undoFn`, `if(player(u.id) || !TEAM.some(id === u.id)) return;`.
- RF-6: `renderBench` restructured so the section renders in both branches (today 2562 returns early on an empty bench):
  remove `$("absent")` if present, then when `Stats.absent(TEAM, S.roster).length` append to `ul.parentNode` a
  `details#absent.hint.no-print` with a `summary` = `Stats.absentTitle(...)` and a `ul.list` of hand-built `li.row`
  (jersey span as 2180, `nm` span, `rowacts` with `button.btn.btn-sm` "Vino", `aria-label`/`title`
  `tp.name + " vino: agregarlo al partido"`). No `rowFor` (it always adds a posbadge), not draggable.
- RF-7/RF-8: "Vino" copies 2409–2417: `if(!player(id)) S.roster.push({id, num: tp.num || "", name}); save(); renderAll();
  toast(tp.name + " agregado al partido")`. `save()` → `touched()` asks "¿Descartar lo último sin guardar?" while the
  banner shows; "Recuperar" replaces `S`, so the push is discarded — the checkbox's behavior today.
- RF-9: `var absentOpen = true, absentFor = null`. In `renderBench`: `if(absentFor !== S){ absentFor = S; absentOpen =
  !S.roster.length; }` — every game switch assigns a new `S` (3247, 3338, 1861, 4099, boot 4081); plus `absentFor = null`
  in `dropStored` (D1). `details.open = absentOpen`; a `toggle` listener writes `absentOpen = details.open`.
- RF-10: the section is outside `#benchList`; `#benchCount` untouched; `no-print` hidden by the print CSS (858).
- RF-11: before mutating, `hadFocus = document.activeElement === btn` and the row index `i`; after `renderAll()`,
  `rows = document.querySelectorAll(listSel + " .row")`, `r = rows[i] || rows[i-1]`, focus its button, else
  `#absent summary` (after the last No vino), else `$("benchTitle")`. Helper `refocusRow(listSel, btnSel, i)` used by both
  handlers. No focus jump when the press did not hold focus (touch).
- RF-12: in the 680 block after 731: `body:has(> .toast.on) .wrap{padding-bottom:calc(<measured>px +
  env(safe-area-inset-bottom))}` (≈ 150 px like the capture rule at 731, measured at 360×640).
- RF-13: `add` (2573–2582), the empty note (2561), Roster dialog (2390–2479), Nuevo (3241) untouched.
- CSS after 465: `#absent{margin:10px 0 0}`, `#absent .list{margin-top:6px;font-size:15px;color:var(--ink)}` (`.hint` sets
  12.5 px/`--ink-3`), `#absent .row{grid-template-columns:auto minmax(0,1fr) auto}`.

## Algorithms / rules
- Undo validity is positional, never stored: one snapshot, dropped by the first `save()` after it is set; "set after
  renderAll" is the only ordering rule in the handler.
- "In its place" = same index in the freshly rendered list; `rows[i]` is the next player.
- Section visibility and title are recomputed from `TEAM`/`S.roster` at every render; only the fold state is remembered.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null`. `tests/bench.test.js` (style of `tests/order.test.js`): `absent` — team
order kept regardless of roster order; empty team → `[]`; all present → `[]`; empty roster → whole team; stale roster
name with a matching id → excluded; returned entry carries the team's name/num. `absentTitle` — `"No vinieron (2)"` with
players, `"Equipo (3)"` with none, `"No vinieron (1)"`.
Browser (orchestrator, localhost:8001, Kevin's session, 360×640 and desktop, light and dark), reversible: Abrir a saved
game with ≥1 bench player and ≥1 absent (never "Descartar"); RF-1 row on one line; RF-2/3 No vino → toast stays,
Deshacer → row and header back; RF-4 No vino → another edit → toast gone, then Vino; RF-6/7 Vino A → end of bench, count
−1, then No vino A + Deshacer-free revert (No vino); RF-9 fold, Vino/No vino, still folded; reload → fresh lineup open
"Equipo (n)"; RF-8 with the banner: Vino → question → "Recuperar" (nothing written); RF-10 print preview; RF-11/RF-2/RF-3
keyboard-only; RF-12 phone; RF-13 Roster dialog unchanged. End by Abrir of the first saved game.

## Risks and open decisions
- RF-4 over-drops on a team rename or scoreboard edit (both pass through `save()`): accepted.
- RF-5 is practically unreachable (a team change drops the undo first); the guard stays.
- RF-8: the "agregado al partido" toast shows while the question is open, as the checkbox does today. Pre-existing.
- RF-12 value measured in T2 and confirmed in T5. Non-sticky toasts also pad the page for 3–6 s (harmless).

## Constitution check
1 Simplicity ✔ (no file but the test, no dependency) · 2 Spec rules ✔ · 3 Logic apart from UI ✔ · 4 Tests ✔ · 5 Data ✔
(no shape change) · 6 Offline ✔ (no new asset, no bump) · 7 Language ✔ · 8 Ask first ✔ (push is Kevin's).
