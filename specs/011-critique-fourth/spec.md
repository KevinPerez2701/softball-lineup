# Spec 011 — Fixes from the 2026-11-09 critique (30/40)

Status: planned — G1 approved by Kevin 2026-11-09 ("la apruebo comienza en paralelo con todo"; G2 pre-approved by the same words)
Created: 2026-11-09 · Clarified: 2026-11-09 (clarifier NEEDS WORK: 12 blocking, 13 minor, 6 missing edge cases — all
resolved below by the orchestrator; listed in Decisions for G1)

## Context and goal
The 2026-11-09 impeccable critique (after spec 010; snapshot `.impeccable/critique/2026-11-09T15-02-58Z__index-html.md`)
scored 30/40 with one P1, three P2, one P3 and a list of minors. Kevin asked on 2026-11-09 to do "todo lo pendiente"
and chose: a fixed bottom bar for check-in, a public page with a header and readable tables, dimming players with few
AP in rate rankings, and everything in one spec (P1 + P2 + P3 + minors).

## Definitions
- **Phone layout**: viewport width ≤ 680 px (as in specs 008–010). **Coarse pointer**: `(pointer: coarse)`.
- **Check-in list**: the Banca absent list of spec 010 RF-33/34 ("Equipo (n)" / "No vinieron (n)"), a `<details>`.
- **Check-in visible**: the check-in list's `<details>` is open AND Banca is displayed (on the phone layout: the Orden
  tab is current).
- **Rate column**: AVE, OBP, SLG or OPS in the season "Jugadores" table.
- **Qualified**: a player whose AP ≥ N, with N = ceil(maxAP / 2) and maxAP the highest AP in the table; maxAP = 0
  means everyone is qualified.
- **Tap area**: the box that receives the pointer, including invisible padding or a pseudo-element hit area.

## Users / actors
- The signed-in manager (Kevin), on the phone in the dugout (one hand) and on desktop; keyboard and screen-reader users.
- Anyone who opens a public game link (no account), usually from WhatsApp on a phone.

## User stories
- US-1: As the manager, after ticking who came, I want the add button where my thumb is, so check-in takes no scrolling.
- US-2: As the manager on the phone, I want a delete that is not next to Editar and field slots I can hit.
- US-3: As a keyboard user, I want the focus to start on the dialog I opened, not on a random button.
- US-4: As a parent who gets the link in WhatsApp, I want the teams and the final score at a glance, readable on my
  phone.
- US-5: As the manager, I want the AVE ranking not to crown someone with three at-bats.

## Functional requirements (acceptance criteria in EARS)

### A. Check-in (P1)
- RF-1: WHILE check-in is visible and n ≥ 1 of its checkboxes are ticked, THE SYSTEM SHALL show a bar fixed at the
  bottom of the viewport (on the phone layout directly above the tab bar, respecting the bottom safe area; on desktop at
  the bottom of the viewport, as wide as the page content) holding one button "Agregar (n)" in the key style (lime),
  accessible name "Agregar n al partido". WHEN check-in stops being visible, n becomes 0, or the game switches, THE
  SYSTEM SHALL hide the bar; the ticks stay as spec 010 RF-35 says, and the bar shows again with the same n when
  check-in is visible again. (Amends 010 RF-34, 009 RF-13, 007 RF-8 and 008 RF-7's list of solid-lime buttons for this
  one button; Kevin 2026-11-09.)
- RF-2: WHILE the bar of RF-1 is shown, THE SYSTEM SHALL draw any toast above the bar (not overlapping it), and the page
  bottom padding SHALL let the last Banca row scroll clear of the tab bar, the bar and a shown toast (as spec 008 RF-13
  and 010 RF-40 do).
- RF-3: THE SYSTEM SHALL show "Vinieron todos" above the check-in list's rows (first item inside the open section) and
  SHALL not show the in-list "Agregar (n)" button any more; the bar's button does what spec 010 RF-36–39 say.
- RF-4: THE SYSTEM SHALL make the whole check-in row (jersey and name included) toggle its checkbox, with the row at
  least 44 px tall on the phone layout.

### B. Touch targets (P2)
- ~~RF-5~~: retired at clarify — every listed control is `.btn-sm`, already 44 px tall under
  `@media (pointer:coarse)` (index.html:915–919, ver.html:185–188); the critique measured 23–27 px in a desktop Chrome
  iframe, which reports `pointer: fine`.
- RF-6: WHILE the pointer is coarse, THE SYSTEM SHALL leave at least 12 px between a ✕ (delete) button and the button
  next to it in the Juegos rows and in "Abrir juego" (Abrir keeps its 16 px from 008 RF-20).
