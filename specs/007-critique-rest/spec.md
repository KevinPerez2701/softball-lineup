# Spec 007 — Rest of the critique: batting order on assigning a position, keyboard and screen reader, one meaning for lime, labels

Status: clarified
Created: 2026-11-06 · Clarified: 2026-11-06 (clarifier NEEDS WORK: 8 blocking, 7 minor — all resolved below; four
decisions answered by Kevin the same day)

## Context and goal
The impeccable critique of 2026-11-06 (29/40) left, after specs 005 (picker) and 006 (stats on phone): keyboard and
screen-reader gaps (P1), lime with four meanings (P2), and static or wrong labels (P3). Kevin took every item ("Todo")
and added one of his own: when he builds the lineup, a player he puts on the field does not enter the batting order,
so he has to add him and then move him. Kevin's decisions (2026-11-06): the player enters at the end of the order;
solid lime only for "what to tap now", one per card or dialog; chosen states in lime outline, thick when changed from
the default and thin for the default; a BD who loses the spot stays in the order; "Abrir juego" shows the game's
date; a sheet with no opponent is titled "<team> · <date>"; the 29/10 game is renamed to dd/mm/yyyy.

## Users / actors
- The signed-in manager (Kevin), on the phone in the dugout and on desktop; a keyboard or screen-reader user.

## User stories
- US-1: As the manager I want a player I put on the field to be in the batting order already, so I only order it.
- US-2: As a keyboard or screen-reader user I want to reach every player's stats and hear the whole cell.
- US-3: As the manager I want the solid lime button to always mean "this is the next thing to tap".
- US-4: As the manager I want labels that say the truth about this game.

## Definitions
- **Surface**: the header bar; each card of the main screen (Datos del juego, Defensiva, Orden al bate, Banca,
  Carreras por inning, the "Recuperar" banner); each dialog or action sheet; the login gate.
- **Solid lime**: the filled `btn-key` style. **Lime outline**: `.btn-default` (2 px lime border, no fill) and a new
  thin variant (1 px lime border) for a chosen default value.

## Functional requirements (acceptance criteria in EARS)
Batting order (amends the field-assignment behavior of the lineup; `setPos` today)
- RF-1: WHEN a player who is not in the batting order gets a field position or BD — from the position picker, a drag
  from the bench or the order, a swap of two field cards, or "Autoasignar" — THE SYSTEM SHALL append him at the end
  of the order ("Autoasignar" appends the newly placed players in position order).
- RF-2: THE SYSTEM SHALL keep a player who is already in the batting order in his place when he gets, changes or
  loses a position, BD included: a BD replaced by another player stays in the order (today he is removed).
- RF-3: WHEN a saved game is opened, THE SYSTEM SHALL not add anyone to its order; only a new assignment appends.

Keyboard and screen reader
- RF-4: THE SYSTEM SHALL put a button with the player's name in each "Jugadores" row; Enter/Space or a click on it,
  and a click anywhere on the row as today, open the detail; WHEN the user goes back with "← Jugadores", THE SYSTEM
  SHALL put the focus on that player's button.
- RF-5: WHEN a chip of the result picker is pressed (mouse, touch or keyboard), THE SYSTEM SHALL keep the keyboard
  focus on the chip of the same group and value after the picker redraws.
- RF-6: THE SYSTEM SHALL name each grid cell "<name>, inning <n>" followed, per PA in `ord` order, by ", turno <ord>:
  <picker label, or the title when the code has one>" (", turno:" without number when the PA has no `ord`) and ",
  anotó carrera" when it scored, and per runner out by ", <its picker name>" ("Atrapado robando"); an empty cell reads
  "<name>, inning <n>, sin turnos". The text comes from a pure function in `stats.js`.

One meaning for lime (amends spec 003 RF-28 and spec 004 RF-18 wording, not their states)
- RF-7: THE SYSTEM SHALL show a chosen chip in the result picker (result, "Anotó carrera", CI, BR, outs) with the lime
  outline: the 1 px thin outline when the chosen value is the default (spec 003 RF-28), the 2 px outline when it differs
  from the default or has no default; never solid lime. The selected stats tab ("Jugadores"/"Juegos") uses the 2 px
  outline.
