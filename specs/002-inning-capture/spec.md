# Spec 002 — Inning-by-inning capture with outs

Status: planned (G1 pre-approved by Kevin 2026-10-23; G2 waits for Kevin). The product
decisions below are the orchestrator's, recorded as assumptions.
Created: 2026-10-23

## Context and goal
Spec 001 lets the manager fill any cell of the scorebook grid in any order. Transcribing the first real game,
Kevin lost the batting sequence (a turn went into the wrong inning) and had nowhere to record outs that are not the
batter's: a double play (batter and runner out), a runner caught stealing, a runner out by a baserunning mistake.
This spec adds a guided mode that follows the batting order inning by inning and keeps the outs of each inning,
counting outs on the play and outs on the bases.

## Users / actors
- The signed-in manager, after the game, transcribing the paper scorebook (same as spec 001).

## User stories
- US-1: As the manager I want the sheet to put up the batter who is due, so I cannot lose the batting sequence.
- US-2: As the manager I want to record how many outs a play made (double play, triple play).
- US-3: As the manager I want to record a runner put out on the bases (caught stealing, picked off, baserunning
  mistake), so those outs count in the inning and show on the runner's line.
- US-4: As the manager I want to see the outs of each inning and the order of the turns.

## Definitions
- **Outs on a PA** (`outs`, 0–3): outs made on that play. Default by result: `K`, `RO`, `FL`, `LI`, `SF`, `BO` → 1;
  `1B`, `2B`, `3B`, `HR`, `BB`, `E` → 0. `outs` is stored only when it differs from the default; a PA without it
  (all spec 001 data) uses the default.
