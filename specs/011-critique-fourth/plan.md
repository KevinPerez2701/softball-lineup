# Plan — Spec 011 critique-fourth

No code in this document. Planned 2026-11-09 by sdd-planner (fable), reviewed by the orchestrator. Line numbers are of
HEAD 5faccc2 (index.html 4891 lines, stats.js 828, view.js 147, ver.html 292, sw.js `VERSION "v9"`). RF-5 and RF-9
retired at clarify.

## Flags
- F1 **RF-7 cannot reach 44 px for the infield on the phone.** Measured in headless Chrome at 360 px (stage 326×297 px,
  every slot box 28.1 px tall, 78.2 wide): vertical edge gaps 2B→1B 0.8 px, 1B→P 1.1, P→BD 2.8, BD→C 2.8, C→field edge
  3.8, SF→2B/SS 12.0, CF/LCF/RCF→SF 28, LCF→LF 19.1, LF→SS 20.9, P→C (BD off) 33.6. With the spec's rule the tap heights
  are: **LF, CF, LCF, RCF, RF 44 · SF 40 · C 31 · BD 31 · P, 1B, 2B, 3B, SS ≈29 (unchanged)**, same in 3F/4F and SF
  on/off. The spec's rule is honored; a real infield fix needs the out-of-scope field redesign. Orchestrator: accepted
  under G2 (pre-approved); reported to Kevin.
- F2 **RF-18 labels are borderline at 360 px**: the name column is ≈50 px; `fitSlotNames` shrinks to 10 px, where
  "Jardín izq." / "Jardín cen." measure ≈50 px. T5 measures; if any still ellipsizes, T5 reports it and the orchestrator
  decides (shorter string or 9.5 px floor).
- F3 **RF-2 on desktop**: no desktop rule pads the page for a toast today. Desktop gets padding for the bar only; the toast
  moves above the bar on both layouts.
- F4 **RF-10 header text is pure**: `Stats.publicHeader(game)` in stats.js (tested).
- F5 **view.js does not change**: RF-12 is CSS (index.html + ver.html copy); RF-21 is the capture legend only.
- F6 **RF-19 by CSS only**: `.jersey.ghost{color:transparent}` on screen; the print rule at 968 (`color:#777`) wins under
  `@media print`, so "–" prints. Screen readers still hear "–" as today.
- F7 **RF-15 after an SDK import failure**: "Reintentar" reloads (010 behavior); `dbp = null` on failure so a later hash
  change retries.
- F8 **RF-1**: "Banca displayed" is CSS (`body[data-tab="orden"]` in the phone block); "details open and n ≥ 1" is JS
  (`hidden`). The `:has()` offset rules are scoped per layout so a hidden bar never shifts the toast.

## Approach
Pure text/ordering rules go to `stats.js` with Node tests (rank split, record, short names, saved title, order reason,
public header). `index.html` gains one fixed bar (copy of `#capFoot` 776–783 + the `body:has(> .toast.on)` padding pattern
903) wired into `renderAbsent` 2698–2748; coarse-pointer CSS (`::before` hit areas, gaps) in the `@media (pointer:coarse)`
block 915–924; dialog headings get `tabindex="-1"` and a focus call next to each `showModal()` (copy of 3723–3727 / 628).
`ver.html` is restructured into `load()` + `hashchange` with a sequence counter, one cached Firebase init, a header from
`Stats.publicHeader`, 760 px wrap, og tags. `sw.js` → v10.

## Modules / files
| path | responsibility | RFs |
|---|---|---|
| `stats.js` after 436 (`sortPlayers`), 509, 776–783 | `RATE_KEYS`, `rankPlayers`; `publicHeader`; `savedTitle`; `recordText`; `SHORT_POS`, `shortPos`; `orderReason` | 10, 16, 17, 18, 20, 25 |
| `tests/views.test.js`, `games.test.js` 312–314 + append, `names.test.js`, `order.test.js`, `gameview.test.js` | Node tests | NFR |
| `index.html` CSS 468–474, after 700, after 758, 903; HTML after 1461; JS 2682–2748 | check-in bar, row toggle, "Vinieron todos" first | 1–4 |
| `index.html` CSS after 504, 915–924; HTML 1336, 1360, 1370, 1390, 1450; JS 2271, 2562, 3677, 3894, 4538 | ✕ gap, slot hit areas, focus on open | 6, 7, 8 |
| `index.html` CSS after 589, after 880; JS 3459, 3637–3646, 3807–3835 | dim + note, "estadísticas", title fit, plain status, saved title | 16, 20, 22, 23, 24 |
| `index.html` CSS 392; HTML 1270–1273, 1417; JS 2021, 2046, 2061, 2085, 2326 | short slot names, empty jersey, legend, order reason | 18, 19, 21, 25 |
| `index.html` CSS 620–623 and `ver.html` 195–201 | line score cells ≥ 28 px / 4 px padding | 12 |
| `ver.html` head (after 10), 98, 209–216, script 229–291 | og tags, 760 px, header, `<title>`, "Abrir Diamante 10", hashchange | 10, 11, 13, 14, 15 |
| `sw.js` 6 | `VERSION "v10"` | NFR |

