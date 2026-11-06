# Spec 005 — Faster scoring: fielder's choice ("JS"), grouped result picker, undo a deleted turn

Status: in-progress (G1 + G2: Kevin 2026-11-06, "Sí, apruebo e implementa")
Created: 2026-11-06 · Clarified: 2026-11-06 (clarifier READY, 0 blocking, 3 minor — applied)

## Context and goal
Kevin's paper scorebook marks a fielder's choice as "JS" (jugada de selección): the batter reaches base because the
defense put out (or tried to put out) another runner. The result picker has no such result, so on 2026-11-06 the JS
of Elias Colmenarez in the 5th inning of "MSO vs Call 2 · 05/11/2026" was entered as Rolling (the other JS of that
game turned out to be a hit): the numbers come out right, an at-bat without a hit, but the sheet no longer says what
happened. The impeccable critique of the same day (29/40) adds two capture problems on the same screen: the 11
result chips are one ungrouped block (BB and K sit next to Rolling and Fly, "E" reads as an out), and deleting a turn
from a cell is instant with no way back except discarding the whole sheet. Kevin chose to fix the three together.

## Users / actors
- The signed-in manager (Kevin), transcribing the paper scorebook after the game (specs 001 and 002).

## User stories
- US-1: As the manager I want to enter a fielder's choice as "JS", so the sheet reads like my paper scorebook.
- US-2: As the manager I want a JS to count by the official rule, so the averages are right.
- US-3: As the manager I want the results grouped by what happened to the batter, so I find the right one at a glance.
- US-4: As the manager I want to undo a turn I deleted by mistake without losing the rest of the sheet.

## Functional requirements (acceptance criteria in EARS)
Amends spec 001 Definitions (result codes) and RF-2 (now 12 picker results), and spec 004 RF-5/RF-6 (picker
layout), the way spec 004 RF-5 did.
- RF-1: THE SYSTEM SHALL offer the result `JS` in the result picker (free cell tap and guided mode) with the picker
  and cell label "JS", and SHALL give only that chip the `title` and `aria-label` "Jugada de selección", stored in
  its `Stats.CODES` entry.
- RF-2: THE SYSTEM SHALL show a PA with code `JS` as "JS" in the grid cells and in the player detail sequence, with
  the run mark "•" after it when the batter scored (spec 001 RF-3).
- RF-3: THE SYSTEM SHALL count a `JS` PA as a plate appearance (AP) and an at-bat (VB), not as a hit nor as an
  on-base event: it adds to the denominators of AVE, OBP and SLG and to none of their numerators.
- RF-4: THE SYSTEM SHALL use 1 as the default "Outs en la jugada" for `JS` (spec 002 RF-6: the user may pick 0–3;
  `outs` is stored only when it differs from 1). Picking JS does not open "Más detalles" (it is not in the spec 004
  RF-42 list HR/SF/BO).
- RF-5: THE SYSTEM SHALL keep every stored PA unchanged: no existing `RO` or other code is converted to `JS`.
- RF-6: THE SYSTEM SHALL lay out the result picker in four labeled rows, in this order: "Hit" (1B, 2B, 3B, HR);
  "Se embasa" (BB, E, JS); "Out" (K, Rolling, Fly, Línea); "Sacrificio" (Fly sac.). WHEN an existing PA holding the
  retired `BO` is edited, its chip SHALL appear at the end of the "Out" row (spec 004 RF-6).
- RF-7: WHEN the user deletes a PA or a runner out with "Borrar" in a cell's list, THE SYSTEM SHALL remove it at once
  (renumbering as spec 002 RF-10) and show "Turno borrado" (or "Out corriendo borrado") with "Deshacer".
- RF-8: WHEN the user taps "Deshacer" of RF-7, THE SYSTEM SHALL restore the sheet's rows exactly as they were before
  that deletion (the item, its `ord` and the `ord` of the others in that inning) and redraw the grid.
- RF-9: IF the sheet changes again (another PA, edit, deletion, row or inning change) or the sheet closes before
  "Deshacer" is tapped, THEN THE SYSTEM SHALL drop that undo (the notice goes away), so an undo never overwrites a
  later change.

## Non-functional requirements
- Code, default outs, the picker groups and the AVE/OBP/SLG counts are pure logic in `stats.js`, covered by
  `node --test 'tests/*.test.js'`. The undo snapshot is UI state in `index.html`, checked in the browser.
- Same phone rules as spec 001: chips keep ≥ 44 px targets; the four rows fit a 360 px phone without horizontal
  scroll. No change to `firestore.rules` or to the stored record shape (`code` is already a free string). `sw.js`
  needs no new asset (stats.js and the page are network-first).

## Edge cases
- A JS with 0 outs (all safe on the throw) or 2 outs (double play, batter safe): outs picked by hand, still an
  at-bat without a hit.
- A JS that scores a run later in the inning: run mark as for any PA.
- A device still on the previous version opens a record holding `JS`: the cell shows the raw code "JS" (cellLabel
  falls back to the code) and the stats count it as RF-3; its inning outs read one less (the old default for an
  unknown code is 0) until that device updates. If that old device edits and saves a JS stored with `outs: 0`, the
  value is dropped and the new version reads 1 out. Accepted: both need an outdated device, and the service worker
  takes the new `stats.js` on the next online start.
- Deleting in the guided mode's picker: the guided mode has no "Borrar" (deletions happen from a cell's list), so
  RF-7–9 apply to the cell list only.
- Two deletions in a row: each one replaces the previous undo (RF-9); "Deshacer" restores only the last one.

## Out of scope
- Converting older Rolling entries automatically (RF-5). The one known case, Elias Colmenarez's 5th-inning PA in
  "MSO vs Call 2 · 05/11/2026", is edited by hand after the deploy (post-deploy check, not a spec-close gate).
- Tracking which runner was put out, or the base.
- Any new stats column. The other critique items (stats on phone, keyboard/screen reader, lime meaning, labels) go to
  later specs.

## Done criteria
- RF-1–RF-6 green in node tests (`Stats.PICK_CODES`/groups, `Stats.cellLabel`, `Stats.players`/`playerGames`,
  `Stats.defaultOuts`); browser check at 360 px and desktop: four labeled rows with JS in "Se embasa", JS title,
  JS in cell and player detail, delete → "Deshacer" restores the turn and its numbering, a later change drops it.
- After the deploy: Elias's 5th-inning PA of 05/11 converted to JS.

## Open questions
- (none — answered by Kevin 2026-11-06: label "JS" in picker and cell; official rule (AB, no hit, not on base);
  default 1 out; convert the 05/11 PA by hand after the deploy; group the picker in this spec; take every critique
  item, stats on phone first.)
