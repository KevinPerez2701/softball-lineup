# Spec 010 — Game view, public share, and the 30/40 critique fixes

Status: done (deployed 2026-11-08, b130c00) — G1/G2 approved by Kevin 2026-11-08; G3 under his publish OK and standing push permission
Created: 2026-11-08 · Clarified: 2026-11-08 (clarifier NEEDS WORK: 8 blocking, 14 minor, 6 missing edge cases — all
resolved below; Kevin's answers in Decisions, the rest decided by the orchestrator and listed there for G1)

## Context and goal
Today a game's stats are only visible in the capture sheet (an editing tool, by inning) and folded into the season
"Jugadores" table. Kevin wants (2026-11-08) to see one game the way he sees the season, as a box score per player or
inning by inning, and to share a game's stats with people who have no account and must not see the lineup or the
configuration. On the same day he asked to fold into this spec the five fixes left by the 2026-11-06 critique
(30/40; backlog "Next spec (010)"), working in parallel where possible.

## Definitions
- **Game stats**: one live entry of `stats` (`{id, savedAt, game, rows, shareId?}`).
- **Box score**: per-row totals of one game's stats, computed by a pure function from the entry alone (no `pid`
  grouping, no `TEAM` lookup), one line per sheet row in sheet order, including rows with no turns; rates with
  `Stats.fmt` ("—" when VB = 0).
- **Published**: the entry has a `shareId`. **Public copy**: the document `users/{uid}/public/{shareId}`.
- **Public link**: `<app URL>ver.html#p=<uid>.<shareId>` (hash: the ids never reach server logs or Referer headers).
- **Phone layout**: viewport width ≤ 680 px. **Game switch**: as in spec 009.
- **Confirmed write**: a Firestore write whose promise resolved (server ack) within 6 s.

## Users / actors
- The signed-in manager (Kevin), on the phone and on desktop; keyboard and screen-reader users.
- A **viewer**: anyone with the public link, any browser, not signed in (or signed in: same public view).

## User stories
- US-1: As the manager I want to see one game as a box score or by inning without opening the editing sheet.
- US-2: As the manager I want to send a link or an image of a game's stats to the team.
- US-3: As a viewer I want to open that link without an account and see only that game's stats.
- US-4: As the manager I want the critique fixes (batch check-in, phone sheet header, button state, phone player
  detail, placeholder contrast).

## Functional requirements (acceptance criteria in EARS)

### A. Game view (signed-in app)
- RF-1: THE SYSTEM SHALL show in each Estadísticas → Juegos row the buttons "Ver", "Editar" (today's "Abrir", same
  behavior) and the delete ✕, in that order.
- RF-2: WHEN "Ver" is pressed, THE SYSTEM SHALL show inside the Estadísticas dialog the game view: a "← Juegos" button,
  the title "<equipo> vs <rival> · dd/mm/aaaa" (missing names as in `Stats.sheetTitle`; no date → no date part), a
  result line ("Ganado 6–5" / "Perdido 8–17" / "Empatado 3–3" / "Sin marcador", plus " · Publicado" while published),
  the line score, the switch "Totales" | "Por inning" (Totales selected), and the buttons "Compartir" and "Editar".
- RF-3: THE SYSTEM SHALL draw the line score as two rows, visitor on top, one column per inning plus "C" (total), team
  names as row headers.
- RF-4: WHILE "Totales" is selected, THE SYSTEM SHALL show the box score with the Jugadores columns except JJ, each row
  with the row's own number and name from the entry, an "Equipo" total row, the column titles and the "Qué significa
  cada columna" key as in Jugadores; not sortable.
- RF-5: WHILE "Por inning" is selected, THE SYSTEM SHALL show the entry's rows read-only: the same cell texts, order
  numbers and run marks as the capture sheet, runner outs, the outs count per inning, no run-mismatch marks, no ⚠, no
  scoreboard inputs (the line score of RF-3 is above), the legend "• anotó carrera · número pequeño: orden del turno",
  and no control that changes data.
- RF-6: WHILE the phone layout is active, THE SYSTEM SHALL let the line score and the box score / inning grid scroll
  sideways with the first column (names) fixed.
- RF-7: WHEN "Editar" is pressed (game view or Juegos row), THE SYSTEM SHALL do what "Abrir" does today.
- RF-8: WHEN "← Juegos" is pressed, THE SYSTEM SHALL show the Juegos list; WHEN the dialog is closed, THE SYSTEM SHALL
  forget the game view (reopening Estadísticas shows Jugadores, as today).
