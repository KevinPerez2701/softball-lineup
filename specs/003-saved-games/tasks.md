# Tasks — Spec 003 saved-games

Rules: one task at a time; each ≤ 30 minutes of agent work; tests first; a task is `[x]` only when its "Done when"
was observed. Never renumber; append T17, T18…; obsolete tasks get ~~strike~~. Plan: `plan.md` (its "Orchestrator
review" wins over the body).

Test command: `node --test 'tests/*.test.js'`. UI tasks: syntax check of the extracted main script with
`node --check`, plus the task's browser check on `http://localhost:8000` with the demo seed (no Firebase), no server
left running. Everything is sequential: all logic is in `stats.js` and all UI in `index.html`.

## Logic (stats.js)
- [x] T1. `differs`, `isEmpty`, `unsaved`. Tests first. (RF-5, RF-8, RF-9, RF-35) Deps: —
      Files: `stats.js`, `tests/games.test.js` (new)
      Done when: tests green, incl. each compared field flips `differs`; `at`, key order, roster names, `gameId`
      do not; `us` "3" equals 3; `isEmpty` ignores date/roster and counts `statsId`; both `unsaved` branches.
- [x] T2. `upsertGame`, `trimGames`, `mergeGames`. Tests first. (RF-1, RF-2, RF-3, RF-11, RF-12, RF-17) Deps: T1
      Files: `stats.js`, `tests/games.test.js`
      Done when: tests green, incl. input lists untouched; 201 entries ⇒ the lowest `at` dropped (not the last
      position); merge keeps 300 entries, newer `at` wins, result independent of argument order.
- [x] T3. `asNew`, `gameName`, `result`, `fmtDate`, `fmtDateTime`. Tests first. (RF-3, RF-9, RF-19, RF-20, RF-25,
      RF-36) Deps: T1
      Files: `stats.js`, `tests/games.test.js`
      Done when: tests green, incl. `new Date(2026,10,5,14,5)` ⇒ "05/11/2026 · 2:05 p. m.", midnight ⇒ "12:00 a. m.",
      0–0 ⇒ "", string scores, name fallbacks "Equipo"/"rival" and no " · " without date.
- [x] T4. `shortName` moved to `stats.js` + `shortNames`; `index.html` uses them through `cardNames()` in the field,
      the image and the thermal ticket. Tests first. (RF-30) Deps: —
      Files: `stats.js`, `tests/names.test.js` (new), `index.html`
      Done when: tests green (today's outputs unchanged; "Kevin Pérez"/"Keven Pérez" ⇒ "Kevin P."/"Keven P."; still
      equal ⇒ full names); in the browser the seed's two Perez show "Kevin P."/"Keven P." on the field, and the image
      and ticket code paths call `cardNames()`.

## UI (index.html)
- [x] T5. `normalizeState(st)` (ensureState + dedupe + normalizeGameRoster parametrized), `linkedGame()`,
      `hasUnsaved()`, `#askAlt` + `askChoice`; `askConfirm`/`askText` hide `#askAlt`. (RF-4, RF-14, prep RF-10/16)
      Deps: T1
      Files: `index.html`
      Done when: tests green; `node --check` OK; the app boots with the seed's old `current`/`saved` (no link
      fields) and Nuevo/Guardar/Borrar dialogs look and work as before.
- [x] T6. Guardar / "Guardar como nuevo" / conflict prompt / 200 cap / toasts / write failure; `mergeFirst` uses
      `mergeGames`. (RF-1, RF-2, RF-3, RF-11, RF-12, RF-16, RF-17, RF-20, RF-21, RF-39) Deps: T2, T3, T5
      Files: `index.html`
      Done when: in the browser: saving twice leaves one entry with a new `at`; "Guardar como nuevo" adds a second
      entry with today's date and no stats link, the old one unchanged; a second tab saving the same game makes the
      first tab's Guardar show the three-way prompt; a forced `lsSet` failure shows the error and adds nothing.
