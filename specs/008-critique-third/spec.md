# Spec 008 — Third critique pass: phone player detail, lime only for "tap now", numbered turns, inning question, minors

Status: done (deployed 2026-11-06, 861b526; critique 30/40) — G1 approved by Kevin 2026-11-06 ("apruébalo de una vez e inicia"; G2 pre-approved by the same words)
Created: 2026-11-06 · Clarified: 2026-11-06 (clarifier NEEDS WORK: 6 blocking, 10 minor — all resolved below; B4/B5/B6
decided by the orchestrator under Kevin's "apruébalo de una vez", listed in Open questions)

## Context and goal
The impeccable re-measure of 2026-11-06 after specs 005–007 scored 30/40 (snapshot
`.impeccable/critique/2026-11-06T16-05-43Z__index-html.md`). It found two P1s (the phone player detail hides the
rates spec 006 added; opening a detail by keyboard drops focus), two P2s (lime still means more than "tap this";
turns have no number in the turn list, the picker title or the cell), a P3 ("¿Hubo otro inning?" gives no context)
and a set of minors. Kevin took everything ("Todo, incluidos P3 y menores") and decided (2026-11-06): one outline
for every chosen chip; AP shown next to AVE; Estadísticas as a 4th phone tab; the inning question shows context and
makes "No" the primary when everything adds up; picker chips show both the name and the cell abbreviation; the undo
toast stays until the next action.

## Users / actors
- The signed-in manager (Kevin), on the phone in the dugout and on desktop; a keyboard or screen-reader user.

## User stories
- US-1: As the manager on the phone I want a player's AVE/OBP/OPS visible without scrolling sideways.
- US-2: As a keyboard or screen-reader user I want to land on the detail I just opened and to reach "Deshacer".
- US-3: As the manager I want solid or outlined lime to mean only "tap this" / "chosen", nothing else.
- US-4: As the manager transcribing I want to know which turn (1, 9…) I am looking at or editing.
- US-5: As the manager I want the stats one tap away on the phone.

## Functional requirements (acceptance criteria in EARS)
Player detail (amends spec 006 RF-3)
- RF-1: THE SYSTEM SHALL show under the player's name in the detail one summary line "AVE <x> · OBP <x> · OPS <x> ·
  <n> AP · <n> JJ" (rates as the Jugadores row prints them with `Stats.fmt`, "—" when not computable), and SHALL drop
  the AVE, OBP and OPS columns from the detail table. The text comes from a pure function in `stats.js`.
- RF-2: WHEN a player's detail opens (click, tap, Enter or Space on the name), THE SYSTEM SHALL move the keyboard focus
  to the detail's heading (the player's name), so a screen reader announces it. Only on opening: a redraw of an open
  detail (remote sync, a saved sheet, sorting) does not move the focus.

One meaning for lime (amends spec 007 RF-7, RF-8 and its out-of-scope note on the 10 px turn number)
- RF-3: THE SYSTEM SHALL draw the number square of a filled field position with the same colors as an empty card's
  number square, without lime fill; lime on the field stays only on the card's bar (spec 007 RF-9) and on the
  drag-over target border. The printed sheet is unchanged.
- RF-4: THE SYSTEM SHALL draw the Roster attendance checkboxes and the settings toggles in the ink color, not lime.
- RF-5: THE SYSTEM SHALL draw the keyboard focus ring in the ink color of its surface — `--ink` on page and dialog
  surfaces, `--bar-ink` on the top bar, the tab bar and the field — never the accent lime nor its olive text variant
  (`--accent-text`), in light and dark mode.
- RF-6: THE SYSTEM SHALL show every chosen chip of the result picker (result, "Anotó carrera", CI, BR, outs) with the
  2 px lime outline, whether or not it is the default value; the 1 px thin variant and its CSS are removed
  (`aria-pressed` stays the chosen state).
- RF-7: THE SYSTEM SHALL show these buttons solid lime only WHILE they have something to do, and plain otherwise:
  header "Guardar" — WHILE there are unsaved changes (the same condition as the spec 003 RF-35 "●" marker; today it is
  also solid with no linked game and an empty lineup); "Guardar estadísticas" — WHILE the sheet has at least one turn
  and changed since it was opened or was never saved; Roster "Agregar" — WHILE its name field holds non-blank text.

Numbered turns
- RF-8: THE SYSTEM SHALL label each turn in a cell's turn list "Turno <ord> · <cell label without •>" followed by " ·
  anotó carrera" when it scored ("Turno · …" when the turn has no `ord`), and each runner out after the turns by its
  label alone ("AR"). The text comes from a pure function in `stats.js`.
- RF-9: Outside the guided mode, WHEN the result picker opens on an existing turn, THE SYSTEM SHALL title it "<num ·
  ><name> · Inning <n> · Turno <ord>" (without the turn part when it has no `ord`); WHEN it opens for a new turn, the
  title ends in " · Turno <n>" with the number the turn will get (`Stats.nextOrd`). The guided title (spec 002) is
  unchanged.