- RF-9: WHEN the stats change from another device or tab while a game view is open, THE SYSTEM SHALL redraw it from the
  latest entry keeping the selected switch; IF that game no longer has live stats, THEN THE SYSTEM SHALL show the
  Juegos list.
- RF-10: THE SYSTEM SHALL keep the Estadísticas dialog's top edge fixed when switching to and from the game view and
  between Totales and Por inning (spec 008 RF-15).

### B. Share (signed-in app; needs signal)
- RF-11: WHEN "Compartir" is pressed, THE SYSTEM SHALL open the app's action menu (the one "Más" uses) titled
  "Compartir" with "Copiar enlace público", "Compartir imagen", "Compartir imagen con más columnas" and, only while
  published, "Dejar de publicar" (danger style); Esc or tapping outside closes it and the focus returns to "Compartir".
- RF-12: WHEN "Copiar enlace público" is pressed and the game is not published, THE SYSTEM SHALL create a `shareId`
  (16 characters from [A-Za-z0-9] drawn with `crypto.getRandomValues`), write the public copy, and only after a
  confirmed write store the `shareId` on the entry with `savedAt` = now, copy the link and show "Enlace copiado:
  cualquiera con el enlace ve este juego".
- RF-13: WHEN "Copiar enlace público" is pressed and the game is published, THE SYSTEM SHALL rewrite the public copy
  under the same `shareId` from the current entry and copy the same link.
- RF-14: WHILE a publish, rewrite or unpublish started from the menu is in progress, THE SYSTEM SHALL ignore further
  share presses (no second `shareId`).
- RF-15: IF there is no signal (`navigator.onLine === false`) or the write is not confirmed within 6 s on RF-12, THEN
  THE SYSTEM SHALL show "No se pudo publicar. Revisa la conexión y vuelve a intentar." and leave the game not
  published (a late-landing copy is removed by RF-21).
- RF-16: IF the rewrite of RF-13 is not confirmed within 6 s, THEN THE SYSTEM SHALL still copy the link and show "Enlace
  copiado, pero el juego publicado no está al día. Vuelve a intentar con señal."