## Data model
No storage change. `users/{uid}/data/*`, `Stats.merge`, `absentSel` (010 RF-35), `players()` rows (`pa` is AP) and the
public copy shape stay. `view.js` untouched.

## Contracts
stats.js (pure, ES5):
- `Stats.RATE_KEYS = ["avg","obp","slg","ops"]`; `Stats.rankPlayers(rows, key, desc)` → `{rows, minAp}`. `minAp` =
  `ceil(max(pa)/2)` when `key` is a rate key, else 0. When `minAp`: `sortPlayers(qualified)` then `sortPlayers(rest)`
  (`pa >= minAp` qualifies; nulls last inside each group); else `sortPlayers(rows, key, desc)`. Dimmed ⇔
  `minAp && p.pa < minAp`.
- `Stats.recordText(g)` → `"Récord " + w + " G · " + l + " P · " + t + " E"`.
- `Stats.SHORT_POS` = {SS:"Short", LF:"Jardín izq.", CF:"Jardín cen.", LCF:"J. izq. cen.", RCF:"J. der. cen.",
  RF:"Jardín der.", SF:"Short field", DH:"Bat. desig."}; `Stats.shortPos(k, es)` → `SHORT_POS[k] || es`.
- `Stats.savedTitle(item)` → `item.name` without a trailing `" · " + Stats.dateLabel(item.state.date)`; if the strip
  leaves "" or the suffix is absent, the full name.
- `Stats.orderReason(rosterLen, orderLen)` → "Nadie marcado para este partido" | "El orden está vacío" | "" (first that
  applies).
- `Stats.publicHeader(game)` → `{visitor, home, v, h, sub}`: names/totals from `Stats.lineScore(game).rows` (visitor
  first); `sub` = "Ganado"/"Perdido"/"Empate" (`Stats.result`) or "Sin marcador" for 0–0, + " · " + date only when valid.

index.html:
- RF-1: static `<div id="checkBar" class="no-print" hidden><div class="checkbar-in"><button id="btnAddSel" class="btn
  btn-key" type="button"></button></div></div>` as a direct child of `body` after the toast (1461). One static click
  listener → the existing add path with `Object.keys(absentSel)`. `renderAbsent` sets `hidden = true` before its early
  return (2706); `refreshSel` (2712–2716) sets text "Agregar (n)", `aria-label` "Agregar n al partido" and
  `hidden = !(n && d.open)`; the `toggle` listener (2745) also calls `refreshSel`. Game switch empties `absentSel` (2702)
  ⇒ hidden. The in-list `addSel` (2711, 2735–2736, 2740) is removed (RF-3).
- RF-2 CSS: bar `position:fixed;left:0;right:0;z-index:50;background:var(--surface);border-top:1px solid var(--line)`;
  inner `max-width:1360px;margin:0 auto;padding:10px 18px` (desktop `bottom:0`, bottom padding `calc(10px + safe)`);
  button `min-height:44px;width:100%`. Phone: `#checkBar{bottom:calc(66px + safe)}`, `padding:10px 12px`,
  `body:not([data-tab="orden"]) #checkBar{display:none}`. Offsets (bar 64 px): desktop `(min-width:681px)`
  `body:has(> #checkBar:not([hidden])) .toast{bottom:calc(86px + safe)}`, `.wrap{padding-bottom:calc(120px + safe)}`;
  phone `body[data-tab="orden"]:has(> #checkBar:not([hidden]))` → `.toast{bottom:calc(148px + safe)}`,
  `.wrap{padding-bottom:calc(148px + safe)}`, and with `:has(> .toast.on)` → `214px`.
- RF-3: summary, then `acts` ("Vinieron todos"), then the list; `.absent-acts` → `margin:6px 0 0`.
- RF-4: `#absent .row{padding:0}` + `#absent .nm-check{padding:5px 8px}`; phone `min-height:44px;padding:7px 8px` (the
  label already wraps checkbox, jersey and name).
