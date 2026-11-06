# Spec 009 — Attendance from the Banca card: "No vino" and "Vino" without opening Roster

Status: done (deployed 2026-11-06, 0769e89) — G1 approved by Kevin 2026-11-06 ("si apruebo la spec 009 inicia"; G2 pre-approved by the same words)
Created: 2026-11-06 · Clarified: 2026-11-06 (clarifier NEEDS WORK: 5 blocking, 8 minor — all resolved below; two
answered by Kevin, the rest decided by the orchestrator and listed in Open questions)

## Context and goal
"Nuevo" keeps the game's players (the ones who came to the last game) so the next lineup starts from them. When the
attendance changes, Kevin has to open Más → Roster (or "Jugadores" in Orden al bate), find the player and toggle his
checkbox. On game day that is too many steps. Kevin's decisions (2026-11-06): "Nuevo" keeps inheriting the players;
each Banca row gets a "No vino" button with Deshacer; the team players who are not in the game are listed at the end of
Banca with a "Vino" button each; the "No vino" notice stays until the next action; with nobody marked yet the list is
called "Equipo" and shows open.

## Definitions
- **Game players**: `S.roster`, the players marked as present (the Roster checkbox).
- **Team**: the Roster del equipo (`TEAM`).
- **Absent list**: team players who are not game players, in team order.
- **Game switch**: page load, "Nuevo", "Abrir", "Recuperar", "Descartar", or a `current` document arriving from
  another device or tab.

## Users / actors
- The signed-in manager (Kevin), on the phone in the dugout and on desktop; a keyboard or screen-reader user.

## User stories
- US-1: As the manager I want to take out a player who did not come with one tap from the bench.
- US-2: As the manager I want to bring in a team player who did come with one tap, without opening Roster.

## Functional requirements (acceptance criteria in EARS)
Take out (Banca)
- RF-1: THE SYSTEM SHALL show in each Banca row a "No vino" button (accessible name "<name> no vino: retirarlo del
  partido") immediately left of "Agregar" (which stays last), styled as a plain small button (`btn btn-sm`: not lime,
  not red), and SHALL keep each Banca row on one line at 360 px, cutting the name with an ellipsis when needed.
- RF-2: WHEN "No vino" is pressed, THE SYSTEM SHALL remove that player from the game players (the same effect as
  unchecking him in Roster: he leaves the bench and appears in the absent list; he stays in the team) and show the
  toast "<name> no vino" with "Deshacer" and a "✕" (aria-label "Cerrar aviso") that stays until RF-4 drops it or the
  user closes it (spec 008 RF-12 behavior).
- RF-3: WHEN "Deshacer" of that toast is pressed, THE SYSTEM SHALL restore the game players and the BD designation
  exactly as they were before the press (the player back at his place in the bench) and the header returns to its
  previous state ("●" / "Guardado ✓").
- RF-4: IF, before "Deshacer", the lineup changes in any way (a local edit, a game switch, a `current` or `team` change
  from another device or tab) or another toast shows, THEN THE SYSTEM SHALL hide the toast and drop the undo. Only the
  last "No vino" can be undone.
- RF-5: IF at "Deshacer" time the player is already a game player or no longer in the team, THEN THE SYSTEM SHALL change
  nothing and hide the toast.

Bring in (end of Banca)
- RF-6: WHILE the absent list is not empty, THE SYSTEM SHALL show at the end of the Banca card a foldable section
  (`<details>`) titled "No vinieron (<n>)" — or "Equipo (<n>)" WHILE there are no game players — listing the absent
  players, each row with jersey, name and a "Vino" button (accessible name "<name> vino: agregarlo al partido"); no
  position badge, not draggable. With an empty absent list the section is not shown.
- RF-7: WHEN "Vino" is pressed, THE SYSTEM SHALL add that player to the game players at the end of the bench (the same
  effect as checking him in Roster) and show the toast "<name> agregado al partido" (normal timing, no undo).
- RF-8: IF "Vino" is pressed while the "Recuperar" banner shows, THEN THE SYSTEM SHALL ask "¿Descartar lo último sin
  guardar?" as the Roster checkbox does today, and add the player only when the answer is "Descartar".
- RF-9: WHEN a game switch happens, THE SYSTEM SHALL show the section open if there are no game players and folded
  otherwise; between game switches it SHALL keep the user's open or folded choice through every redraw (Vino, No vino,
  Roster changes, team sync), including when the section disappears and comes back. The choice is not stored.
- RF-10: THE SYSTEM SHALL keep the Banca count ("BANCA <n>") counting only the bench, and SHALL not print the section.

Focus and phone
- RF-11: WHEN "No vino" or "Vino" removes the row that holds the keyboard focus, THE SYSTEM SHALL move the focus to the
  same button of the row now in its place, else of the previous row in that list, else to the section's title (after
  the last "No vino") or the Banca heading (after the last "Vino").
- RF-12: WHILE a toast shows on the phone layout, THE SYSTEM SHALL let the page scroll the last row of the Banca card
  clear of it.

Unchanged
- RF-13: THE SYSTEM SHALL keep "Nuevo", the Roster dialog (checkboxes, "Marcar todos", edit, ✕), the bench "Agregar"
  and the empty-bench note as they are (spec 007 RF-8: Banca has no solid lime).

## Non-functional requirements
- Pure logic in `stats.js` with node tests (`node --test 'tests/*.test.js' < /dev/null`): the absent list (team minus
  game players, team order, names and numbers from the team) and the section title ("No vinieron (n)" / "Equipo (n)").
  The rest is UI.
- Browser check once on localhost:8001 (Kevin's session) at 360×640 and desktop, light and dark. Every press writes the
  working lineup (`current`) at once, so the demo starts from "Abrir" of a saved game (never answers "Descartar"),
  reverts every press ("Deshacer" / "Vino" / "No vino"), and ends by reopening that saved game.
- Copy in Latin American Spanish. No change to stored data shape, `firestore.rules`, Firebase config or `sw.js`.

## Edge cases
- "No vino" on the last bench player: the bench shows "Nadie en banca."; focus goes to the section title (RF-11).
- Empty team: no section. Everybody present: no section.
- Only bench players get "No vino": a player in the field or the batting order is taken out with "Quitar" first (as
  today).
- A team player renamed (here or on another device) while absent: the list shows the new name and number, and "Vino"
  adds him with them.
- Roster dialog changes (checkbox, "Marcar todos") while the section is open: the list and count update and it stays
  open (RF-9).
- A quick double tap on "No vino" can take out the next player too (rows move up); accepted: only the last can be
  undone, the other comes back with "Vino".

## Out of scope
- Changing what "Nuevo" inherits; asking for attendance when a game is created.
- Removing players from the field or the order in one step; deleting players from the team (stays in Roster).
- Adding a brand-new player to the team from Banca (stays in Roster).

## Done criteria
- Node: absent-list and title tests green, suite green. Browser at 360×640 and desktop, light and dark: RF-1–13
  observed once; keyboard-only pass for RF-2, RF-3, RF-11.

## Open questions
- (none — Kevin 2026-11-06: keep inheriting; "No vino" + Deshacer, notice until the next action; absentees at the end
  of Banca with "Vino"; "Equipo (n)" open when nobody is marked. Orchestrator: section open/folded reset only at a game
  switch, so it does not fold while Kevin marks several players; "Vino" on a fresh lineup asks like the Roster
  checkbox; plain style for "No vino"; double tap accepted. Kevin can overrule any of them at G1.)
