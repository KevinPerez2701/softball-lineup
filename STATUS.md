# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-06 12:51 UTC-4 by Claude

## Now (one line)
Spec 008 (third critique pass, 23 RFs) clarified, G1+G2 approved by Kevin ("apruébalo de una vez e inicia") — planning. 001–007 live (a7fe5e7); critique 30/40.

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
| 008-critique-third | plan | — | — | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Demos: decided by Kevin 2026-11-06 — localhost:8001 (own origin; 127.0.0.1 is blocked by the key's referrer list), read-only; recorded in CLAUDE.md.
- Not covered by the 004 demo: RF-13 backdrop tap and back button, RF-2 storage-failure toast.

## Recently done (keep last 10)
- 2026-11-06 · critique · Impeccable re-measure after 005–007: 30/40 (29 → 30, H2 +1), P0 0, P1 2 (phone player detail hides AVE/OBP/OPS at 360 px; keyboard open of a player detail drops focus to body). P2: lime still on filled slot numbers, roster checkboxes and dark focus ring; anonymous turns in the turn list and picker. Detector 22 findings, unchanged (mostly false positives / print sheet). Snapshot .impeccable/critique/2026-11-06T16-05-43Z__index-html.md
- 2026-11-06 · 005+006+007 · One deploy (a7fe5e7, Pages built; first load already served the new stats.js). Data ops in prod: Elias Colmenarez 05/11 inning 5 Rolling → JS (1 out, inning still 3 out), "MSO vs Call · 2026-10-29" renamed "MSO vs Call · 29/10/2026" (synced, dirty cleared)
- 2026-11-06 · 007 · T3, T5, T6, T7 done in parallel worktrees, reviewer APPROVE, merged (131/131, inline scripts node --check OK). Browser demo on localhost:8000 (Kevin's session, nothing saved, game restored by reopening): Abrir juego by game date with "Sin fecha" last; pill "Softball · 5 innings"; "− Inning"; Final hidden at 0–0, shown at 7–6; picker/drag swap/Autoasignar/BD append to the order, replaced BD and "Quitar" keep their place; one solid lime on the main screen (Guardar); picker Space keeps focus (Rolling, Anotó carrera), outlines thin (default) / 2 px (changed); cell names read "Kevin Perez, inning 1, turno 2: E, anotó carrera, turno 10: Fly" and "…, sin turnos"; sheet title "MSO vs Call 2 · 05/11"; Juegos "Récord 2–1–0", "19/10/2026" without "vs rival"; Enter on a player name opens the detail and "← Jugadores" returns focus; at 360 px AVE visible and the name column sticky
- 2026-11-06 · 007 · T1 (orderAfterAssign, cellName), T2 (dateLabel, sheetTitle, gameTitle, savedByDate, recordText; validIso moved onto Stats at merge), T4 (btn-thin, btn-sm.btn-default, RF-8 demotions) — reviewers APPROVE, merged, 131/131
- 2026-11-06 · 005+006 · Browser demo on localhost:8000 (Kevin signed in; 127.0.0.1 cannot sign in: the API key's referrer list blocks it): picker 4 labeled rows, JS title/aria-label, chips 44 px, JS → 1 out with "Más detalles" closed; delete → "Turno borrado · Deshacer" restores the turn and its numbering; a later change drops the undo; runner out delete/undo; close + reopen shows no stale notice; Jugadores in RF-1 order with Equipo and key; detail AVE/OBP/OPS between K and Turnos = table (.400/.500/1.400 for Kevin); at 360 px AVE/OBP/SLG visible on open. Fix found in the demo (D2): at 360×640 the picker scrolled and "Listo" sat below the fold → row labels moved to the left of each row (.pa-row); now 413 px, no scroll. Also found: the working lineup on localhost had lost its roster/field/order (saved game intact); reopened the saved game
- 2026-11-06 · 005 · T4 done (grouped picker rows, JS title/aria-label, 44 px chips, closeCapture hides a pending undo — gap left by T3) + 006 · T1 done (Stats.STAT_COLS rates first, detail AVE/OBP/OPS from the players row); reviewer APPROVE both; merged clean; +key-order assertion; 117/117
- 2026-11-06 · 005 · T1–T3 done in parallel worktrees (JS code + groups + default outs; views tests; undo a deleted turn), reviewer APPROVE, merged, 115/115 green
- 2026-11-06 · 006 · plan (fable; D1: detail rates from the players row) and tasks
- 2026-11-06 · 005 · Spec drafted from Kevin's answers, widened to the grouped picker + undo delete, clarifier READY (0 blocking, 3 minor applied)
- 2026-11-06 · — · impeccable critique re-run after 004: 29/40 (H4 3, H5 3); snapshot .impeccable/critique/2026-11-06T14-56-11Z__index-html.md (git-excluded)

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