- RF-8: THE SYSTEM SHALL show at most one solid-lime button per surface, this one: header — "Guardar" WHILE there are
  unsaved changes or no linked game (spec 004 RF-18); Datos del juego — none; Defensiva — none; Orden al bate — none;
  Banca — none; Carreras por inning — "Anotar estadísticas"; "Recuperar" banner — "Recuperar"; result picker —
  "Listo"; capture sheet — "Guardar estadísticas"; a cell's turn list — "Anotar turno"/"Otro turno en este inning";
  guided "¿Hubo otro inning?" — "Sí"; Roster — "Agregar"; a question dialog — its yes button, or none when it is
  destructive (spec 004 RF-1); the backup dialog — "Importar"; the login gate — "Entrar"; the Compartir sheet —
  "Imprimir / PDF". Every other button that is solid lime today ("Marcar todos", "Instalar", "Agregar sustituto",
  the second button of a non-destructive two-way question, the inline-edit "Guardar" in Roster, the empty-roster
  call to action) becomes a plain button or item.
- RF-9: THE SYSTEM SHALL keep lime that is not a button as it is: the active phone tab icon and its badge, the field
  card bar, the "Final" tag text, the "Abierto"/"Estadísticas" pills.

Labels
- RF-10: THE SYSTEM SHALL show the innings pill as "Softball · <n> innings" with the game's current number of innings,
  updated when an inning is added or removed.
- RF-11: THE SYSTEM SHALL label the main scoreboard's remove-inning button "− Inning" with `aria-label` "Quitar un
  inning" (today "− Quitar").
- RF-12: THE SYSTEM SHALL show the scoreboard's "Final" tag only WHILE the score is not 0–0, updated as runs are
  typed.
- RF-13: THE SYSTEM SHALL title a stats record with a blank opponent "<team> · <dd/mm>" in the capture sheet
  (amends spec 003 RF-25's "rival" fallback) and list it in Estadísticas → Juegos as "<dd/mm/yyyy>" without "vs
  rival"; with a blank team too the title is "Estadísticas · <dd/mm>"; with no date the list shows "Sin fecha".
  `Stats.gameName` (the name proposed when saving) stays as it is.
- RF-14: THE SYSTEM SHALL show in "Abrir juego" each game's date (dd/mm/yyyy, from the game) with its result instead
  of the save time (amends spec 003 RF-19), "Sin fecha" when it has none, and sort the displayed list by game date,
  newest first (same date: later save first; no date: last). The stored order and the merge stay as they are.
- RF-15: THE SYSTEM SHALL write the stats record as "Récord G–P–E" with en dashes (amends the spec 004 edge case
  "Récord 0-0-0" → "Récord 0–0–0").

## Non-functional requirements
- Pure logic in `stats.js` with node tests (`node --test 'tests/*.test.js'`): the RF-1/RF-2 order rule (given order,
  old and new assignments → new order), the RF-6 cell name, the RF-13 titles, the RF-14 date text and sort. The rest is
  UI, checked once in the browser at 360 px and desktop: keyboard-only pass for RF-4/5, accessibility tree for RF-6,
  the RF-8 surfaces one by one.
- No change to stored data shape, `firestore.rules` or `sw.js` assets.

## Edge cases
- RF-1: BD enabled or not; a player moved from one position to another keeps his place (RF-2); a swap of two placed
  players changes nobody's place in the order.
- RF-2: a player who loses his position goes to neither the bench nor out of the order; he is removed only with
  "Quitar".
- RF-14: two games on the same date keep save order (newest save first).
- RF-7: a PA opened with a non-default CI shows that chip with the 2 px outline and "Más detalles" open (spec 003
  RF-42 unchanged).

## Out of scope
- RF-13 of the first draft (UI labels ≥ 11 px): on screen they already measure 11–12.5 px; the 8–9.5 px sizes are the
  printed sheet's. The 10 px turn number in a grid cell stays.
- Typed result entry, stats filters, moving "Guardar estadísticas" to the bottom, "Nuevo" placement in Más,
  re-centering of the stats dialog, the toast over the last order row (critique minor items — next critique).
- Renaming other saved games ("Jueves 22/10", "Kilovatico 12/10"…).
- Data op (not a requirement): rename the saved game "MSO vs Call · 2026-10-29" (id `pmvu6h1wo2`, the only one left
  after the 2026-11-06 duplicate delete) to "MSO vs Call · 29/10/2026", by hand with the same sync path as the
  2026-11-06 stats-link fix.

## Done criteria
- Node: RF-1/2 order rule, RF-6 names, RF-13 titles, RF-14 date text and sort, RF-15 record text. Browser at 360 px and
  desktop: RF-1–3 on the field (picker, drag, swap, Autoasignar, BD), RF-4/5 keyboard-only, RF-6 accessibility names,
  RF-7–9 on every surface of RF-8, RF-10–15 labels.

## Open questions
- (none — Kevin 2026-11-06 answered: end of the order; thick/thin outline; one solid lime per card; BD stays in the
  order; "<team> · <date>" title; "Abrir juego" shows the game date; the first-draft RF-13 dropped by the orchestrator
  on the clarifier's finding.)