- RF-10: THE SYSTEM SHALL print a turn's `ord` in a grid cell as "#<ord>" at no less than 11 px, separated from the code
  by a space (the cell's text reads "#9 1B", not "91B").

Inning question (amends spec 002 guided mode and spec 007 RF-8's guided "Sí")
- RF-11: WHEN the guided "¿Hubo otro inning?" question shows, THE SYSTEM SHALL show one status line under it and pick
  the primary (solid lime) button by the first rule that applies, reading the capture sheet's own scoreboard
  (`game.us`/`game.them`) and `Stats.runCheck`:
  1. IF an inning has more than 3 outs, THEN "Inning <n>: <k> out" and "Sí" primary;
  2. ELSE IF an inning's sheet runs differ from the scoreboard, THEN "Inning <n>: la hoja suma <x> carrera(s), el
     marcador <y>" (singular for 1) for the first such inning, and "Sí" primary;
  3. ELSE IF the score is tied, THEN "Empate <us>–<them>" and "Sí" primary;
  4. ELSE "Los <n> innings tienen 3 out y cuadran con el marcador", "No" primary and "Sí" plain.
  The state and text come from a pure function in `stats.js`.

Undo
- RF-12: WHILE the "Turno borrado" / "Out corriendo borrado" toast with "Deshacer" is showing, THE SYSTEM SHALL keep it
  until the next edit to the sheet's turns, runner outs, rows or innings (typing in the scoreboard or the date does not
  count; opening and closing the picker without a change does not count), the capture sheet closes, another toast
  replaces it, or the user closes it with its own "✕" (aria-label "Cerrar aviso"); "Deshacer" and "✕" are reachable
  with Tab. Other toasts keep their current timing ("Campo vaciado" / "Orden al bate vaciado" keep 6 s).
- RF-13: WHILE that toast shows on the phone, THE SYSTEM SHALL not let it cover the capture scoreboard or the last row
  of the sheet (the sheet can scroll them clear of it).

Stats on the phone
- RF-14: WHILE the layout is the phone one (bottom tab bar), THE SYSTEM SHALL show a 4th tab "Estadísticas" after
  "Orden" that opens Estadísticas (the Jugadores view) in one tap, with no badge, never marked as the current tab
  (the active view stays), and SHALL not list "Estadísticas" in the "Más" sheet. Closing the dialog returns focus to
  that tab. Desktop is unchanged.
- RF-15: THE SYSTEM SHALL keep the Estadísticas dialog's top edge at the same position (within 1 px) in the Jugadores,
  Juegos and player-detail views, at 360×640 and on desktop.
- RF-16: THE SYSTEM SHALL keep the Estadísticas dialog's header (title, "Jugadores", "Juegos", "Cerrar") on one line at
  360 px.
- RF-17: THE SYSTEM SHALL order the Jugadores columns Jugador, AVE, AP, OBP, SLG, OPS, JJ, VB, H, 2B, 3B, HR, CA, CI,
  BB, K, BR, AR (AP moves next to AVE; amends the spec 006 order).

Labels and layout
- RF-18: THE SYSTEM SHALL show, on each result-picker chip whose picker label differs from its cell label, the cell
  label as a second, smaller line: "Rolling" / "Rol", "Línea" / "Lín", "Fly sac." / "FS". Chips whose two labels are
  equal show one line. The accessible name stays the picker label (or the title, for JS).
- RF-19: THE SYSTEM SHALL place "Nuevo" as the last item of the "Más" sheet before the separator (after "Instalar").
- RF-20: THE SYSTEM SHALL separate the red "✕" of each "Abrir juego" row from its "Abrir" button by at least 16 px.
- RF-21: THE SYSTEM SHALL order the capture sheet's inning buttons "+ Inning", "− Inning", as the main scoreboard does.
- RF-22: THE SYSTEM SHALL show in the Roster help the phrase "(pestaña Orden en el teléfono)" only on the phone layout,
  where it reads "(pestaña Orden)".
- RF-23: THE SYSTEM SHALL make each Roster "✕" at least 32×32 px on desktop (44 px on the phone stays).

## Non-functional requirements
- Pure logic in `stats.js` with node tests (`node --test 'tests/*.test.js' < /dev/null`): RF-1 summary text, RF-8 turn
  label, RF-11 state and text, RF-17 column order (the spec 006 order test in `tests/sheet.test.js` changes). The rest
  is UI, checked once in the browser on localhost:8001 (Kevin's session, read-only) at 360×640 and desktop, light and
  dark.
- No change to stored data shape, `firestore.rules` or Firebase config. A `sw.js` bump only if the plan needs one.

## Edge cases
- RF-1: a player with 0 AP → "AVE — · OBP — · OPS — · 0 AP · <n> JJ".
- RF-8/9: a cell with two turns lists them in `ord` order; a legacy turn without `ord` reads "Turno · …".
- RF-11: the question only shows when every inning has ≥3 outs; a capture with 0–0 on the scoreboard and no runs is a
  tie → "Empate 0–0", "Sí" primary.
- RF-12: deleting a second turn while the first toast shows replaces it (only the last deletion can be undone, as
  today).
- RF-14: the tab is not a `.tab[data-tab]` view: tapping it never changes the active view.

## Out of scope
- Typed result entry, a full-screen capture route, a minimum-AP rule for the ranking (Kevin: AP shown instead).
- The 18 sort-header tab stops of Jugadores (normal for a sortable table).
- Renaming saved games whose name and date disagree ("Jueves 22/10" dated 19/10, "Kilovatico 12/10" dated 11/10) —
  data, not UI; Kevin can ask for it as a data op.
- A team line per game in Juegos; the desktop dialog height beyond RF-15.

## Done criteria
- Node: RF-1, RF-8, RF-11, RF-17 tests green, suite green. Browser at 360×640 and desktop, light and dark: every RF
  observed once; keyboard-only pass for RF-2/RF-12; impeccable critique re-run afterwards.

## Open questions
- (none — Kevin 2026-11-06 answered: one outline; AP next to AVE; 4th tab; context + "No" primary; both labels on the
  chip; toast until the next action. Orchestrator under "apruébalo de una vez": RF-11 rule order (outs, runs, tie,
  all good); "Campo/Orden vaciado" keep 6 s; tab label "Estadísticas" (constitution 7, not "Stats"); new turn titled
  with its number. Kevin can overrule any of them at G3.)
