# Spec 003 — Saved lineups as games

Status: clarified — G1 approved by Kevin 2026-11-05 11:00 ("apruebo la spec de una, implementa"; G2 pre-approved by
the same words). Second clarifier pass on RF-18–34 (7 blocking + 13 minor) resolved by the orchestrator below.
Created: 2026-11-05

## Context and goal
Kevin plays in the games, so he does not score live: he builds the lineup before the game and, after it, fixes
the lineup (people who did not show up, position changes) and transcribes the stats. Today "Guardar" always adds a
new entry to "Alineaciones guardadas", so a lineup saved before the game and saved again after the changes ends up
twice ("MSO vs Call · 2026-10-29" ×2), and the app reopens on whatever was last on screen. This spec makes each
saved entry one game that is opened, edited and saved in place, and makes the app start empty.

## Users / actors
- The signed-in manager (Kevin), on phone or desktop, before and after a game.

## User stories
- US-1: As the manager I want "Guardar" on a game I opened to update that game, not create a copy.
- US-2: As the manager I want to open a saved game after it was played, change its lineup and its stats, and keep
  one entry per game.
- US-3: As the manager I want the app to open empty, and still get back a lineup I did not save, on either device.
- US-4: As the manager I want to reuse an old game's lineup for a new game without touching the old one.

## Definitions
- **Working lineup**: what the main screen shows and edits (`current`, still shared between devices as today).
- **Saved game**: one entry of "Alineaciones guardadas" (`saved`): `{id, name, at, state}`; `state` is a working
  lineup.
