# Spec 001 — Game stats (scorebook transcription and batting stats)

Status: in-progress (G2 approved 2026-10-23; G1 approved by Kevin 2026-10-23)
Created: 2026-10-23 · Clarified: 2026-10-23 (2 rounds)

## Context and goal
After each game Kevin has the paper scorebook in hand and wants to keep a record. Today the app only keeps the
lineup and the runs per inning. This feature lets him transcribe the scorebook into the app, one plate
appearance (PA) at a time in a grid shaped like the paper sheet, and then see batting stats per player and per
game that the app calculates by itself. Part A is capture and save; part B is views and calculations.

## Users / actors
- The signed-in user (team manager / scorekeeper), after the game, on a phone or a desktop browser. Same account
  model as today: each user sees only their own data.

## User stories
- US-1: As the manager I want to copy the scorebook into a grid that looks like the paper sheet, so that
  transcribing takes minutes and needs no arithmetic.
- US-2: As the manager I want the app to tell me when an inning's runs do not match the scoreboard, and let me
  fix either side, so that I catch transcription mistakes.
- US-3: As the manager I want batting stats per player (AVE, OBP, SLG, OPS…), so that I can decide the order.
- US-4: As the manager I want a game history with results, so that I can see the team's record and fix an old
  sheet.

## Definitions
- **Result codes** (one per PA), stored code → label in the picker → label in a grid cell and in sequences:
  `1B`, `2B`, `3B`, `HR`, `BB`, `K` → same text in all three places; `RO` → "Rolling" → "Rol"; `FL` → "Fly" →
  "Fly"; `LI` → "Línea" → "Lín"; `E`, `BO`, `SF` → same text in all three places.
- **PA**: `{inn, code, run, rbi, sb}`. `inn` is the inning (1-based); `run` = the batter scored (default off);
  `rbi` 0–4 (default 0); `sb` stolen bases 0–3 (default 0). A row's PAs keep their entry order; within one inning
  that order is the cell's first and second PA.
- **Record** (one per game): `id`, `savedAt` (ISO UTC, set on every save), game data `{date, team, opp, home,
  innings, us[], them[]}`, and rows `[{pid, num, name, pos, pas[]}]` where `pos` is the internal position key
  (`DH` for the designated hitter) or `null` when the player only bats.
- **Deletion marker**: `{id, deletedAt}` kept in place of a deleted record so sync never restores it.
- **Formulas**: PA = number of PAs. AB = PA − BB − SF. H = 1B + 2B + 3B + HR. TB = 1B + 2·2B + 3·3B + 4·HR.
  AVE = H / AB. OBP = (H + BB) / (AB + BB + SF). SLG = TB / AB. OPS = OBP + SLG. G (JJ) = records where the player
  has ≥ 1 PA. R = PAs with `run`. RBI = Σ `rbi`. SB = Σ `sb`. K = PAs with code `K`.
- **Game score and result**: score = Σ `us` – Σ `them` of the record's stored game data. Result W/L/T, shown as
  G (ganado) / P (perdido) / E (empate).
- **Link**: the current game state carries `S.statsId`, the id of its record (absent in older states).

## Functional requirements (acceptance criteria in EARS)

### Part A — capture and save
- RF-1: WHEN the user taps "Anotar estadísticas" (in the game/score panel: the Juego tab on phone, the score panel
  on desktop) and `S.statsId` names no existing record, THE SYSTEM SHALL open the capture screen for a new record
  with game data copied from the current game and one row per player in `S.order`, in that order, each showing
  number, name and position (`BD` for the designated hitter, `—` when the player only bats).
- RF-2: WHEN the user taps an empty grid cell, THE SYSTEM SHALL open a picker with the 12 result labels, the
  `run` toggle, `rbi` 0–4 and `sb` 0–3 at their defaults; confirming requires a result code and shows the cell
  label (with a mark when `run` is on).
- RF-3: WHEN the user taps a filled cell, THE SYSTEM SHALL let them edit any of its PAs.
- RF-27: WHEN the user deletes a PA from a filled cell, THE SYSTEM SHALL remove only that PA.
- RF-28: WHILE a cell holds 1 PA, THE SYSTEM SHALL offer "Otro turno en este inning"; a cell holds at most 2 PAs
  and the option is hidden at 2.
- RF-4: WHEN the user taps "Agregar sustituto" on a row, THE SYSTEM SHALL let them pick a team-roster (`TEAM`)
  player who has no row in the sheet and insert them as a new row right below, with position `—`, without
  changing `S.order`.
- RF-29: WHEN the user removes a row that has no PAs, THE SYSTEM SHALL drop it from the sheet; rows with PAs
  cannot be removed (their PAs must be deleted first).
