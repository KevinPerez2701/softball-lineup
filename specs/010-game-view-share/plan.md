# Plan — Spec 010 game-view-share

No code in this document. Decisions only. Planned 2026-11-08 by sdd-planner (fable), reviewed by the orchestrator
("Orchestrator review" at the end wins over the body). Line numbers are of HEAD 62f0ea8 (index.html 4486 lines,
stats.js 690, sw.js 94).

## Flags
- F1 **`sw.js` 75 answers every in-scope navigation with index.html**: on any device that ever opened the app the public
  link would show the login gate. `sw.js` gets a `/ver.html` navigate branch (T5). Not in the spec text; required.
- F2 **RF-21 vs RF-14**: a sweep during an in-flight publish would delete the copy just written (`shareId` lands on the
  entry only after the ack). Rule: the sweep skips while `shareBusy`; the publish bumps `savedAt`, so a later server echo
  (and sweep) always follows it.
- F3 **RF-2 "Empatado 3–3"** vs today's `Stats.result` "Empate 3–3" in the Juegos list (see Orchestrator review).
- F4 **Clipboard after an async write**: Safari drops the user gesture after an `await`. Use the
  `ClipboardItem`-with-promise pattern at 3830–3834; without `ClipboardItem`, `writeText` then RF-20.
- F5 **RF-24 `navigator.share` after an async PNG build** may throw `NotAllowedError` on iOS → download (spec covers it).
- F6 **RF-40 panel** with the native `popover` attribute (Esc, outside tap, focus return for free). Floor: Chrome 114 /
  Safari 17 / Firefox 125; older → class toggle fallback (+~15 lines) (see Orchestrator review).
- F7 **RF-39**: the "agregados" toast shows while the Recuperar question is open, as "Vino" does today (009, accepted).
- F8 **Rules live before the demo**, else anonymous `get` is denied and ver.html shows RF-27 for a real copy.
  `permission-denied` → RF-27; any other error/timeout → RF-28.

## Approach
Pure logic goes to `stats.js` (box score via a row tally pulled out of `players`, result/title lines, line score, public
whitelist, image table, file name, share id/link, orphans, batch add). A new `view.js` holds the DOM builders for line
score, box score and read-only inning grid, loaded by both `index.html` and the new `ver.html`, so RF-4/5/6 and RF-26 are
one implementation. In `index.html` the game view follows the `statsDetail` pattern (`statsGame` under the Juegos tab);
share uses `openActions`, the `signOut` 6 s race (4419–4422) and `Stats.merge` writes through `lsSet(K_STATS)`; the PNG
copies `buildLineupSvg`/`lineupPngBlob`/`btnTicket` (3715–3826, 4007–4021). The critique fixes copy the Roster checkbox
(2419–2432), the `benchUndo` sticky-toast pattern (2663–2673) and CSS-only phone rules. Firestore rules gain one `get`
line; the copy lives in `users/{uid}/public/{shareId}` as `{json, updatedAt}` like every other document.