- [x] T7. "Abrir juego" list (time, result, Estadísticas/Abierto pills, empty text), open with the RF-5 guard, delete
      of the linked game, Nuevo texts and guard. (RF-4, RF-5, RF-13, RF-15, RF-19, RF-36, RF-37, RF-38, RF-40)
      Deps: T6
      Files: `index.html`
      Done when: in the browser: rows show "dd/mm/aaaa · h:mm p. m.", "Ganado 6–5" and the pills; opening another
      game with changes asks first; deleting the open game leaves the lineup unlinked; an empty list shows the RF-38
      text.
- [x] T8. Capture: RF-6 update of the linked game with RF-7 rollback, RF-26 toast, "Guardar estadísticas", title,
      focus on Cerrar, legend. (RF-6, RF-7, RF-25, RF-26, RF-31, RF-33) Deps: T6
      Files: `index.html`
      Done when: in the browser: saving stats of the open game updates its saved entry (`at`, scoreboard,
      `statsId`); a forced `K_SAVED` write failure restores stats and lineup and keeps the sheet open; focus lands on
      Cerrar; the legend shows under the grid.
- [x] T9. Start empty: `fresh`/`stored`, `save()` guard, `applyRemote("current")` branch; fresh lineup per plan R2.
      (RF-8) Deps: T5
      Files: `index.html`
      Done when: reload ⇒ empty lineup (team name empty, no game players, permanent roster intact), and `K_CUR` in
      localStorage is byte-identical until the first change; the first change writes it.
- [x] T10. `#recover` offer + RF-10 prompt (not dismissable, plan R1). (RF-9, RF-10) Deps: T9
      Files: `index.html`
      Done when: after reload with unsaved work the offer shows its name and date; Recuperar restores it with its
      link; Descartar asks then drops; changing the empty lineup while offered asks Descartar/Recuperar and Esc
      does not close that dialog; a second tab writing `current` updates the offer.
- [x] T11. `renderHeader()`: game name, ●, "Juego sin guardar", ellipsis, phone second line. (RF-15, RF-18, RF-35)
      Deps: T6, T9
      Files: `index.html`
      Done when: in the browser at 360 and 1440 px: the name shows with ellipsis and full title; ● appears on the
      first change and disappears on Guardar; empty + unlinked shows "Softball · Lineups" on desktop and nothing on
      phone.
- [x] T12. Header restructure: one `.tools`, offstage action group, `SHEETS.more`/`share` used as desktop menus,
      labels, key style on Guardar. (RF-22, RF-23, RF-24, RF-41) Deps: T6, T11
      Files: `index.html`
      Done when: at 1440 px the header shows exactly Nuevo · Guardar · (Guardar como nuevo) · Abrir · Estadísticas ·
      Compartir · Más and both open their sheets; at 360 px Guardar is the key button, Compartir an icon with
      aria-label, the Más sheet order matches RF-23; Instalar hidden leaves no slot; the phone tab bar still works.
- [x] T13. Picker: `<details>` "Más detalles", auto-open on HR/SF/BO, stays open across redraws; default chips
      outlined with `aria-pressed`. (RF-27, RF-28, RF-42) Deps: —
      Files: `index.html`
      Done when: in the browser: a new PA opens with details closed; picking HR opens it and changing to 1B keeps
      it open; editing a PA with CI 2 opens it; a default 0 chip shows the 2 px accent border, distinct from
      unselected and from chosen chips.
- [x] T14. Scoreboard team names; Respaldo import confirm and invalid-text toast. (RF-32, RF-34) Deps: —
      Files: `index.html`
      Done when: "MSO · Casa" / "Call · Visita" on phone and desktop with ellipsis on long names; importing a valid
      backup asks first and Cancel changes nothing; invalid text shows the toast without asking.
- [x] T15. Field cards ≥ 10 px at 360 px, phone slots re-placed. (RF-29) Deps: T4
      Files: `index.html`
      Done when: at 360 px with SF, 4F and DH on, `impeccable detect` shows no field-card text under 10 px, no two
      cards overlap (screenshot), "Kevin P." shows without ellipsis.
- [ ] T16. `sw.js` `VERSION` bump; full Done-criteria demo at 360/375/800/1440 px; impeccable critique re-run.
      (NFR, Done criteria) Deps: T1–T15
      Files: `sw.js`, `STATUS.md`
      Done when: tests green; the demo checklist is recorded in STATUS with ✔/✘ per step; critique heuristics 1, 4,
      5, 6 ≥ 3.
