# Spec 012 — Fixes from the 2026-11-09 critique after spec 011 (31/40)

Status: done (committed 2026-11-09, deploy push pending) — G1 approved by Kevin 2026-11-09 ("apruebo, comienza y haz el commit de una"; G2 and the deploy pre-approved by the same words)
Created: 2026-11-09 · Clarified: 2026-11-09 (clarifier NEEDS WORK: 3 blocking, 8 minor, 4 missing edge cases — all
resolved below by the orchestrator; listed in Decisions for G1)

## Context and goal
The impeccable critique run after spec 011 (snapshot `.impeccable/critique/2026-11-09T16-03-56Z__index-html.md`) scored
31/40 with no P0/P1. Kevin chose on 2026-11-09 "Spec 012 con todo": the light-theme selected state, check-in first on an
empty game, a heading and a footer on the public page, and reasons on the disabled field buttons. The phone box score
density stays as it is (Kevin approved it on his Pixel on 2026-11-09).

## Definitions
- **Light theme**: the light tokens are in effect — in practice `prefers-color-scheme: light`, since no code sets
  `data-theme` (the CSS also honors `data-theme="light"` in `index.html`). **Dark theme**: the opposite.
- **Selected control**: a `.btn-default` button (Estadísticas Jugadores / Juegos, game view and `ver.html` Totales /
  Por inning, capture picker chips that are on, and any other `.btn-default` use).
- **Empty game**: the game has no players (`S.roster` is empty) and the team is not empty (spec 010 RF-32).
- **Public copy**: `users/{uid}/public/{shareId}`, always written with `updatedAt: serverTimestamp()` (spec 010).

## Users / actors
- The manager (Kevin) on the phone and on desktop, light and dark; keyboard and screen-reader users.
- Anyone who opens a public game link.

## User stories
- US-1: As the manager using the light theme, I want to see at a glance which tab or toggle is selected.
- US-2: As the manager opening a fresh game on the phone, I want the check-in list first, not under an empty order.
- US-3: As a screen-reader user on the public page, I want the score announced as the page heading.
- US-4: As a parent opening the link, I want to know where the page comes from and how fresh it is.
- US-5: As the manager, I want to know why Autoasignar or Vaciar campo do nothing.

## Functional requirements (acceptance criteria in EARS)

### A. Selected state in the light theme (P2)
- RF-1: WHILE the light theme is in effect, THE SYSTEM SHALL draw every selected control with background
  `--accent-soft`, a 2 px `--accent-text` border and `--ink` text, also while the pointer is over it; WHILE the dark
  theme is in effect, with today's 2 px `--accent` border and no fill. Applies to `index.html` and `ver.html`. (Amends
  spec 008 RF-6 in the light theme; the code comments that say "nunca relleno" / "borde lima" are updated.)
- RF-2: WHILE a selected control has keyboard focus in the light theme, THE SYSTEM SHALL show the fill, the 2 px
  `--accent-text` border and the 3 px `--focus` outline at 2 px offset (spec 008 RF-5) at the same time.

### B. Check-in first on an empty game (P2)
- RF-3: WHILE the game is empty, THE SYSTEM SHALL show the Banca card above the "Orden al bate" card (phone Orden tab and
  desktop rail); otherwise "Orden al bate" first. The swap is visual only (CSS `order` in the `.rail` flex column): DOM,
  Tab and screen-reader order are unchanged, and no focus moves because of it.

### C. Public page (P3)
- RF-4: WHEN a published game is shown, THE SYSTEM SHALL mark the `ver.html` score line ("<visitor> <v> – <h> <home>",
  spec 011 RF-10) as the page's only `h1`, with the `h1` margins and font reset so the header row's box stays within 1 px
  of today's at 360 px and on desktop. (Amends spec 011 RF-10.)
- RF-5: THE SYSTEM SHALL write the team names in the `ver.html` header with the same casing as the line score (no forced
  uppercase). (Amends spec 011 RF-10.)