- **Runner out** (`{inn, kind}` in the runner's row list `row.ro`): an out made on the bases, not on a PA. Kinds and
  labels (picker / cell / sequence): `CS` "Atrapado robando" / "AR"; `PO` "Sorprendido en base" / "Sor"; `OB` "Out
  corriendo las bases" (baserunning mistake, interference, passed a runner…) / "OC".
- **Inning outs**: Σ outs of the PAs of that inning + number of runner outs of that inning.
- **Turn order** (`ord` on a PA, 1-based): position of the PA within its inning. It is not editable and a PA does
  not change inning (accepted: a turn added later lands at the end of the inning's sequence).
- **Sub flag** (`sub: true` on a row): set on rows added with "Agregar sustituto" from this spec on. Rows of spec 001
  records have no flag.
- **Batting slot**: a row without `sub` plus the `sub` rows directly below it. The slot's **active row** is the
  lowest row of the slot holding ≥ 1 PA, or the slot's first row if none does.
- **Due batter**: the active row of the slot after the anchor's slot, wrapping to the first slot. Anchor: the row of
  the most recent PA entered in the guided mode during this opening of the sheet; if none (or it was deleted), the
  row of the PA with the highest `ord` in the latest inning holding a PA with `ord`; if none, there is no anchor and
  the due batter is the active row of the first slot.

## Functional requirements (acceptance criteria in EARS)
- RF-1: WHEN the user taps "Anotar por inning" in the capture screen, THE SYSTEM SHALL start the guided mode at the
  first inning (column) with fewer than 3 outs; if every column has 3 or more, it SHALL apply RF-4's last-column rule.
- RF-2: WHILE the guided mode is on, THE SYSTEM SHALL show the result picker (spec 001 RF-2) for the due batter and
  the current inning, headed by the inning, its outs and "Al bate: <num · name>", with the actions "Otro bateador",
  "Out corriendo" and "Terminar"; "Cancelar" and closing the picker SHALL act as "Terminar".
- RF-3: WHEN the user confirms a PA in the guided mode, THE SYSTEM SHALL add it to the due batter's row with
  `ord` = (number of PAs with `ord` in that inning) + 1, make it the anchor, and put up the next due batter.
- RF-4: WHEN an inning's outs become 3 or more in the guided mode (by a PA or a runner out), THE SYSTEM SHALL move
  to the next inning keeping the due batter; IF that inning is the last column, THEN THE SYSTEM SHALL ask "¿Hubo
  otro inning?" and add a column (up to 12) only on "Sí"; on "No", or at 12, it SHALL apply RF-15.
- RF-5: WHEN the user taps "Otro bateador", THE SYSTEM SHALL list every row (num · name) plus "Agregar sustituto"; a
  chosen row becomes the batter for this PA (the sequence continues after it); "Agregar sustituto" applies spec 001
  RF-4 under the due batter's row, with `sub: true`, and that new row bats now.
- RF-6: THE SYSTEM SHALL show "Outs en la jugada" (0–3) in the result picker, in the guided mode and in the free cell
  tap: preset to the stored `outs` when editing, else to the result's default; changing the result resets it to the
  new result's default; the PA stores `outs` only when it differs from the default.
- RF-7: WHEN the user picks "Out corriendo" in the guided mode, THE SYSTEM SHALL ask for the runner (any row) and the
  kind, and add the runner out to that row in the current inning, keeping the due batter, then apply RF-4.
- RF-8: THE SYSTEM SHALL show under each inning header "<n> out", and "⚠ <n> out" for every inning before the last
  inning holding a PA or runner out whose outs ≠ 3; this mark is independent of the run difference (spec 001 RF-6)
  and never blocks saving.
- RF-9: THE SYSTEM SHALL show in a cell each PA as "<ord> <label>" (ord small, before the label; the run mark stays
  after the label) and, after the PAs, the runner outs of that row and inning by their cell label.
- RF-10: WHEN the user deletes a PA that has `ord`, THE SYSTEM SHALL decrease by 1 the `ord` of the PAs of that
  inning with a higher `ord`; PAs without `ord` are not changed.
- RF-11: WHEN a PA is added outside the guided mode (spec 001 RF-2 or RF-28), THE SYSTEM SHALL give it `ord` =
  (number of PAs with `ord` in that inning) + 1.
- RF-12: THE SYSTEM SHALL keep spec 001 records valid and unchanged unless the user edits them: no `outs` → default,
  no `ord` → no number, no `ro` → no runner outs, no `sub` → its own slot; confirming an unchanged PA changes nothing.
- RF-13: THE SYSTEM SHALL show runner outs in the player detail sequence (spec 001 RF-22) by their label, after the
  PAs of the same inning, and SHALL NOT count them as plate appearances or at-bats.
- RF-14: THE SYSTEM SHALL add a column "AR" (times caught stealing, kind `CS` only) right after "BR" in the players
  table and its totals row, sortable as an integer (spec 001 RF-20).
- RF-15: WHEN the user taps "Terminar" (or RF-4 ends the mode), THE SYSTEM SHALL leave the guided mode and show the
  grid; the anchor is kept while the sheet stays open.
- RF-16: WHEN the user taps a cell holding a PA or a runner out, THE SYSTEM SHALL list the PAs (spec 001 RF-3/27/28)
  and the runner outs, each runner out with "Borrar"; the picker of an empty cell SHALL also offer "Out corriendo",
  adding a runner out (kind asked) to that cell's row and inning.
- RF-17: THE SYSTEM SHALL treat runner outs like PAs for the minimum innings (spec 001 RF-30) and for row removal
  (spec 001 RF-29): a column or row holding a runner out cannot be removed.
- RF-18: THE SYSTEM SHALL list in "Jugadores" every player with ≥ 1 PA or runner out; JJ counts records where the
  player has either; a player with only runner outs shows AP and VB 0; the player detail shows those games too.
- RF-19: IF the due batter already has 2 PAs in the current inning, THEN THE SYSTEM SHALL skip to the next slot.
- RF-20: IF the user closes the capture screen while the guided mode is on, THEN THE SYSTEM SHALL drop the guided
  state and apply spec 001 RF-11.
- RF-21: THE SYSTEM SHALL keep spec 001 RF-33: a sheet with runner outs but no PA is not saved ("Anota al menos un
  turno").

## Non-functional requirements
- Default outs, inning outs, slots, due batter (anchor passed as a parameter), `ord` assignment and renumbering,
  minimum innings with runner outs, and the AR/players counts are pure functions in `stats.js`, covered by
  `node --test 'tests/*.test.js'`.
- Same phone rules as spec 001. `sw.js` `VERSION` bumped. No change to `firestore.rules`.

## Edge cases
- Walk-off or game ended early: the last inning may have fewer than 3 outs, no warning (RF-8).
- More than 3 outs in an inning: shown with ⚠, nothing blocked.
- A runner out by a player who never batted (pinch runner): allowed; RF-18 lists him.
- Old records with a substitute row (no `sub`): that row is its own slot; the manager uses "Otro bateador".

## Out of scope
- Base-by-base runner tracking, automatic runs/RBI/LOB, pitching stats, numeric fielding notation, live scoring,
  editing `ord` or moving a PA to another inning.

## Done criteria
- Logic RFs have green node tests; manual demo: a 7-inning game in the guided mode with a double play, a caught
  stealing ending an inning, a substitute added from "Otro bateador"; headers show 3 outs per inning; cells show the
  turn order; the player detail shows "AR"; the players table shows AR.

## Open questions
- (none — assumptions: outs defaults; BO = 1 out; runner-out kinds CS/PO/OB with labels AR/Sor/OC; only AR gets a
  column; sub flag only for new substitutes.)