## Modules / files
| path | responsibility | RFs | new/mod |
|---|---|---|---|
| `stats.js` 337–475 | `tally` extracted from `players`; `boxScore`, `BOX_COLS`, `resultLine`, `viewTitle`, `lineScore`, `publicCopy`, `IMG_COLS`, `IMG_COLS_MORE`, `imageTable`, `fileName`, `shareId`, `shareLink`, `parseShare`, `orphans` appended after `playerGames` | 2–5, 12, 21, 23–27 | mod |
| `stats.js` after 579 (009 section) | `batchAdd`, `addedMsg` | 36 | mod |
| `tests/gameview.test.js`, `tests/bench.test.js` (append) | node tests | NFR | new / mod |
| `view.js` | `View.lineScore`, `View.boxScore`, `View.innGrid`, `View.switcher` (ES5, `el()` copy; no Firebase, no app state) | 3–6, 26 | new |
| `ver.html` | public page: parse hash, one `getDocFromServer` with 10 s race, render with `View`; copied CSS subset; no auth import, no SW, no manifest | 26–29, 31 | new |
| `sw.js` | `ASSETS` += `ver.html`, `view.js`; `VERSION` v8; navigate `/ver.html` → network-first key `ver.html`; `view.js` network-first like `stats.js` | F1, NFR | mod |
| `index.html` 1380 | `<script src="view.js">` after stats.js | 4–6 | mod |
| `index.html` 3471–3511, 3609–3629, CSS after 604 | Juegos row buttons; `renderGameView`; `statsGame` in `openStats`; `close` listener | 1–10 | mod |
| `index.html` 1625 (ICONS), 3259–3262, block after `tryCloseCapture` (~3302), 4265–4271, 4345–4347, 4390–4434 | share menu, publish/rewrite/unpublish, RF-17 hook, sweep, cloud methods | 11–22 | mod |
| `index.html` 3800–3840 | `svgToPng` from `lineupPngBlob`; `buildGameSvg`, `gamePngBlob`, `shareGameImage` | 23–24 | mod |
| `index.html` 1890–1900, 2232–2254, 2583–2629, CSS 466–468 | batch check-in + RF-41 | 32–39, 41 | mod |
| `index.html` 1321–1336, CSS after 734 | capture phone header + bottom bar | 40 | mod |
| `index.html` CSS after 224 and after 749 | placeholder, phone detail rows | 42–43 | mod |
| Firebase console (not in repo) | rules below | 30 | Kevin |

## Data model
- Stats entry gains optional `shareId` (16 chars `[A-Za-z0-9]`); absent ⇒ not published. Publish/unpublish rewrite the
  entry with `savedAt = now` through `Stats.merge`, so other devices adopt it; RF-19 keeps the tombstone. An old client's
  capture save drops the field (spec edge case; RF-21 cleans the copy).
- Public copy `users/{uid}/public/{shareId}` = `{json: string, updatedAt: serverTimestamp}`; `json` is
  `Stats.publicCopy(rec)`. The app never reads it except the id list in the sweep.