- RF-30: THE SYSTEM SHALL show in the capture screen the open record's date and our and their runs per inning,
  all editable, plus +/− inning buttons (minimum: the larger of 3 and the highest inning holding a PA; maximum 12).
- RF-38: THE SYSTEM SHALL keep the open record's `innings`, `us` and `them` the same length as the columns shown
  (RF-31), padding with 0.
- RF-5: THE SYSTEM SHALL compute, for every inning `inn`, the number of PAs with `run` in that inning and compare
  it with `us[inn − 1]` of the open record's game data (RF-30).
- RF-6: IF an inning's count differs, THEN THE SYSTEM SHALL mark that inning's column header in red with the
  signed difference sheet − scoreboard (e.g. `+1`, `−2`) and still allow saving.
- RF-31: THE SYSTEM SHALL show one column per inning up to the larger of the game's innings and the highest
  inning that holds a PA.
- RF-7: WHEN the user taps "Guardar", THE SYSTEM SHALL store the record with a new `savedAt`, set `S.statsId` to
  its id when it was opened from the current game, and show "Estadísticas guardadas".
- RF-32: WHEN a record opened from the current game is saved, THE SYSTEM SHALL also write its `date`, `innings`,
  `us` and `them` back to the current game — only if, at save time, the current game is still linked as it was
  when the screen opened (same `S.statsId`, or still none for a new record); otherwise only the record is saved.
- RF-39: IF either write of a save (the record, or the current game under RF-32) fails, THEN THE SYSTEM SHALL keep
  neither and apply RF-15.
- RF-33: IF the sheet has no PA (including a saved record whose PAs were all deleted), THEN THE SYSTEM SHALL not
  save and SHALL show "Anota al menos un turno"; a game is removed only through RF-25.
- RF-34: IF the game data has no date, THEN THE SYSTEM SHALL not save, SHALL show "Ponle fecha al juego" and keep
  the capture screen open with the data intact (the date is editable there, RF-30).
- RF-8: WHEN the user taps "Anotar estadísticas" and `S.statsId` names an existing record, THE SYSTEM SHALL open
  that record with its game data refreshed from the current game and its rows kept as stored; players in
  `S.order` without a row are appended at the end; no row is removed; positions of existing rows are kept.
- RF-9: WHEN a saved lineup whose state carries `statsId` is opened and the user taps "Anotar estadísticas", THE
  SYSTEM SHALL behave as RF-8. A lineup saved before its stats existed carries no `statsId` and RF-1 applies.
- RF-10: WHEN the user starts a new lineup ("Alineación nueva"), THE SYSTEM SHALL clear `S.statsId`; existing
  records are not changed.
- RF-35: IF `S.statsId` names a record that does not exist on this device (deleted, or not synced yet), THEN
  THE SYSTEM SHALL apply RF-1 and replace `S.statsId` on save.
- RF-36: THE SYSTEM SHALL keep at most one row per player id in a record.
- RF-11: IF the user closes the capture screen and the sheet or scoreboard differs from what was opened, THEN
  THE SYSTEM SHALL ask "¿Salir sin guardar? Se pierden los cambios." before discarding.
- RF-12: IF `S.order` is empty and `S.statsId` names no existing record, THEN THE SYSTEM SHALL not open the
  capture screen and SHALL show "Primero arma el orden al bate".
- RF-13: THE SYSTEM SHALL keep records and deletion markers in a new document `users/{uid}/data/stats`, with the
  same local copy, offline behavior and sync as `current`/`team`/`saved` (saved offline, uploaded when the
  connection returns, removed from the device on logout only after the server confirms it).
- RF-14: WHEN this device's stats and the cloud's differ (first sync or any later remote change while this device
  has unsent changes), THE SYSTEM SHALL merge them by record id, keeping for each id the entry (record or
  deletion marker) with the later `savedAt`/`deletedAt` (on a tie the deletion marker wins); ids present on one
  side only are kept. Timestamps come from device clocks; skew between devices is accepted.
- RF-15: IF saving fails on this device (storage full or unavailable), THEN THE SYSTEM SHALL show "No se pudo
  guardar en este navegador" and keep the capture screen open with the data intact.
- RF-16: THE SYSTEM SHALL include records and deletion markers in the "Respaldo" text export; on import it SHALL
  merge them with RF-14's rule; a backup without them leaves existing records untouched.
- RF-37: WHILE the capture screen is open, THE SYSTEM SHALL not replace the open sheet when a remote change
  arrives; saving merges by RF-14, and RF-32 writes to the current game as it is at save time.