- **Linked game**: the saved game the working lineup was opened from or last saved to. The working lineup keeps the
  link (the game's `id` and the `at` it had when opened or last saved here). A link whose `id` is not in `saved`
  counts as no linked game. A lineup started empty or with "Nuevo" has none.
- **Compared fields**: `team`, `opp`, `home`, `date`, `roster` (player ids, in order), `assign`, `order`, `dh`,
  `enabledSF`, `enabled4F`, `enabledDH`, `innings`, `us`, `them`, `statsId`. Both sides are normalized as on open
  (missing fields filled, roster names synced with the permanent roster) before comparing. `at` and key order
  never count.
- **Empty**: every compared field equals `blankState()`, ignoring `date` and `roster`. So the state right after
  "Nuevo" (players of the game kept) is empty.
- **Unsaved changes**: the working lineup has a linked game and differs from its `state` in a compared field, or it
  has no linked game and is not empty.

## Functional requirements (acceptance criteria in EARS)
- RF-1: WHEN the user taps "Guardar" and the working lineup has a linked game, THE SYSTEM SHALL replace that saved
  game's `state` with the working lineup and set its `at` to now, keeping its `id` and `name`, without asking for a
  name, change no other saved game, and show the RF-21 toast.
- RF-2: WHEN the user taps "Guardar" and the working lineup has no linked game, THE SYSTEM SHALL ask for a name
  (proposed by RF-20), add a new saved game, make it the linked game and show the RF-21 toast.
- RF-3: THE SYSTEM SHALL offer "Guardar como nuevo" while the working lineup has a linked game; WHEN it is used,
  THE SYSTEM SHALL ask for a name and add a new saved game whose state keeps `team`, `opp`, `home`, the players of
  the game, positions, batting order, `dh` and the SF/4F/DH flags, with no `statsId`, `innings` 7, scoreboard all
  0 and today's local date; it SHALL load that state as the working lineup, make the new game the linked game, and
  leave the previous saved game and its stats unchanged.
- RF-4: WHEN the user opens a saved game ("Abrir"), THE SYSTEM SHALL load a copy of its `state` as the working
  lineup, normalized as today, and make it the linked game.
- RF-5: IF the user opens a saved game or taps "Nuevo" while there are unsaved changes, THEN THE SYSTEM SHALL ask
  to confirm ("Hay cambios sin guardar") before discarding them, and keep the working lineup if the user cancels.
- RF-6: WHEN stats are saved and the save updates the working lineup (the capture's stats link equals the working
  lineup's, from "Anotar estadísticas" or from Estadísticas → Juegos) and the working lineup has a linked game,
  THE SYSTEM SHALL also update that saved game with the whole working lineup as RF-1 does (lineup edits not yet
  saved go with it) and show the RF-26 toast.
- RF-7: IF updating the linked saved game fails during RF-6, THEN THE SYSTEM SHALL restore the stats and the
  working lineup to their previous values, keep the capture sheet open and show "No se pudo guardar en este
  navegador".
- RF-8: WHEN the app starts, THE SYSTEM SHALL show an empty working lineup with no linked game (permanent roster
  kept, team name cleared), without writing it to this device's or the account's `current` until the user recovers,
  discards, or changes the lineup.
- RF-9: WHILE the working lineup is the untouched empty one of RF-8 and the stored working lineup (this device's or
  the account's, including one that arrives after start) has unsaved changes, THE SYSTEM SHALL offer "Recuperar lo
  último" showing its team, opponent and date (dd/mm/aaaa) with two buttons: "Recuperar" loads it with its linked
  game; "Descartar" asks to confirm and then drops it.
- RF-10: WHEN the user changes the empty working lineup while the RF-9 offer is shown, THE SYSTEM SHALL ask once
  "¿Descartar lo último sin guardar?" with "Descartar" (keep the new change, drop the old lineup) and "Recuperar"
  (load the old lineup, dropping the new change).
- RF-11: THE SYSTEM SHALL keep up to 200 saved games (today 60).
- RF-12: IF adding a saved game (RF-2, RF-3) would leave more than 200, THEN THE SYSTEM SHALL ask to confirm naming
  the least recently saved game(s) that will be deleted, and save nothing if the user cancels.
- RF-13: WHEN the user deletes the linked game from the saved games list ("Abrir juego"), THE SYSTEM SHALL keep the working
  lineup on screen with no linked game (a later "Guardar" follows RF-2).
- RF-14: THE SYSTEM SHALL keep saved games, the working lineup and backups of earlier versions valid: an entry or a
  working lineup without the new fields opens as today, with no linked game.
- RF-15: THE SYSTEM SHALL show which saved game is open: its name on the main screen while it is linked, and a
  marker on its row in the saved games list (detailed by RF-18 and RF-19).
- RF-16: IF the user taps "Guardar" on a linked game whose saved `at` differs from the one the link holds (it was
  saved on another device meanwhile), THEN THE SYSTEM SHALL say "Este juego cambió en otro dispositivo" and offer
  "Reemplazar" (RF-1), "Guardar como nuevo" (RF-3) or "Cancelar".
- RF-17: WHEN the list of saved games of this device is merged with the account's, THE SYSTEM SHALL keep every
  entry (no 60/200 cut) and, for an `id` present in both, the one with the newer `at`.

### Design (from the impeccable critique of 2026-11-05, 25/40; Kevin chose all four groups)
Refinement of the incumbent look (colors, fonts, field drawings stay). "Phone" = the ≤ 680 px layout (checked at 360
and 375 px); "desktop" = the > 680 px layout (checked at 800 and 1440 px). Empty team / opponent fall back to
today's words: "Nosotros" / "Ellos" in scoreboards, "Equipo" / "rival" in names and titles.

Open game and save loop
- RF-18: WHILE the working lineup has a linked game, THE SYSTEM SHALL show the game's name in the header: on desktop
  in place of "Softball · Lineups", on phone as a second line under the brand; cut with an ellipsis when it does not
  fit, with the full name as the element's title and accessible name. (Main-screen part of RF-15.)
- RF-35: WHILE there are unsaved changes, THE SYSTEM SHALL put a "●" before the RF-18 name (never cut) with the
  accessible text "cambios sin guardar"; with no linked game it SHALL show "● Juego sin guardar". WHILE the working
  lineup is empty and has no linked game, the desktop SHALL show "Softball · Lineups" and the phone no second line.
- RF-19: THE SYSTEM SHALL show each row of the saved games list with its name and its save time as
  "dd/mm/aaaa · h:mm a. m./p. m." (no seconds, built by hand, not `toLocaleString`).
- RF-36: THE SYSTEM SHALL show in each saved row the result from our side, our runs first: "Ganado 6–5", "Perdido
  3–4" or "Empate 2–2", and nothing when both totals are 0.
- RF-37: THE SYSTEM SHALL show an "Estadísticas" pill on a saved row whose state links to a live (not deleted) stats
  record, and an "Abierto" pill on the linked game's row (list part of RF-15).
- RF-38: WHEN the saved games list is empty, THE SYSTEM SHALL show "Todavía no hay juegos guardados. Usa «Guardar»."
- RF-20: WHEN the system asks for the name of a new saved game (RF-2, RF-3), THE SYSTEM SHALL propose
  "<team> vs <opponent> · dd/mm/aaaa" with the date of the state being saved (today's local date for RF-3), and
  leave out " · date" when the date is empty.
- RF-21: WHEN a game is saved, THE SYSTEM SHALL show the toast "Juego actualizado: «<name>»" (RF-1) or "Juego
  guardado: «<name>»" (RF-2, RF-3).
- RF-39: IF writing the saved games list fails in RF-1, RF-2 or RF-3, THEN THE SYSTEM SHALL show "No se pudo guardar
  en este navegador", add no entry and leave the link and the RF-35 marker unchanged.
- RF-40: THE SYSTEM SHALL word the saved-games texts as games: dialog title "Abrir juego"; "Borrar juego" /
  "Juego borrado"; "Juego abierto" when one is opened; "Nuevo juego" for the "Nuevo" confirm title and toast.

Header
- RF-22: THE SYSTEM SHALL show on desktop, in this order: "Nuevo", "Guardar" (key style), "Guardar como nuevo" (only
  while there is a linked game), "Abrir", "Estadísticas", "Compartir" and "Más"; no other header button keeps the
  key style.
- RF-41: WHEN the user taps "Compartir" or "Más" on desktop, THE SYSTEM SHALL open the same sheets the phone uses
  (Compartir: Copiar imagen, Térmica, Imprimir / PDF; Más: Roster, Respaldo, Instalar while available, Cerrar sesión),
  so no new dropdown component is built and an unavailable "Instalar" leaves no empty slot.
- RF-23: THE SYSTEM SHALL make "Guardar" the key button of the phone header and "Compartir" an icon button with
  `aria-label="Compartir"` that opens the share sheet; the options sheet SHALL hold, in order: Nuevo, Guardar como
  nuevo (while linked), Abrir, Estadísticas, Roster, Respaldo, Instalar (while available), Cerrar sesión.
- RF-24: THE SYSTEM SHALL use one label per action on phone and desktop: "Abrir", "Roster", "Respaldo", "Térmica",
  "Cerrar sesión", "Más" (sheet title and accessible name).

One meaning of "Guardar" in stats
- RF-25: THE SYSTEM SHALL label the capture sheet's save button "Guardar estadísticas" and title the sheet
  "<team> vs <opponent> · dd/mm", following the sheet's own date field as it is edited.
- RF-26: WHEN stats are saved, THE SYSTEM SHALL show "Estadísticas guardadas en «<name>»" if RF-6 updated a linked
  game, else "Estadísticas guardadas".

Plate-appearance picker and field
- RF-27: WHEN the result picker opens, THE SYSTEM SHALL show the result codes, "Anotó carrera" and the actions, with
  CI, BR and Outs inside a native `<details>` "Más detalles", closed unless the PA being edited has CI, BR or outs
  different from the default.
- RF-42: WHEN the user picks HR, SF or BO, THE SYSTEM SHALL open "Más detalles"; once open it SHALL stay open until
  the picker closes, also across redraws and code changes.
- RF-28: THE SYSTEM SHALL draw the chip holding the default value with a 2 px accent border, no fill and
  `aria-pressed="true"` (distinct from unselected chips), and the filled style for the chosen result code and for
  chips holding a value different from the default.
- RF-29: THE SYSTEM SHALL render the field cards' badge, position key, jersey and name (`.slot-num`, `.slot-key`,
  `.slot-jersey`, `.slot-name`) at 10 px or more on a 360 px wide phone, with SF, 4F and DH all on, with no two cards
  overlapping, and a name of "Kevin P." length shown without ellipsis.
- RF-30: IF two players on the field cards (BD included) get the same short name, THEN THE SYSTEM SHALL show each
  as "<first word> <initial of the word the short name used>." ("Kevin P.", "Keven P."), and IF those are still
  equal, the full name; the image and the thermal ticket SHALL use the same names. The rule is a pure function with
  a Node test.

Small fixes found by the critique
- RF-31: WHEN the capture sheet opens, THE SYSTEM SHALL put the focus on the sheet's "Cerrar" button, not on the
  date input.
- RF-32: THE SYSTEM SHALL show each team's name before "Visita" / "Casa" in the final scoreboard ("MSO · Casa"), on
  phone and desktop, cut with an ellipsis when long, and include it in the scoreboard's accessible labels.
- RF-33: THE SYSTEM SHALL show under the capture grid a legend (it may wrap): "• anotó carrera · número pequeño: orden
  del turno · rojo: no cuadra con el marcador · ⚠: outs del inning".
- RF-34: WHEN the user taps "Importar" in Respaldo with a valid backup, THE SYSTEM SHALL ask to confirm "Se
  reemplazan el roster, la alineación en pantalla y los juegos guardados; las estadísticas se suman. ¿Importar?"
  before changing anything; an invalid text SHALL show "Ese texto no es un respaldo válido" without asking.

## Non-functional requirements
- Constitution applies: vanilla JS in `index.html` style; the "compared fields", "empty", "unsaved changes" and
  cap/merge logic, the RF-36 result, the RF-19/RF-20 date formats and the RF-30 name rule are pure functions in
  `stats.js` (or a pure file listed in `sw.js`) with Node tests; no new dependency; `sw.js` `VERSION` bumped.
- User-facing text in Latin American Spanish.

## Edge cases
- The two existing "MSO vs Call · 2026-10-29" entries stay as they are; Kevin deletes the old one by hand.
- Saving a linked game with no changes still refreshes `at` (harmless).
- Deleting a saved game does not delete its stats (they stay under Estadísticas → Juegos, as today).
- A recovered lineup whose linked game no longer exists comes back with no linked game.
- Once the working lineup is not empty, a change to `current` from the other device replaces it, as today
  (the working lineup is shared live; only the start is empty).
- A device still on the old version cuts the list to 60 when it saves; it updates on its next launch. Only matters
  past 60 games.
- Backup import ("Importar") is not covered by RF-5 (it has its own confirm, RF-34); RF-17 does not apply to it.
- A saved game whose players left the permanent roster opens as today.

## Out of scope
- Renaming a saved game; sorting or searching the list (most recently saved first, as today).
- Merging the two existing duplicates automatically.
- Linking a stats record that has no working-lineup link to a saved game from Estadísticas → Juegos.
- Critique items not chosen: one merged "Juegos" list, an end-of-game card, keyboard shortcuts, opening the capture
  sheet in guided mode, the bench "—" badge semantics, the G/P/E wording in Estadísticas → Juegos, footer copy, a
  type-scale change (detector's flat-type-hierarchy), the field drawings themselves.

## Decisions
- Kevin, 2026-11-05: start empty with recovery; stats save updates the game; "Guardar como nuevo" copies only the
  lineup; limit 200 with a warning; the start does not touch the cloud copy; ask once before dropping the
  recoverable lineup; ask on a cross-device conflict.
- Kevin, 2026-11-05 (after the critique): all four design groups go into this spec (open game visible, header with
  Guardar first, one meaning of Guardar, picker + field); saving ends on a toast with the game's name.
- Orchestrator (confirm at G1): "Empty" ignores the players of the game, so a lineup with only attendance chosen is
  not offered for recovery; "Guardar como nuevo" is a header button (RF-22); the field card's big badge keeps the
  position number (the critique suggested the jersey; not chosen); "lo menor" was read as RF-31–RF-34 only.
  Kevin approved at G1 with these.
- Orchestrator, after the second clarifier pass (Kevin said "de una"; he can overturn any of these): the name rule
  (RF-30) also applies to the image and the thermal ticket; "Guardar como nuevo" proposes today's date; saved rows
  show the year; team names go on the scoreboard on phone and desktop ("MSO · Casa"); a long game name in the phone
  header is cut with "…" (the "●" stays visible). Desktop "Compartir"/"Más" reuse the phone sheets instead of a
  new dropdown. New RF numbers (RF-35–RF-42) come from splitting RF-18/19/22/27 and from missing states; no RF was
  renumbered.

## Done criteria
- Every RF has a green test where it is logic, and the main flow is demoed in the browser: build a lineup, save,
  reload (empty + recover offer), open the game, change a player, save (one entry), save stats (entry updated),
  "Guardar como nuevo" (two entries, old one and its stats intact), conflict prompt with two tabs.
- Design RFs checked by hand at 360, 375, 800 and 1440 px; at 360 px `impeccable detect` shows no field-card text
  under 10 px; a re-run of the impeccable critique scores heuristics 1, 4, 5 and 6 at 3 or more.
- `node --test 'tests/*.test.js'` green.

## Open questions
- (none)