- Must NOT change: `users/{uid}/data/*` shapes, `Stats.merge`, `cap.rec`/`cap.opened` semantics, `players()` output.
- Rules (Kevin pastes in the console; existing owner block verbatim + one match; rules OR across matches):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /users/{uid}/public/{shareId} {
        allow get: if true;
      }
    }
  }
  ```
  Constitution §5 exception note (STATUS + T0): "010: `users/{uid}/public/*` is readable by anyone who knows the exact
  path (public game copies, whitelisted by `Stats.publicCopy`); `data/*` stays owner-only." Playground checks: anonymous
  `get users/U/public/X` allow; anonymous `list users/U/public` deny; anonymous `get users/U/data/stats` deny; anonymous
  `create users/U/public/X` deny.

## Contracts
stats.js (pure):
- `Stats.tally(row, acc)` → mutates/returns `acc` with the `players` counters; `players` calls it (behavior identical).
- `Stats.boxScore(rec)` → `{rows:[{num, name, …counts, avg, obp, slg, ops}], team:{…}}`, one row per `rec.rows` entry in
  sheet order, empty rows zeros/null rates. No `pid`, no team lookup.
- `Stats.BOX_COLS` = `STAT_COLS` without `["g","JJ"]`.
- `Stats.resultLine(game)` → "Ganado 6–5" / "Perdido 8–17" / tie (see review) / "Sin marcador".
- `Stats.viewTitle(game)` → `sheetTitle` names + full `fmtDate`; no valid date → no date part.
- `Stats.lineScore(game)` → `{innings, rows:[{name, runs:[…], total}]}` visitor first; blank names "Nosotros"/"Ellos".
- `Stats.publicCopy(rec)` → `{game:{team,opp,date,home,innings,us,them}, rows:[{num,name,pos,sub,pas:[{inn,ord,code,run,
  rbi,sb,outs}], ro:[{inn,kind}]}]}`; absent keys omitted, nothing else.
- `Stats.IMG_COLS` (ab,h,b2,b3,hr,r,rbi,bb,k,avg) / `Stats.IMG_COLS_MORE` (+obp,slg,ops,sb,cs); `Stats.imageTable(rec,
  more)` → `{cols, rows, team}` strings, rates via `fmt`.
- `Stats.fileName(game)` → "<equipo>-vs-<rival>-<dd-mm-aaaa>.png" rules of RF-24.
- `Stats.shareId(bytes)` → 16 chars, `bytes[i] % 62` into `[A-Za-z0-9]` (page passes `crypto.getRandomValues`).
- `Stats.shareLink(dir, uid, id)` → `dir + "ver.html#p=" + uid + "." + id`; `Stats.parseShare(hash)` → `{uid, shareId}` for
  `/^#?p=([\w-]{1,128})\.([A-Za-z0-9]{16})$/`, else null.
- `Stats.orphans(ids, entries)` → ids not equal to any live entry's `shareId`.
- `Stats.batchAdd(roster, team, ids)` → `{roster, added:[names]}` (team order; present ids skipped).
  `Stats.addedMsg(names)` → "<name> agregado al partido" / "<n> agregados al partido".

view.js (DOM, both pages): `View.lineScore(game)`, `View.boxScore(rec)` (titles from `COL_TITLES`, no sort buttons,
`tfoot` "Equipo", `details.hint` key), `View.innGrid(rec)` (`table.sheet`, header "n out" without ⚠, `div.sheet-cell`
cells, `p.hint` "• anotó carrera · número pequeño: orden del turno"), `View.switcher(tab, onChange)` (aria-pressed +
`btn-default`).

index.html:
- RF-1: Juegos row "Ver" (`openGameView(x.id)`) before "Editar" (today's Abrir handler), then ✕.
- RF-2/8/9/10: `var statsGame = null` (`{id, tab}`) beside `statsDetail`; `openStats` renders `renderGameView` when
  `statsViewName === "games" && statsGame` and it returns true (false when the id is not live → list, RF-9). Body: "←
  Juegos", `h3` title (tabIndex −1, focused on open), result + " · Publicado", line score, switcher, box score | grid,
  "Compartir" (`shareGame(rec.id)`, T7a) and "Editar". `statsView` `close` listener clears `statsGame`/`statsDetail`.
- RF-11: `openActions("Compartir", items)`; `ICONS.link` added.
- RF-12–16/20/22: `shareBusy`, `within6s(p)` (copy of 4419–4422), `publicDir()`, `copyLink(rec)`, `storeShare(id, sid)`
  as described in Algorithms; clipboard per F4; refused → `toast(link, null, true)` + `.toast span{word-break:break-all}`.
- RF-17: `saveCapture` copies `shareId` from the latest stored live entry before the merge; after a successful `lsSet`,
  `cloud.putPublic(...)` fire-and-forget.
- RF-18: `askConfirm(..., true)`; `within6s(cloud.deletePublic(sid))` → entry without `shareId`, `savedAt = now`.
- RF-19: `unpublishQuiet(rec)` called from the delete handler (one line in T6, defined in T7a).
- RF-21: in the stats watch: `if(!fromCache && !pending && !shareBusy) setTimeout(sweepPublic, 0)`.
- cloud: `putPublic(id, json)`, `deletePublic(id)`, `listPublic()` on `users/{uid}/public`.
- RF-23/24: `svgToPng(svg, w, h)` (from `lineupPngBlob`); `buildGameSvg(rec, more)` W 1080, light palette hard-coded
  (never `getComputedStyle`), names cut by an `anchoTexto` loop; `shareGameImage(rec, more)` per RF-24.
- RF-32: when `!blank` only the note "Marca en la banca quién vino a este partido."
- RF-33–39: absent rows with `label.nm-check > input.check` (Roster copy), `absentSel` reset at a game switch and
  filtered each render; "Agregar (n)" / "Vinieron todos" plain `btn btn-sm`; handler via `Stats.batchAdd`, sticky toast,
  `undoNoVino` generalized to `undoBench` (`kind` add/remove); focus to `#absent summary` or the Banca heading.
- RF-40: header wrappers `#capBar` (h3 + `#capMore` "⋯" popovertarget) / `#capTools[popover]` / `#capFoot`; desktop
  `display:contents` (identical layout); phone flex column with the bottom bar and safe-area padding.
- RF-41: `btnCapture.classList.toggle("btn-key", S.order.length > 0 || !!S.statsId)` in `renderRoster`.
- RF-42: phone grid rows for `table.stat.det` (line 2 = Turnos full width; Turnos header hidden).
- RF-43: `.inp::placeholder{color:var(--ink-2);opacity:1}` (light ≈ 6.0:1; dark measured in the task).

ver.html: fonts + theme metas, no manifest/SW; CSS subset copied from index.html with a comment "copiado de index.html
(010): si cambia allá, cambia aquí"; scripts `stats.js`, `view.js`, module with `initializeApp` (same config),
`initializeFirestore(app, {localCache: memoryLocalCache()})`, `getDocFromServer`; no `firebase-auth` import. Flow:
`parseShare` null → RF-27; 10 s race → `!exists` or `permission-denied` → RF-27; other → RF-28 + "Reintentar"
(`location.reload()`); ok → title, result, line score, switcher, body.

## Algorithms / rules
- Published = `!!entry.shareId`, derived at every render (RF-22 falls out).
- Share writes: copy first, entry after the ack (RF-12); unpublish: delete first, entry after the ack (RF-18). The 6 s
  race never cancels the SDK write: a late copy is an orphan for RF-21.
- Sweep only on a server snapshot with no pending writes and `!shareBusy` (F2), against local live entries after merge.
- Box score rows are the sheet rows; `tally` is the single counting rule shared with `players`.
- Batch undo: one `benchUndo`, dropped by the next `save()`, plus "every added id is still a player".

## Test strategy
`node --test 'tests/*.test.js' < /dev/null`. `tests/gameview.test.js`: boxScore (order, subs, empty row zeros + "—", no
`pid`, team = sum, equals `players` for a one-game fixture); resultLine 4 cases + string runs; viewTitle; lineScore
(home us ⇒ them first, totals, blank names); publicCopy (deep-equal whitelist from a fixture with extra keys); imageTable
11 vs 16 columns; fileName (blanks, spaces, invalid chars, no date); shareId (length, alphabet, deterministic);
shareLink/parseShare round trip + rejects; orphans (tombstone's id is an orphan). `bench.test.js`: batchAdd team order,
skips present ids, names; addedMsg singular/plural. Existing `players` tests stay green.
Browser (orchestrator, localhost:8001, Kevin's session, 360×640 + desktop, light + dark): every RF once, the public
link in a private window, playground results, ends with the game unpublished.

## Risks
- F1–F8. `popover` inside a modal `<dialog>` and `display:contents` on desktop (RF-40): screenshot before/after.
- Firebase config and SDK URL duplicated in `ver.html` (comment; bump both).
- A shared link is only as private as the chat it is sent to.
- T6 calls `shareGame`/`unpublishQuiet` defined in T7a (hoisted declarations); in T6's worktree those clicks throw until
  the merge, so T6's Done-when excludes them.

## Constitution check
1 Simplicity ✔ (two new repo files, no dependency) · 2 Spec rules ✔ (F1, F2 flagged additions) · 3 Logic apart ✔ ·
4 Tests ✔ · 5 Data **exception** (`users/{uid}/public/*` readable by exact path; approved by Kevin 2026-11-08) ·
6 Offline ✔ (ASSETS + v8; publish needs signal by spec) · 7 Language ✔ · 8 Ask first ✔ (rules by Kevin; push and the
demo publish are his).

## Orchestrator review (2026-11-08) — wins over the body
- D1 (F3): ties read **"Empate 3–3"** in the game view too (`resultLine` reuses `Stats.result`'s word), so the Juegos
  row and the view agree; spec RF-2's "Empatado" is read as this. Kevin can overrule at G2.
- D2 (F6): `popover` is fine for Kevin's phone unless he says it is older than iOS 17 / Chrome 114 (asked at G2); the
  fallback stays in the task as a stretch only if needed.
- D3: RF-41 moves into T2 (index.html 2232–2239 is adjacent to T2's 2240–2254: one hunk, no merge conflict); T4 keeps
  only CSS (after 224, after 749).
- D4: T7a's demo uses a throwaway stats entry, never a real game; the one real-game publish happens in T9 with Kevin's OK.
- D5: share `view.js` (one implementation for both pages), duplicate the CSS subset in `ver.html` (no refactor of
  index.html's `<style>`).
