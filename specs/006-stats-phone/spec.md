# Spec 006 — Batting stats that read first on the phone

Status: clarified (G1: Kevin 2026-11-06, "cuando esté listo implementa de una vez en paralelo lo que puedas")
Created: 2026-11-06 · Clarified: 2026-11-06 (clarifier NEEDS WORK: 1 blocking, 6 minor — applied; the blocking
placement decided by the orchestrator: between K and Turnos, the closest place to the names on a phone)

## Context and goal
The impeccable critique of 2026-11-06 (29/40, priority issue P1) found that on a phone the Jugadores table opens on
JJ, AP, VB and H: the column it is sorted by (AVE) and every rate column sit off screen, so the ranking looks arbitrary
and the number Kevin asks for ("¿quién está bateando?") needs a sideways scroll. The player detail shows counts per game
but no average at all. This spec puts the rates first and adds them to the player detail. Kevin chose (2026-11-06):
rates first, no minimum of plate appearances for the ranking, AVE/OBP/OPS in the player detail's Total row.

## Users / actors
- The signed-in manager (Kevin), mostly on the phone, reading Estadísticas after a game.

## User stories
- US-1: As the manager I want to see each player's average without scrolling sideways on the phone.
- US-2: As the manager I want a player's AVE, OBP and OPS in his own detail, without going back to the table.

## Functional requirements (acceptance criteria in EARS)
Amends spec 001 RF-18 (column order) and RF-22 (player detail columns); the amendment is noted in spec 001. Spec 002
RF-14 ("AR" right after "BR") still holds.
- RF-1: THE SYSTEM SHALL show the "Jugadores" table columns in this order: Jugador, AVE, OBP, SLG, OPS, JJ, AP, VB,
  H, 2B, 3B, HR, CA, CI, BB, K, BR, AR; the "Equipo" totals row and the "Qué significa cada columna" key SHALL follow
  the same order.
- RF-2: THE SYSTEM SHALL keep sorting, formats and the default sort unchanged (spec 001 RF-19/RF-20: AVE descending
  on first open; every player with ≥ 1 PA or runner out (spec 002 RF-18) listed, no minimum; "—" sorts last).
- RF-3: WHEN the user opens a player's detail, THE SYSTEM SHALL show AVE, OBP and OPS columns between K and Turnos,
  with the spec 004 RF-8 `title`s, filled only in the "Total" row with the same values as that player's row in
  "Jugadores" (spec 001 RF-19 format); the per-game rows leave those three cells empty.

## Non-functional requirements
- The players-table column list (key, label, integer flag) is defined once in `stats.js`; `index.html` renders the
  header, rows, Equipo row and key from it. A node test asserts its label order equals RF-1.
- The detail's Total rates are read from the player's `Stats.players(entries, TEAM)` row (the same object the
  detail already fetches), so they equal the Jugadores row by construction; `playerGames` and its `total` stay as they
  are. A node test pins that the players with detail lines are exactly the Jugadores rows, plus the edge-case rates.
- Phone: at 360×640, with the table scrolled to the start, the AVE header and cells lie fully inside the scroll box
  (sticky Jugador column ≈ 163 px + AVE ≈ 50 px of ≈ 300 px). No change to stored data, `firestore.rules` or `sw.js`
  (index.html and stats.js are network-first; no new file).

## Edge cases
- Walks only (VB 0, BB ≥ 1): AVE "—", OBP e.g. "1.000", SLG "—", OPS "—". Runner outs only: all four "—". Sacrifice
  fly only: OBP ".000", the rest "—". The detail Total row shows the same values.
- The detail of a player who no longer has lines (deleted remotely): unchanged behavior (spec 001).
- A player whose TEAM name changed: table and detail group by player id, so the values match (spec 001 RF-21).

## Out of scope
- A minimum of plate appearances to rank (Kevin: no minimum).
- Per-game rates in the detail, filters by date or last game, charts.
- The other critique items (keyboard/screen reader, lime meaning, labels, batting order on assigning a position) —
  spec 007.

## Done criteria
- Node: RF-1 order and RF-3 values (detail total rates = players row). Browser at 360 px and desktop: header,
  Equipo row and key in RF-1 order, AVE visible on open, detail columns between K and Turnos with empty per-game
  cells.

## Open questions
- (none — answered by Kevin 2026-11-06.)