- RF-7: WHILE the pointer is coarse, THE SYSTEM SHALL extend each visible field slot's tap area equally above and below
  its drawn box, up to 44 px in total, stopping at half the vertical gap to any slot it shares horizontal space with and
  at the field's edge (the field never gains a scrollbar), in every SF / 4F / BD combination at 360 px wide. The drawn
  size does not change. The plan lists the resulting height per slot.

### C. Focus (P2)
- RF-8: WHEN one of these dialogs opens — Estadísticas (`#statsView`), Abrir juego (`#saved`), Roster
  (`#teamRoster`), the Más / Compartir sheet (`#sheet`), Asignar (`#picker`) — THE SYSTEM SHALL move the focus to its
  heading (`h3`, `tabindex="-1"`, no visible ring). Redraws of an open dialog (sync, sort, tab switch) SHALL not move
  the focus. The capture sheet keeps "Cerrar" (spec 003 RF-31); `#ask`, the text prompt, the result picker (`#paPick`)
  and Respaldo (`#backup`) keep their current focus; the player detail keeps spec 008 RF-2.
- ~~RF-9~~: retired at clarify — `:focus-visible` is already the only focus rule (index.html:132). The double rings the
  critique saw came from focus landing on a button when a dialog opened, which RF-8 removes. A keyboard user on a
  selected chip still sees the 2 px selected border (008 RF-6) plus the focus ring; that is intended.

### D. Public page `ver.html` (P2)
- RF-10: WHEN a published game loads, THE SYSTEM SHALL replace the current title and result line with a header: row 1
  "<visitor> <v> – <h> <home>" in the line score's order and names, the score at least 40 px; row 2
  "<Ganado | Perdido | Empate> · dd/mm/aaaa" (no date part without a valid date; a 0–0 game shows "Sin marcador");
  long team names wrap, never cut. The page `<title>` SHALL be `Stats.viewTitle(game)` once loaded and "Diamante 10"
  while loading and on the RF-14 page.
- RF-11: WHILE the viewport is wider than 760 px, THE SYSTEM SHALL limit `ver.html`'s content to 760 px wide, centered.
- RF-12: THE SYSTEM SHALL give every numeric cell of the line score in `ver.html` and in the app's game view at least
  28 px of width including at least 4 px of horizontal padding. The phone box score keeps spec 010's compact layout
  (Kevin checked it on his Pixel on 2026-11-09).
- RF-13: THE SYSTEM SHALL carry static Open Graph tags in `ver.html`: `og:title` "Diamante 10 · Juego",
  `og:description` "Marcador y estadísticas del juego", `og:image` the absolute https URL of the app's 512 px icon,
  `og:type` "website". (The game lives in the hash, which never reaches the server, so the card cannot name the game.)
