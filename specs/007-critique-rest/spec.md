# Spec 007 — Rest of the critique: batting order on assigning a position, keyboard and screen reader, one meaning for lime, labels

Status: draft
Created: 2026-11-06

## Context and goal
The impeccable critique of 2026-11-06 (29/40) left, after specs 005 (picker) and 006 (stats on phone): keyboard and
screen-reader gaps (P1), lime with four meanings (P2), and a list of static or wrong labels and small texts (P3).
Kevin took every item ("Todo") and added one of his own: when he builds the lineup, a player he puts on the field does
not enter the batting order, so he has to add him and then move him. Kevin's decisions (2026-11-06): the player
enters at the end of the order; solid lime only for "what to tap now", chosen states in lime outline; "Abrir juego"
shows and sorts by the game's date; the 29/10 game is renamed to the dd/mm/yyyy format. The rest are the
orchestrator's assumptions, listed in Open questions for G1.

## Users / actors
- The signed-in manager (Kevin), on the phone in the dugout and on desktop; a keyboard or screen-reader user.

## User stories
- US-1: As the manager I want a player I put on the field to be in the batting order already, so I only order it.
- US-2: As a keyboard or screen-reader user I want to reach every player's stats and hear the whole cell.
- US-3: As the manager I want the lime button to always mean "this is the next thing to tap".
- US-4: As the manager I want labels that say the truth about this game, in readable sizes.

## Functional requirements (acceptance criteria in EARS)
Batting order
- RF-1: WHEN the user assigns a field position or BD to a player who is not in the batting order, THE SYSTEM SHALL
  append him at the end of the batting order; a player already in the order keeps his place. Removing a position
  leaves the order unchanged.

Keyboard and screen reader
- RF-2: THE SYSTEM SHALL make each player row of "Jugadores" reachable and openable with the keyboard (a button with
  the player's name in the name cell; Enter/Space opens the detail, as the click does today).
- RF-3: WHEN a chip of the result picker is pressed (mouse, touch or keyboard), THE SYSTEM SHALL keep the keyboard
  focus on the chip with the same label after the picker redraws.
- RF-4: THE SYSTEM SHALL give each grid cell an accessible name with the player, the inning and, per PA, its turn
  number, the result label and "anotó carrera" when it scored (e.g. "Kevin Perez, inning 3, turno 4: 1B, anotó
  carrera"), and runner outs by their full name ("Atrapado robando").

One meaning for lime
- RF-5: THE SYSTEM SHALL show a chosen or toggled state (selected result and number chips, "Anotó carrera", the
  selected stats tab, the active phone tab) with the lime outline style (`.btn-default`), not the solid lime.
- RF-6: THE SYSTEM SHALL show at most one solid-lime button per visible surface: the main action of that surface
  (header "Guardar" while unsaved, "Listo" in the picker, "Guardar estadísticas", "Anotar estadísticas", the Yes of a
  non-destructive question, "Agregar" in Roster); "Instalar" and "Marcar todos" become ordinary items/buttons.

Labels
- RF-7: THE SYSTEM SHALL show the innings pill as "Softball · <n> innings" with the game's current number of innings.
- RF-8: THE SYSTEM SHALL label the button that removes the last inning "− Inning" (today "− Quitar").
- RF-9: THE SYSTEM SHALL show the "Final" tag on the scoreboard only when the score is not 0–0.
- RF-10: THE SYSTEM SHALL show a game with a blank opponent as "<date>" alone in Estadísticas → Juegos and in the
  stats sheet title, never "vs rival".
- RF-11: THE SYSTEM SHALL show in "Abrir juego" each game's date (dd/mm/yyyy, from the game, not the save time) with
  its result, and sort the list by game date, newest first (same date: later save first; no date: last).
- RF-12: THE SYSTEM SHALL write the stats record as "Récord G–P–E" with en dashes, like the results.
- RF-13: THE SYSTEM SHALL render every on-screen UI label at 11 px or more (today 8–9.5 px: "Tu equipo", "Oponente",
  "Home club", "Fecha", "Marcador", "Final", "0 / 10", the innings pill); the printed sheet keeps its sizes.

## Non-functional requirements
- RF-1 and RF-11's ordering are pure logic in `stats.js` with node tests (`node --test 'tests/*.test.js'`); the rest
  is UI, checked once in the browser at 360 px and desktop (keyboard-only pass for RF-2/3, accessibility tree for
  RF-4).
- No change to stored data shape, `firestore.rules` or `sw.js` assets.

## Edge cases
- RF-1 with BD off/on: assigning BD appends like a position; a player moved from one position to another keeps his
  place in the order.
- RF-11: games saved without a date sort last; two games on the same date keep save order (newest save first).
- RF-13: the field cards keep spec 004 RF-11 (11.5 → 10 px fit) — they are names on the diagram, not UI labels.

## Out of scope
- Typed result entry, stats filters, moving "Guardar estadísticas" to the bottom, "Nuevo" placement in Más,
  re-centering of the stats dialog, the toast over the last order row (critique minor items — next critique).
- Renaming other saved games ("Jueves 22/10", "Kilovatico 12/10"…): names typed by Kevin stay.
- Data op (not a requirement): rename "MSO vs Call · 2026-10-29" to "MSO vs Call · 29/10/2026" (Kevin, 2026-11-06),
  done by hand with the same sync path as the 2026-11-06 stats-link fix.

## Done criteria
- Node: RF-1 order helper and RF-11 sort. Browser at 360 px and desktop: RF-1 on the field and BD, keyboard-only
  Jugadores → detail and picker focus, accessibility names of a few cells, one solid lime per surface on the main
  screen, the picker, the capture sheet, Estadísticas, Roster and Más, the labels of RF-7–13.

## Open questions (orchestrator assumptions — confirm at G1)
- RF-6 list of the single solid-lime action per surface.
- RF-9: "Final" hidden at 0–0; RF-10: blank opponent shows the date alone.
- RF-13: 11 px floor for UI labels, print sheet excluded.
- Out of scope list (minor items left for the next critique).
