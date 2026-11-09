# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-09 12:41 UTC-4 by Claude

## Now (one line)
Spec 012 done and committed (sw v11); deploy push pending (the harness blocked it; Kevin pushes or allows it). Specs 001–011 live (011: 5569511, Pages built; critique 31/40). "MSO vs Call · 06/11/2026" published; its link opens on Pages from a browser that has the app (F1 ok on desktop). Pixel check done 2026-11-09 08:51: the link opens the public game view (not the app) and reads well.

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | done | — | — | — |
| 004-critique-fixes | done | — | — | — |
| 005-fielders-choice | done | — | — | — |
| 006-stats-phone | done | — | — | — |
| 007-critique-rest | done | — | — | — |
| 008-critique-third | done | — | — | — |
| 009-bench-attendance | done | — | — | — |
| 010-game-view-share | done | — | — | — |
| 011-critique-fourth | done | — | — | — |
| 012-critique-fifth | done (push pending) | — | — | Kevin (push) |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- 010 limits (T7a review): (a) two devices — B's sweep on a server snapshot can delete A's just-published copy before A's stats upload lands (no stats lost; the link shows "no publicado" until the next Copiar enlace or capture save rewrites it); (b) publish/unpublish stamp savedAt = now, so a newer offline edit of the same game on another device loses the merge (same as a stale capture save today).
- Constitution §5 exception (010, Kevin 2026-11-08): `users/{uid}/public/*` is readable by anyone who knows the exact path (public game copies, whitelisted by `Stats.publicCopy`); `data/*` stays owner-only. Rules published 2026-11-08 from the Google Cloud console (the Firebase console's Publicar did not render); anonymous REST checks: get public 404 (allowed, missing), list public 403, get data/stats 403, create public 403.
- Demos: decided by Kevin 2026-11-06 — localhost:8001 (own origin; 127.0.0.1 is blocked by the key's referrer list), read-only; recorded in CLAUDE.md.
- Not covered by the 004 demo: RF-13 backdrop tap and back button, RF-2 storage-failure toast.

## Recently done (keep last 10)
- 2026-11-09 12:41 · 012 · T1–T4 in parallel worktrees, opus reviewers APPROVE all four, merged; sw v11; 178/178. T5 demo on localhost:8001 (Kevin's session, read-only) + headless touch phone with a stub cloud: RF-1 light selected Jugadores rgb(238,245,180) fill / rgb(93,107,0) border / ink text, unselected white / line-2; dark transparent / rgb(203,221,34); ver.html Totales / Por inning light the same; RF-3 empty game: body.game-empty, Banca above Orden; after Vinieron todos (stub): class off, Orden first, focus on the Banca h2 (010 RF-38); RF-4 ver.html one h1 "MSO 8 – 17 Call", height 48.4 desktop / 44.0 at 360 (= the score's line box, unchanged); #p=x.y no h1, no footer; RF-5 "Call" as in the line score; RF-6 footer "Diamante 10 · actualizado 08/11/2026 · 5:02 p. m." (ink-3), stays after the last table with Por inning; RF-7 "Nadie marcado para este partido" on the empty game, "El campo está vacío" with players; RF-8 "Atenuados: menos de 9 AP" above the table. Not observed: RF-2 focus ring on a filled chip (outline is independent of fill/border; traced by the T2 review)
- 2026-11-09 12:04 · critique · Impeccable re-measure after 011 (dual-agent + orchestrator touch emulation): 31/40 (30 → 31, H1 +1). P0 0, P1 0. P2: light-theme selected toggles only a 2 px lime border (~1.6:1); phone box score digits tight (VB/H/BB/K 14–22 px; Kevin approved this layout on his Pixel); phone Orden 27% fixed chrome, check-in list ~420 px down. P3: Autoasignar/Vaciar campo disabled without reason; ver.html no h1 / attribution. Detector 26, unchanged (all false positives or unconfirmed). Snapshot .impeccable/critique/2026-11-09T16-03-56Z__index-html.md
- 2026-11-09 12:04 · 011 · RF-6/RF-7 checked under touch emulation (headless Chrome via CDP, pointer: coarse, 360×740; app started with a stub cloud and a 12-player test team in a temp profile, ver.html with the real link): bar flush on the tab bar (672/672), Agregar 336×44, rows 46; tap heights LF/CF/RF 45, SF 41, C 31, infield ~29 (by design, plan F1); short names all fit; Juegos ✕ gap 12; btn-sm 44; ver.html toggles 44; field 338/338. Spec 011 done
- 2026-11-09 11:52 · 011 · T1–T6 in parallel worktrees, opus reviewers APPROVE (T2 BLOCK: toast offsets also moved toasts inside dialogs → child combinator, phone padding screen-only, desktop 150 px; fixed at merge). T7 demo on localhost:8001 (Kevin's session, read-only; only checkbox ticks): desktop bar 65 px, "Agregar (3)" lime 44 px, right-aligned under Banca (orchestrator: a full-width lime strip over the field read too heavy), toast 25 px above it, fold hides / reopen keeps n, name tap toggles; phone 360×640 bar 65 px flush on the tab bar (66 → 68 px fix), button 317×44, rows 46 px, last row clears the bar (475 < 503), padding 148/214, hidden on Campo, back on Orden with the same n; RF-8 focus on the h3 of Estadísticas, Abrir juego, Roster, Más, Compartir, Asignar; sort kept focus on the header only after a fix (re-focus by data-k); RF-16 AVE sort: 9 qualified, 8 dimmed, "Atenuados: menos de 9 AP", aria ", pocos AP", dim ink light #5f6c62 / dark #8a958a; RF-17 "Récord 2 G · 2 P · 0 E"; RF-20/24 Abrir rows "MSO vs Call" + "06/11/2026 · Perdido 8–17 · Estadísticas", no pills; RF-21 legend; RF-22 "Marcador y estadísticas"; RF-23 title 14 px 73/73 at 360; RF-25 "Nadie marcado para este partido"; RF-18 short names all fit at 360 — 1B/2B/3B also cut (56–61 px in 51) → "1ra/2da/3ra base" added (spec clarified, test first); RF-19 empty dashed jersey; ver.html desktop: header "MSO 8 – 17 Call" 44 px, "Perdido · 06/11/2026", title = game, wrap 760, line score cells ≥ 52; 360 light: score 40 px, cells 29, no sideways scroll (321/321); #p=x.y → message + "Abrir Diamante 10", title "Diamante 10"; two quick hash changes → the last game. App game view at 360: 28 px cells scrolled (313/294) → 26 px on the phone (spec clarified), 294/294. Not observed: RF-6/RF-7 (coarse pointer; Pixel after deploy), 0–0 header (tested), "Abierto" text (no open game). 176/176
- 2026-11-09 10:57 · 010 · tasks.md drift: T5 (ver.html, view.js, sw v8) was done in b9ffcd9 but unchecked; Done when re-observed (node --check view.js OK, sw.js lists both assets + navigate branch, 166/166) and marked [x]
- 2026-11-09 08:51 · 010 · Kevin opened the public link of "MSO vs Call · 06/11/2026" on his Pixel with the app installed: public view (Perdido 8–17, line score, Totales/Por inning/Más columnas, Equipo row), not the app. Link re-checked in Chrome first
- 2026-11-08 20:54 · 010 follow-up (Kevin) · image copies to the clipboard (Copiar imagen); phone game view and ver.html: 10 columns + Más columnas, compact line score, names cut at 92 px, no title outline; sw v9. Checked at 360 px on localhost:8001 (app view and ver.html both 294/294 and 321/321 wide, no sideways scroll)
- 2026-11-08 20:47 · 010 quick fix (Kevin) · game view: Compartir and Editar moved to the top row next to "← Juegos"; checked at 360 px on localhost:8001
- 2026-11-08 20:24 · 010 · T9 browser demo on localhost:8001 (Kevin signed in): RF-32 note without button; RF-33/34 Equipo (27) checkboxes (aria name, ink), Agregar (0) disabled → (2) → (3) by tapping a name, Vinieron todos, all plain; RF-41 Anotar estadísticas not lime with empty order; RF-1 Ver/Editar/✕; RF-2–5 view (title, Perdido 8–17, line score MSO visitor on top with C, Totales 16 cols + Equipo, Por inning read-only 9 rows 3 out each, legend), focus on h3, switch keeps the dialog top (80→80); RF-11 menu (3 items unpublished, 4 published); RF-23/24 both PNGs captured via a stubbed share: light, 1080, C column, no cut stats, file MSO-vs-Call-06-11-2026.png; RF-12 publish → shareId 16, ' · Publicado', synced; anonymous REST read of the copy: keys game/rows only, no pid/savedAt/shareId; ver.html desktop + 360 px (sideways scroll), RF-27 for #p=x.y and a missing id; RF-18 unpublish confirm (danger, focus Cancelar) → old copy 404; republished (new id) and left published; RF-40 phone header one row + ⋯ popover (date, ±Inning, guide) + bottom bar; desktop header unchanged (one row, date ink); RF-42 phone detail two lines; RF-43 placeholder ink-2. Fixes found in the demo: (1) a clipboard that never answers left no feedback → 3 s fallback shows the link (RF-20), observed; (2) RF-16 'Publicado' was missing in the Juegos row → added, observed. Not observed live: batch add/undo (writes; traced by the T2 review), light theme of ver.html, RF-15/16/28 offline paths.
- 2026-11-06 15:32 · critique · Impeccable re-measure after 008+009 on live prod (dual-agent): 30/40 (30 → 30; H2 −1 for the AVE ranking without an AP qualifier, the rest steady). P0 0, P1 1: empty-game attendance has two paths (Marcar asistencia CTA + open Equipo (26) list) and no batch check-in. P2: phone capture header 3 rows with Guardar at the top; Anotar estadísticas always solid lime; AVE ranking without a qualifier; phone player detail cuts the Turnos column. Detector 22, unchanged; overlay: placeholder contrast 3.2:1 on Nombre del equipo/Rival. Snapshot .impeccable/critique/2026-11-06T19-32-04Z__index-html.md

## Backlog (ideas not yet specified)
- (critique 31/40 leftovers done in spec 012; phone box score density kept by Kevin)