- RF-6: in 915–924 `#statsBody .rowacts{gap:12px}` (`#savedBody .rowacts` keeps 16).
- RF-7: in 915–924, nested `(max-width:680px)`: `.slot::before{content:"";position:absolute;left:0;right:0;
  top:calc(-1*var(--hit,0px));bottom:calc(-1*var(--hit,0px))}`; `--hit:8px` for LF/CF/LCF/RCF/RF, `6px` SF, `1px` C and
  `.dh-slot`; none for P/1B/2B/3B/SS (F1). Nothing crosses the stage edge.
- RF-8: `tabindex="-1"` on the h3 at 1336, 1360, 1370, 1390, 1450; `dialog .dlg-head h3:focus{outline:none}`; after each
  `showModal()` at 2271, 2562, 3677, 4538 and inside `if(!dlg.open)` at 3894: focus that dialog's heading.
  `openPlayerDetail` and "Ver" run after and keep their own focus.
- RF-16: 3807 → `Stats.rankPlayers(...)`; dim rows `tr.dim`, name aria-label + ", pocos AP"; note
  "Atenuados: menos de N AP" after the table only if any row is dim; CSS `#statsView tr.dim … {color:var(--ink-3)}`
  (contrast measured by T4 in light and dark, hover included, ≥ 4.5:1).
- RF-18: `phoneMq = matchMedia("(max-width:680px)")`; 2061 and 2085 → `phoneMq.matches ? Stats.shortPos(k, es) : es`;
  aria-label/title keep `p.es`. Shortcut: crossing 680 px relabels on the next `renderField`.
- RF-20/24: 3637 → `Stats.savedTitle(item)`; 3644/3646 pills → text " · Estadísticas" / " · Abierto".
- RF-21: 1417 text. RF-22: 3459 sub. RF-23: phone `#statsView .dlg-head h3{font-size:15px;letter-spacing:.02em}` (T4
  measures). RF-25: `<span class="hint" id="orderWhy" aria-live="polite">` after 1272; 2326 sets it from
  `Stats.orderReason`.
- RF-12: index.html 620–623 + ver.html 195–201: line score (`.ls`) numeric cells `min-width:28px;padding:0 4px`.

ver.html: og tags after line 10 (image `https://kevinperez2701.github.io/softball-lineup/icons/icon-512.png`);
`.wrap{max-width:760px}`; `render` builds the header from `Stats.publicHeader` (score 40 px, names wrap) and sets
`document.title = Stats.viewTitle(rec.game)`; `notFound` adds `a[href="./"]` "Abrir Diamante 10"; the script becomes
`seq` + cached `db()` (one `initializeApp`) + `load()` (title "Diamante 10", "Cargando…", drop stale responses) +
`addEventListener("hashchange", load)`.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null` (166 today). New/changed: rankPlayers (rate key: qualified first, N = 2 dims a
1-AP sub; equal AP ⇒ no dims; all-walks AVE null last in group; non-rate key ⇒ minAp 0, same order as sortPlayers);
recordText (games.test.js 312–314); savedTitle (suffix stripped, no suffix, invalid date, name = suffix only); shortPos
(8 keys, "Lanzador" unchanged); orderReason (roster 0, order 0, both set); publicHeader (visitor first, the three result
words, 0–0 "Sin marcador", no date part).
Browser (orchestrator, localhost:8001, read-only, 360×640 same-origin iframe + desktop, light + dark): RF-1–4 sizes and
visibility; RF-8 `document.activeElement` per dialog, stays on a sort header after a sort; RF-10–12 ver.html for the
published game, `#p=x.y` and a double hash change; RF-16 dims + note; RF-17–25 once each. RF-6/7 in DevTools device mode
(touch).

## Constitution check
1 Simplicity ✔ (no new file, no dependency) · 2 Spec rules ✔ (F1–F8 flagged, nothing added) · 3 Logic apart ✔ (6 pure
functions, tested) · 4 Tests ✔ · 5 Data ✔ (no format change) · 6 Offline ✔ (`VERSION` v10) · 7 Language ✔ · 8 Ask first ✔
(push by Kevin's OK; no rules/auth change).

## Orchestrator review
- F1 accepted: RF-7 rule honored; the infield stays ≈29 px. Reported to Kevin with the G2 summary.
- T6's "Done when" rewritten (ver.html is checked in the browser by the orchestrator; the task traces it).
- Every task keeps to its line ranges; nothing outside an RF was added.