- RF-14: IF the link is invalid or the game is not published, THEN THE SYSTEM SHALL keep the current message and add a
  link "Abrir Diamante 10" to `./` (the app). (Amends 010 RF-27's "and nothing else".)
- RF-15: WHEN the hash of an open `ver.html` changes, THE SYSTEM SHALL show "Cargando…", load the game the new hash
  names and show it (or RF-14's message) without a manual reload; IF an earlier load is still pending, THEN only the
  result for the latest hash is shown. Firebase is initialized once per page. (Amends 010 RF-29's "once per page load".)

### E. Rankings and record (P3)
- RF-16: WHILE the Jugadores table is sorted by a rate column, THE SYSTEM SHALL list qualified players first and the
  others after them, each group in the chosen order with null rates last within the group; draw unqualified rows
  dimmed (text contrast still ≥ 4.5:1) with the accessible cue "pocos AP" on the name cell; and, only WHILE at least
  one row is dimmed, show under the table "Atenuados: menos de N AP". Sorting by any other column keeps today's order
  and dims nothing. (Reverses spec 008's out-of-scope "minimum-AP rule"; Kevin 2026-11-09.)
- RF-17: THE SYSTEM SHALL write the season record as "Récord <w> G · <l> P · <t> E" (e.g. "Récord 2 G · 2 P · 0 E")
  wherever `Stats.recordText` is shown.

### F. Minors
- RF-18: WHILE the phone layout is active, THE SYSTEM SHALL label empty field slots with these short names, with no
  ellipsis at 360 px: Campocorto → "Short", Jardín izquierdo → "Jardín izq.", Jardín central → "Jardín cen.", Jardín
  izquierdo central → "J. izq. cen.", Jardín derecho central → "J. der. cen.", Jardín derecho → "Jardín der.",
  Short fielder → "Short field", Bateador designado → "Bat. desig.". Other names stay. The accessible name and the
  title keep the full name.
- RF-19: THE SYSTEM SHALL show, on screen, an empty jersey box (same width, no "–") for a player without a number in
  the lineup lists, bench, check-in and roster; the print sheet keeps "–".
- RF-20: IF a saved game's name ends with " · " + its dateLabel, THEN THE SYSTEM SHALL show the name without that suffix
  in the "Abrir juego" row title and keep the date in the second line.
- RF-21: THE SYSTEM SHALL write the capture legend as "• anotó carrera · número pequeño: orden del turno · rojo: no
  cuadra con el marcador · n out: outs del inning · ⚠: el inning no tiene 3 outs".
- RF-22: THE SYSTEM SHALL write "estadísticas" instead of "box score" in user-facing text (the Compartir sub-line of
  "Copiar imagen" reads "Marcador y estadísticas, al portapapeles").
- RF-23: THE SYSTEM SHALL fit the Estadísticas dialog title at 360 px without an ellipsis, keeping its header on one
  line (008 RF-16); the title's font size or letter-spacing may shrink on the phone layout.
- RF-24: THE SYSTEM SHALL draw the "Estadísticas" / "Abierto" labels in "Abrir juego" rows as plain status text (no
  border, no background, no pointer cursor).
- RF-25: WHILE "Completar orden" or "Vaciar orden" is disabled, THE SYSTEM SHALL show the reason as visible text next to
  the buttons: "Nadie marcado para este partido" (Completar orden: no game players) / "El orden está vacío" (Vaciar
  orden); one line, the first that applies.

## Non-functional requirements
- Vanilla ES5 in `index.html`, `stats.js`, `view.js`; no npm. Pure logic in `stats.js` with Node tests: the qualified
  split for RF-16, `Stats.recordText` for RF-17 (tests/games.test.js:313–314 change), the RF-20 name rule, the RF-18
  short-name map, the RF-25 reason text. `Stats.parseShare` (RF-15) is already tested.
- Light and dark; 360 px phone and desktop. The print sheet and the PNG image do not change.
- `sw.js` `VERSION` bumped because `index.html`, `ver.html` and `view.js` change.
- Browser checks on localhost:8001 with Kevin's session, read-only. Coarse-pointer RFs (RF-6, RF-7) are checked with
  Chrome DevTools device mode (touch emulation) or on Kevin's phone after deploy, not in the iframe.

## Edge cases
- Check-in with 1 absent player: the bar shows at n = 1; "Vinieron todos" adds all, clears the ticks and hides the bar.
- A sticky toast ("<name> no vino", 009 RF-2) already up while ticking: it moves above the bar (RF-2).
- After "Agregar (n)": the ticks clear (bar hides) and the toast takes the bottom.
- One game where everyone has the same AP: everyone is qualified; no dimming, no note. One game with a substitute at
  1 AP and starters at 4: N = 2, the substitute is dimmed (by design).
- A qualified player whose turns are all walks: AVE null, last within the qualified group.
- `ver.html` hash changed twice quickly: only the second game shows (RF-15).
- An "Abrir juego" row whose name has no date suffix: unchanged.
- Fine pointer (mouse): RF-6 and RF-7 do not apply.

## Out of scope
- Keyboard shortcuts; a redesign of the field or a tap-a-position list; check-in as its own step in Orden.
- A "poster" with top hitters on the public page; dynamic link previews (would need a server).
- Detector findings not confirmed on the rendered page: the 3 contrast hits on `#4a5744`; the 8.5–9.5 px labels are in
  the print sheet (`@media print`).
- "Llenar campo" / "Vaciar campo" disabled reasons.
- Data fixes ("Jueves 22/10" dated 19/10/2026, duplicate "Andres/Andrés Alvarez"): Kevin's data; done only if he asks.

## Done criteria
- Node tests for RF-16, RF-17, RF-18, RF-20, RF-25 green; full suite green.
- Browser at 360×640 (same-origin iframe) and desktop, light and dark, on localhost:8001: every RF except RF-6/RF-7
  observed once, with measured sizes for RF-1–4 and RF-10–12; `ver.html` for the published game, for an invalid hash
  and after a hash change. RF-6/RF-7 in DevTools device mode with touch.
- Impeccable critique re-run after deploy.

## Decisions (for G1)
- Kevin 2026-11-09: fixed bottom bar with a lime "Agregar (n)"; public page header + readable tables (no poster); dim
  players with few AP in rate rankings; everything in one spec.
- Orchestrator (clarify): the bar shows on desktop too (one behavior on both layouts).
- Orchestrator (clarify): the critique's 27 px touch-target P2 was a measuring artifact (RF-5 retired); only the ✕ gap
  and the field slots change.
- Orchestrator (clarify): the capture sheet keeps "Cerrar" as its first focus (003 RF-31); RF-9 retired.
- Orchestrator (clarify): the phone box score keeps 010's compact layout, which Kevin approved on his Pixel; only the
  line score cells get the 28 px minimum.
- Orchestrator (clarify): the record keeps the word "Récord".

## Open questions
- (none)