- RF-6: WHEN a published game is shown, THE SYSTEM SHALL show under the tables (below whichever of Totales / Por inning is
  visible) a footer "Diamante 10 · actualizado <Stats.fmtDateTime of updatedAt>" (the app's existing date-time format,
  e.g. "06/11/2026 · 8:15 p. m.", viewer's local time); "Diamante 10" links to `./`. "Actualizado" is the last write of the
  public copy (publish, Copiar enlace público, or a stats save of a published game). IF `updatedAt` has no `toMillis`,
  THEN the footer reads "Diamante 10" alone. The not-found (010 RF-27) and error (RF-28) pages show neither the footer
  nor an `h1`.

### D. Disabled field buttons (P3)
- RF-7: WHILE "Autoasignar" or "Vaciar campo" is disabled, THE SYSTEM SHALL show the reason as visible text next to them,
  one line, the first that applies: "Nadie marcado para este partido" (Autoasignar: no game players) / "El campo está
  vacío" (Vaciar campo: nobody assigned; BD does not count, as `assignedIds()` today); no text while both are enabled.
  Same pattern as spec 011 RF-25 (`.hint`, `aria-live="polite"`, hidden when empty), and `no-print` so the print sheet
  does not change.

### E. Ranking note (P3)
- RF-8: THE SYSTEM SHALL show the "Atenuados: menos de N AP" note above the Jugadores table instead of under it, so it is
  on screen when the table opens on the phone. (Amends spec 011 RF-16.)

## Non-functional requirements
- Vanilla ES5 in `index.html` and `stats.js`; `ver.html` keeps its module script. No npm. Pure logic in `stats.js` with
  Node tests: `Stats.fieldReason(rosterLen, assignedLen)` for RF-7 and `Stats.footerText(ms)` (or equivalent) for RF-6,
  built from `new Date(y, m, d, h, mi).getTime()` as the existing `fmtDateTime` tests do.
- Light and dark; 360 px phone and desktop. The print sheet and the PNG image do not change.
- `sw.js` `VERSION` bumped (v11). `ver.html`'s tokens stay a copy of `index.html`'s (its `:19` comment).
- Browser checks on localhost:8001 with Kevin's session, read-only; the light theme is checked by emulating
  `prefers-color-scheme: light` (or the `data-theme` attribute in `index.html`); contrast computed from the tokens.

## Edge cases
- Team empty: RF-3 does not apply (spec 010 RF-32 keeps "Agregar jugadores").
- Game becomes empty again (last player removed, Deshacer of the first add, switching to an empty game): Banca first.
- "Agregar (n)" or "Vinieron todos" fills an empty game: Orden al bate first again; spec 010 RF-38 focus unchanged (DOM
  order did not change).
- Game with players but nobody on the field (or only BD): Vaciar campo disabled → "El campo está vacío".
- Game empty: both field buttons disabled → "Nadie marcado para este partido".
- Sorting the Jugadores table by a rate column toggles the RF-8 note, so the table shifts by one line; focus stays on
  the header (spec 011 RF-8). Default sort is AVE, so the note shows on open when someone is dimmed.
- System theme switches while the app is open: RF-1 follows the tokens with no reload.

## Out of scope
- Phone box score density (Kevin approved 2026-11-09); keyboard shortcuts; regrouping the Más menu; a poster public page;
  check-in as its own screen; "Home club" and "Short fielder" (softball terms used in Venezuela, kept); a theme switch
  in the app.

## Done criteria
- Node tests for RF-6 and RF-7 green; suite green.
- Browser on localhost:8001, 360 px and desktop, light and dark: every RF observed once, contrast for RF-1 stated.
- Deployed on Kevin's OK.

## Decisions (for G1)
- Kevin 2026-11-09: "Spec 012 con todo" (scope above); box score density stays.
- Orchestrator (clarify): RF-1 border `--accent-text` (#5d6b00: ≈5.9:1 on #fff, 5.1:1 against the fill), kept apart from
  the `--ink` focus ring (008 RF-5); dark theme unchanged.
- Orchestrator (clarify): RF-3 visual swap only (CSS `order`), so focus and the screen-reader order never jump.
- Orchestrator (clarify): RF-6 reuses the app's existing date-time format (`Stats.fmtDateTime`, 12 h "p. m.") instead of a
  new 24 h one.

## Open questions
- (none)