### Part B — views and calculations
- RF-17: WHEN the user picks "Estadísticas" in the ☰ menu, THE SYSTEM SHALL open the stats screen with two views:
  "Jugadores" and "Juegos".
- RF-18: THE SYSTEM SHALL show in "Jugadores" one row per player id with ≥ 1 PA across all records, columns
  JJ, AP, VB, H, 2B, 3B, HR, CA, CI, BB, K, BR, AVE, OBP, SLG, OPS (formulas in Definitions), plus a team totals
  row whose counts are sums, whose JJ is the number of records, and whose rates come from the summed counts.
- RF-19: THE SYSTEM SHALL show rates rounded half-up to three decimals with no leading zero (`.333`, `1.083`),
  `—` when the denominator is 0, and OPS as `—` when OBP or SLG is `—`.
- RF-20: WHEN the user taps a column header in "Jugadores", THE SYSTEM SHALL sort by it (numbers descending, name
  ascending; tapping again reverses); `—` sorts last in both directions; ties always break by name ascending;
  default AVE.
- RF-21: THE SYSTEM SHALL label a player with the current `TEAM` name and number, or with the name and number of
  their newest record (RF-23 order) if the id is no longer in `TEAM`.
- RF-22: WHEN the user taps a player row, THE SYSTEM SHALL show that player's line per game (date, opponent,
  VB, H, CA, CI, BB, K, and the sequence of cell labels in inning order) in RF-23 order, with their totals.
- RF-23: THE SYSTEM SHALL show in "Juegos" every record newest first by date (same date: later `savedAt` first),
  with date, opponent, score and result (G/P/E), and above the list the team record (G-P-E) and total runs for
  and against.
- RF-24: WHEN the user taps a game in "Juegos", THE SYSTEM SHALL open its sheet in the capture screen with the
  game data stored in the record; IF its id equals `S.statsId`, THEN THE SYSTEM SHALL behave as RF-8 instead
  (game data refreshed from the current game, RF-32 applies).
- RF-25: WHEN the user deletes a game in "Juegos", THE SYSTEM SHALL ask "¿Borrar las estadísticas de este juego?
  No se puede deshacer." and, on confirm, replace the record with a deletion marker so it drops from every stat.
- RF-26: IF there are no records, THEN THE SYSTEM SHALL show "Todavía no hay juegos anotados" in both views.

## Non-functional requirements
- Calculations (RF-5, RF-6, RF-18–RF-23 numbers, RF-19 formatting, RF-20 sort) and the merge (RF-14, RF-16) are
  pure functions in `stats.js`, loaded by `index.html` without a build and loadable by Node, covered by
  `node --test 'tests/*.test.js'` (constitution 1, 3, 4).
- Phone width (≥ 360 px): the grid may scroll horizontally, the batter column stays fixed, nothing else on the
  page scrolls horizontally; tap targets ≥ 40 px.
- Offline (constitution 6): `stats.js` is in `sw.js` `ASSETS` and `VERSION` is bumped.
- Backward compatible (constitution 5): states without `statsId` and accounts without a `stats` document load as
  today.
- All on-screen text in Latin American Spanish. No change to `firestore.rules`.

## Edge cases
- Player in the order with no PA (game ended early): their row stays, counts nothing, JJ does not count it.
- Player renamed or renumbered after the game: views show the current name (RF-21).
- Player deleted from the roster and re-added gets a new id: their stats show as two players. Accepted.
- A PA with `run` on an out is allowed (scorer's call).
- A record saved on device A after device B deleted it comes back if A's `savedAt` is later than B's
  `deletedAt` (the later action wins, RF-14).
- Two devices saving the same game for the first time offline, each without a `statsId`, create two records; the
  user deletes one. Accepted.
- Size: about 2–3 KB per game; one Firestore document (1 MB) holds about 300 games. Accepted risk for this
  iteration; a local storage failure is covered by RF-15.

## Out of scope
- Pitching stats (deferred), opponent stats, defensive stats, spray chart, CSV/PDF export, season or tournament
  grouping and filters, numeric scorer notation (6-3, F8), live in-game scoring, sacrifice bunts, hit by pitch,
  purging old deletion markers.

## Done criteria
- Every RF has a green test in `node --test 'tests/*.test.js'` where it is logic, or a checked step in the manual demo where
  it is UI.
- Manual demo on a phone: transcribe a 7-inning game with one substitute and one deliberate run mismatch, fix it
  on the scoreboard row, save, reopen and edit it, check the player table and the game history by hand, delete
  the game.
- Offline: save a record with the network off, reload, turn the network on, see it on a second device; add a
  different record on each of two offline devices and see both after they sync.

## Open questions
- (none)
