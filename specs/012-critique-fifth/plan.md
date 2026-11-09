# Plan — Spec 012 critique-fifth

No code in this document. Planned 2026-11-09 by sdd-planner (fable), reviewed by the orchestrator. Line numbers are of
HEAD 2b34624 (index.html 4959 lines, ver.html 333, view.js 147, stats.js 866, sw.js `VERSION "v10"`; suite 176 green).

## Flags
- F1 **RF-1 dark hover**: today `.btn-default:hover` fills `--surface-2` in both themes. Dark stays exactly as today
  (hover keeps `--surface-2`) via a third token `--sel-hover`. Orchestrator: accepted (keep).
- F2 **ver.html has no `[data-theme="dark"]` block**; new tokens go in its two blocks only; its dark is checked by
  emulating `prefers-color-scheme: dark`.
- F3 **RF-4 h1 = the whole row** (three spans); `" "` text nodes between them so a screen reader reads
  "MSO 8 – 17 Call" (whitespace nodes render nothing in the flex row).
- F4 **RF-6 `updatedAt` is outside `json`**: `render` gains a second argument (ms or null) from `snap.data().updatedAt`.
- F5 **view.js**: only the comment at 121 ("borde lima") changes.

## Approach
Theme-scoped selected state via three tokens defined per theme block (as `--focus` is re-scoped), so `.btn-default`
stays one rule per file. RF-3 is one body class toggled in `renderRoster` (~2388) plus one CSS `order` rule. RF-7 copies
the 011 RF-25 pattern (`#orderWhy`) onto `.field-head`. RF-4–6 are local edits to `ver.html` `header`/`render`. Two pure
functions in `stats.js` with Node tests. `sw.js` → v11.

## Modules / files
| path | responsibility | RFs |
|---|---|---|
| `stats.js` after 807 (`orderReason`) | `Stats.fieldReason`, `Stats.updatedText` | 6, 7 |
| `tests/order.test.js` after 41; `tests/games.test.js` after 261 | Node tests | NFR |
| `index.html` CSS 27–58, 59–88, 89–116 (tokens); 190–192; after 361; 373–374 | `--sel-bg/--sel-line/--sel-hover`; `.btn-default`; `.game-empty` order; `.field-head .hint` | 1, 2, 3, 7 |
| `index.html` HTML 1180, 1331; JS 2385–2388, 3184, 3891–3892 | `#fieldWhy`, `#benchCard`, body class, reasons, note above table, comment | 3, 7, 8 |
| `ver.html` tokens 21–52, 53–82; 114–116; 218–220; `header` 263–271; `render` 272–287; 321 | tokens + `.btn-default`; h1 row; casing; footer | 1, 4, 5, 6 |
| `view.js` 121 | comment | 1 |
| `sw.js` 6 | `VERSION "v11"` | NFR |

## Data model
No storage change. The public copy `{json, updatedAt}` is only read (`Timestamp.toMillis()`).

## Contracts
- `Stats.fieldReason(rosterLen, assignedLen)` → "Nadie marcado para este partido" (rosterLen 0) | "El campo está vacío"
  (assignedLen 0) | "".
- `Stats.updatedText(ms)` → `" · actualizado " + Stats.fmtDateTime(new Date(ms))` when `ms` is a finite number, else "".
  (The spec's `footerText` equivalent: the text after the "Diamante 10" link.)
- index.html RF-1/2: light block `--sel-bg:var(--accent-soft);--sel-line:var(--accent-text);--sel-hover:var(--accent-soft)`;
  both dark blocks `--sel-bg:transparent;--sel-line:var(--accent);--sel-hover:var(--surface-2)`; `.btn-default{background:
  var(--sel-bg);border:2px solid var(--sel-line);color:var(--ink);padding:5px 10px}`, hover `background:var(--sel-hover);
  border-color:var(--sel-line)`; comments at 190 and 3184 rewritten. RF-2 needs no code (`:focus-visible` outline is
  independent of border/background).
- RF-3: `id="benchCard"` on the Banca section (1331); CSS after 361 `body.game-empty .rail > #benchCard{order:-1}`; JS
  before 2388 `document.body.classList.toggle("game-empty", !S.roster.length && !!TEAM.length)` (every renderAll).
- RF-7: after 1180 `<span class="hint no-print" id="fieldWhy" aria-live="polite"></span>`; 373–374 selectors extended to
  `.field-head .hint`; after 2385 `$("fieldWhy").textContent = Stats.fieldReason(S.roster.length, assignedIds().length)`.
- RF-8: move the `if(anyDim)` note (3892) before `body.appendChild(wrap)` (3891).
- ver.html: tokens and `.btn-default` copied; `header` row is `el("h1","hd-row")` with `" "` text nodes; CSS `margin:0;
  font:inherit` on `.hd-row`; `.hd-name` loses `text-transform:uppercase`; `render(rec, ms)` with
  `ms = d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : null`; footer `<p class="pub-foot"><a href="./">
  Diamante 10</a>` + text `Stats.updatedText(ms)` appended last (under the visible table);
  `.pub-foot{margin:24px 0 0;font-size:12.5px;color:var(--ink-3)}`. `notFound`/`failed` never call `render`.

## Algorithms / rules
- Light contrasts: border `#5d6b00` on `#fff` 5.9:1, on the fill `#eef5b4` 5.1:1; text `#141c16` on the fill 15.2:1.
- `fieldReason` precedence: roster empty, then field empty.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null` (176 → 178). `fieldReason`: (0,0), (0,2) → "Nadie…"; (5,0) → "El campo está
vacío"; (5,3) → "". `updatedText`: `new Date(2026,10,6,20,15).getTime()` → " · actualizado 06/11/2026 · 8:15 p. m.";
`new Date(2026,0,1,0,0)` → "… 01/01/2026 · 12:00 a. m."; `null`, `undefined`, `NaN` → "".
Browser (orchestrator, localhost:8001, read-only, 360×640 + desktop, light via `data-theme="light"` / emulation, dark):
RF-1 computed colors on the Estadísticas tabs, a picker chip, ver.html toggles, hover; RF-2 Tab onto a selected chip;
RF-3 order on an empty game and back; RF-4 one h1 on ver.html, none on `#p=x.y`; RF-5 casing; RF-6 footer text; RF-7
both strings; RF-8 note above the table. Print of the field card unchanged.

## Constitution check
1 Simplicity ✔ · 2 Spec rules ✔ (F1–F5 flagged, nothing added) · 3 Logic apart ✔ (2 pure functions, tested) · 4 Tests ✔
· 5 Data ✔ (read-only `updatedAt`) · 6 Offline ✔ (v11) · 7 Language ✔ · 8 Ask first ✔ (deploy pre-approved by Kevin).

## Orchestrator review
- F1 keep accepted. Implementer tasks do not start servers; every browser check moves to T5 (the orchestrator).
- T2 does not depend on T1 and runs with it; T3 and T4 start from T1's commit.