- RF-17: WHEN the stats of a published game are saved from the capture sheet, THE SYSTEM SHALL keep the `shareId` of the
  latest stored entry for that id (not the sheet's copy) and rewrite the public copy without waiting or showing a
  message; Firestore delivers it when the signal returns.
- RF-18: WHEN "Dejar de publicar" is pressed, THE SYSTEM SHALL ask "¿Dejar de publicar este juego? El enlace dejará de
  funcionar." (danger, focus on Cancelar) and on yes delete the public copy and, only after a confirmed delete, remove
  the `shareId` from the entry with `savedAt` = now; IF not confirmed within 6 s, THEN THE SYSTEM SHALL show "No se
  pudo dejar de publicar. Revisa la conexión y vuelve a intentar." and keep it published.
- RF-19: WHEN the stats of a published game are deleted, THE SYSTEM SHALL delete the stats as today and request the
  deletion of the public copy without waiting; a copy that survives is removed by RF-21.
- RF-20: IF the clipboard write is refused, THEN THE SYSTEM SHALL show the link as selectable text in a toast that stays
  until closed (✕ "Cerrar aviso").
- RF-21: WHEN the stats document arrives from the server with no pending local writes, THE SYSTEM SHALL delete every
  public copy of the account whose id is not the `shareId` of a live stats entry.
- RF-22: IF imported or synced stats carry a `shareId` whose copy does not exist, THEN THE SYSTEM SHALL show the game as
  published, and "Copiar enlace público" SHALL write the copy under that `shareId` (RF-13).
- RF-23: WHEN "Compartir imagen" or "Compartir imagen con más columnas" is pressed, THE SYSTEM SHALL build a PNG, light
  theme always, 1080 px wide, height growing with the rows, with the title, result line, line score (more than 9
  innings: same width, narrower inning columns) and box score with the columns Jugador, VB, H, 2B, 3B, HR, CA, CI, BB,
  K, AVE — plus OBP, SLG, OPS, BR, AR for "con más columnas" — names cut with an ellipsis to the column width.
- RF-24: WHEN the PNG is ready, THE SYSTEM SHALL pass it to the system share sheet if the browser can share files; IF
  the share is cancelled (AbortError), THEN nothing else happens; IF it fails otherwise or files cannot be shared,
  THEN THE SYSTEM SHALL download it as "<equipo>-vs-<rival>-<dd-mm-aaaa>.png" (spaces → "-", characters invalid in
  file names removed, "equipo"/"rival" when blank, no date part without a date).

### C. Public view (`ver.html`, no sign-in)
- RF-25: THE SYSTEM SHALL write in a public copy only: `game` with `team, opp, date, home, innings, us, them`; `rows`
  with `num, name, pos, sub` and `pas[]` with only `inn, ord, code, run, rbi, sb, outs` and `ro[]` with only `inn,
  kind`. Nothing else (no `pid`, `id`, `savedAt`, `shareId`, roster, lineup or account data).
- RF-26: WHEN a viewer opens a public link that reads a copy, THE SYSTEM SHALL show the title, result line (without
  "Publicado"), line score, and the "Totales" | "Por inning" switch with the content of RF-4, RF-5 and RF-6, with no
  sign-in screen, lineup, roster, menu or editing control, also when the viewer is signed in to the app.
- RF-27: IF the link has no valid `#p=<uid>.<shareId>` or the copy does not exist, THEN THE SYSTEM SHALL show "Este
  juego no está publicado o el enlace no es válido." and nothing else.
- RF-28: IF the copy cannot be loaded (no signal, timeout 10 s), THEN THE SYSTEM SHALL show "No se pudo cargar el juego.
  Revisa la conexión y vuelve a intentar." with a "Reintentar" button.
- RF-29: THE SYSTEM SHALL load the copy once per page load (reload to refresh), showing the last version the server has.
- RF-30: THE SYSTEM SHALL let anyone `get` a public copy by its exact path and nothing else: no `list` of
  `users/{uid}/public`, no read of `users/{uid}/data/*`, no write without being the owner (Firestore rules).
- RF-31: THE SYSTEM SHALL not register `sw.js` nor link the manifest from `ver.html`.

### D. Critique fixes (2026-11-06 critique, 30/40)
- RF-32: WHILE the game has no players and the team is not empty, THE SYSTEM SHALL not show the "Marcar asistencia"
  button in Orden al bate; the note there SHALL read "Marca en la banca quién vino a este partido." ("Agregar
  jugadores" for an empty team stays.)
- RF-33: THE SYSTEM SHALL show each row of the Banca absent list ("Equipo (n)" / "No vinieron (n)") with its jersey,
  name and a checkbox labeled with the name (ink, not lime: spec 008 RF-4); tapping the name toggles it. This replaces
  the row's "Vino" button (amends spec 009 RF-6).
- RF-34: WHILE the absent list is shown, THE SYSTEM SHALL show under it "Agregar (n)" (disabled at n = 0) and "Vinieron
  todos", both plain buttons (Banca keeps no solid lime: spec 007 RF-8 / 009 RF-13).
- RF-35: THE SYSTEM SHALL keep the selection through redraws, drop from it any player who becomes a game player or leaves
  the team, and clear it at a game switch.
- RF-36: WHEN "Agregar (n)" or "Vinieron todos" is pressed, THE SYSTEM SHALL add the selected (or all absent) players to
  the game players at the end of the bench in team order, clear the selection, and show the sticky toast "<n>
  agregados al partido" ("<name> agregado al partido" for one) with "Deshacer" and ✕ (spec 008 RF-12) (amends 009 RF-7).
- RF-37: WHEN that "Deshacer" is pressed, THE SYSTEM SHALL restore the game players and BD designation exactly as before;
  IF any added player is no longer a game player or the lineup changed since (009 RF-4), THEN THE SYSTEM SHALL change
  nothing and hide the toast.
- RF-38: WHEN RF-36 runs, THE SYSTEM SHALL move the focus to the section's title if the section remains, else to the
  Banca heading (amends 009 RF-11 for adds).
- RF-39: IF "Agregar (n)" or "Vinieron todos" is pressed while the "Recuperar" banner shows, THEN THE SYSTEM SHALL ask as
  spec 009 RF-8 does and add only on "Descartar".
- RF-40: WHILE the phone layout is active, THE SYSTEM SHALL show the capture sheet header as one row with the title and a
  "⋯" button (aria-label "Más opciones de la hoja") that opens a panel with the date, "+ Inning", "− Inning" and
  "Anotar por inning" (Esc or tapping outside closes it, focus back on "⋯"), and SHALL show "Guardar estadísticas" and
  "Cerrar" in a bar fixed at the bottom of the sheet; toasts sit above that bar and the last row and scoreboard scroll
  clear of both. Desktop stays as today.
- RF-41: THE SYSTEM SHALL show "Anotar estadísticas" in lime (`btn-key`) only WHILE the batting order has at least one
  batter or the lineup has linked stats, else as a plain button.
- RF-42: WHILE the phone layout is active, THE SYSTEM SHALL show each line of the player detail, and its Total row, on
  two lines (1: date, rival cut with an ellipsis, VB, H, CA, CI, BB, K; 2: the full "Turnos" sequence), with the column
  header showing only the line-1 labels, so no text is cut at 360 px.
- RF-43: THE SYSTEM SHALL draw the placeholders of "Nombre del equipo" and "Rival" with a contrast of at least 4.5:1
  against the input background, in light and dark mode.

## Non-functional requirements
- Pure logic in `stats.js` with node tests: box score per row (RF-4 definition), result line, public copy whitelist
  (RF-25), image table rows and columns (RF-23), file name (RF-24), share id format (RF-12: 16
  chars [A-Za-z0-9]), link parse/build (`#p=<uid>.<shareId>`), orphan list for RF-21, batch add order (RF-36).
  DOM and Firebase stay in the pages.
- `ver.html` loads only the Firebase SDK from gstatic, Google Fonts and the repo's own files; it goes into `sw.js`
  `ASSETS` (the app may serve it offline) with `VERSION` bumped, though `ver.html` itself registers no service worker.
- Stored data stays backward compatible: `shareId` is optional; entries without it are not published.
- Copy in Latin American Spanish; light and dark mode (the PNG is always light); 360 px phone and desktop.
- Browser checks on localhost:8001 with Kevin's session stay read-only, except publishing and unpublishing one game,
  which Kevin approves before the demo task; that leaves the game's `savedAt` changed. The Firestore rules must be live
  before the demo; the public view is checked in a private window.

## Edge cases
- Substitutes: box score rows in sheet order; a row with no turns shows zeros and "—" rates.
- 0–0 game: "Sin marcador" in view, public view and image.
- Extra innings (up to 12): line score columns narrow in the image; sideways scroll on the phone (RF-6).
- Two devices: publishing on the phone shows "Publicado" on desktop after sync. A stale capture save on another device
  that drops the `shareId` leaves the game unpublished, and RF-21 removes its copy (the link then shows RF-27).
- Viewer opens the link while the owner's last save is still pending offline: sees the server's version (RF-29).
- Unpublish then publish again: a new link; the old one shows RF-27.
- Backup import with `shareId`s: RF-22.

## Out of scope
- Publishing the season table or several games at once; comments; expiring or password links; view counters.
- Editing from the public view; the public view as an installable app or offline.
- Changing the capture sheet's editing behavior beyond its phone header (RF-40).

## Done criteria
- Node tests for every NFR item green; suite green.
- Browser at 360×640 and desktop, light and dark: every RF observed once; the public link in a private window shows the
  game, RF-27 after unpublishing, RF-28 offline.
- Firestore rules applied (by Kevin or with his OK) and checked: anonymous `get` of a copy works; anonymous `list`,
  anonymous read of `users/{uid}/data/*` and anonymous write are denied.

## Decisions (for G1)
- Kevin 2026-11-08: view from Juegos with "Ver", read-only, Totales | Por inning; share by link and image; full names;
  this spec also carries the critique fixes, in parallel where possible.
- Kevin 2026-11-08: Firestore rules exception approved (constitution §5/§8 note in the rules task's commit). His
  fallback "read it from GitHub" is not used: the app would need a GitHub write token in the browser and every
  publish would be a public commit.
- Kevin 2026-11-08: "Vino" replaced by selection + "Agregar (n)"; image 11 columns, with the extra five on request
  (RF-23 "con más columnas").
- Orchestrator: the link carries the account uid (`#p=<uid>.<shareId>`); the uid gives no access to anything else under
  RF-30. Publishing needs signal (6 s confirmation); saving keeps working offline and the public copy catches up.
- Orchestrator: `shareId` lives on the stats entry; publish/unpublish bump `savedAt` so the merge keeps them; the
  orphan sweep (RF-21) cleans copies left by stale saves, failed deletes or late writes.
- Orchestrator: "Agregar (n)" and "Vinieron todos" stay plain (Banca has no solid lime); the batch add gets Deshacer.

## Open questions
- (none)

## Changes after deploy (Kevin 2026-11-08)
- RF-23/24 amended: the menu items are "Copiar imagen" / "Copiar imagen con más columnas"; the PNG goes to the
  clipboard (ClipboardItem with the promise, as the lineup "Copiar imagen"), toast "Imagen copiada — pégala donde
  quieras"; if the browser refuses, the RF-24 share-or-download path runs.
- RF-4/RF-6 amended for the phone layout: the box score shows only the image columns (VB, H, 2B, 3B, HR, CA, CI, BB,
  K, AVE) with a "Más columnas" / "Menos columnas" toggle; the line score is compact (9 innings + C fit at 360 px);
  names cut with "…" at 92 px. Same in ver.html.
- Game view: "Compartir" and "Editar" sit in the top row next to "← Juegos"; the title gets no focus outline.
