# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-06 14:31 UTC-4 by Claude

## Now (one line)
Spec 008 deployed (861b526, Pages built; critique re-run left). Spec 009 (bench attendance: "No vino" + Deshacer, "No vinieron" with "Vino") clarified (13 RFs, clarifier blocking items resolved, 2 answered by Kevin) — waiting for G1.

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
| 008-critique-third | validate | T10 (critique re-run) | — | — |
| 009-bench-attendance | clarify (G1) | — | — | Kevin G1 |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Demos: decided by Kevin 2026-11-06 — localhost:8001 (own origin; 127.0.0.1 is blocked by the key's referrer list), read-only; recorded in CLAUDE.md.
- Not covered by the 004 demo: RF-13 backdrop tap and back button, RF-2 storage-failure toast.

## Recently done (keep last 10)
- 2026-11-06 · 008 · T10 browser demo on localhost:8001 (Kevin signed in, nothing saved; sheet edits undone, closed without saving). Desktop 1800 px dark + phone 360×640 (same-origin iframe) dark and light: RF-1 "AVE .750 · OBP .750 · OPS 1.500 · 4 AP · 1 JJ", detail 9 columns; RF-2 Enter → focus on the h3; RF-3 slot numbers ink; RF-4 checkboxes ink; RF-5 ring ink on page/dialog, bar-ink on toast/tab bar/field; RF-6 1B/CI 0/BR 0/outs 0 2 px outline; RF-7 Guardar key only when dirty, Guardar estadísticas lime only after a change (plain again after undo/restore), Agregar lime only with non-blank text; RF-8 "Turno 1 · 1B · anotó carrera"; RF-9 "Luis Moreno · Inning 1 · Turno 9"; RF-10 "#9 1B" 11 px; RF-11 rule 4 ("Los 5 innings…", No primary) and rule 2 ("Inning 5: la hoja suma 1 carrera, el marcador 0", Sí primary); RF-12 toast still up after 8 s, Tab reaches Deshacer and ✕ "Cerrar aviso", Enter on Deshacer restores; RF-13 at 360×640 Call 2 row clears the toast (150 px padding); RF-14 4th tab, aria-current stays on Orden, focus back on the tab; RF-15 top 84.7/84.7/84.7 desktop, 64/64/64 phone; RF-16 header one line; RF-17 order; RF-18 Rol/Lín/FS second line; RF-19 Nuevo last; RF-20 **missing from every task → added `#savedBody .rowacts{gap:16px}`, 16 px measured**; RF-21 "+ Inning" first; RF-22 phone-only span; RF-23 ✕ 32 px desktop. "Estadísticas" fits (71 px label in an 82 px tab at 360 px). Known: light-mode field focus ring on clay ~2.6:1; after Deshacer the focus drops to the body
- 2026-11-06 · 008 · T1–T9 done in parallel worktrees, opus reviewers APPROVE (T3 BLOCK: toast focus ring invisible in light mode → `--focus:var(--bar-ink)` on .toast). Orchestrator fixes at merge: header Guardar initial class ghost + comment; hidden toast buttons no longer clickable/tabbable (visibility); cell line nowrap so "#10 Rol•" does not split. 135/135
- 2026-11-06 · critique · Impeccable re-measure after 005–007: 30/40 (29 → 30, H2 +1), P0 0, P1 2 (phone player detail hides AVE/OBP/OPS at 360 px; keyboard open of a player detail drops focus to body). P2: lime still on filled slot numbers, roster checkboxes and dark focus ring; anonymous turns in the turn list and picker. Detector 22 findings, unchanged (mostly false positives / print sheet). Snapshot .impeccable/critique/2026-11-06T16-05-43Z__index-html.md
- 2026-11-06 · 005+006+007 · One deploy (a7fe5e7, Pages built; first load already served the new stats.js). Data ops in prod: Elias Colmenarez 05/11 inning 5 Rolling → JS (1 out, inning still 3 out), "MSO vs Call · 2026-10-29" renamed "MSO vs Call · 29/10/2026" (synced, dirty cleared)
- 2026-11-06 · 007 · T3, T5, T6, T7 done in parallel worktrees, reviewer APPROVE, merged (131/131, inline scripts node --check OK). Browser demo on localhost:8000 (Kevin's session, nothing saved, game restored by reopening): Abrir juego by game date with "Sin fecha" last; pill "Softball · 5 innings"; "− Inning"; Final hidden at 0–0, shown at 7–6; picker/drag swap/Autoasignar/BD append to the order, replaced BD and "Quitar" keep their place; one solid lime on the main screen (Guardar); picker Space keeps focus (Rolling, Anotó carrera), outlines thin (default) / 2 px (changed); cell names read "Kevin Perez, inning 1, turno 2: E, anotó carrera, turno 10: Fly" and "…, sin turnos"; sheet title "MSO vs Call 2 · 05/11"; Juegos "Récord 2–1–0", "19/10/2026" without "vs rival"; Enter on a player name opens the detail and "← Jugadores" returns focus; at 360 px AVE visible and the name column sticky
- 2026-11-06 · 007 · T1 (orderAfterAssign, cellName), T2 (dateLabel, sheetTitle, gameTitle, savedByDate, recordText; validIso moved onto Stats at merge), T4 (btn-thin, btn-sm.btn-default, RF-8 demotions) — reviewers APPROVE, merged, 131/131
- 2026-11-06 · 005+006 · Browser demo on localhost:8000 (Kevin signed in; 127.0.0.1 cannot sign in: the API key's referrer list blocks it): picker 4 labeled rows, JS title/aria-label, chips 44 px, JS → 1 out with "Más detalles" closed; delete → "Turno borrado · Deshacer" restores the turn and its numbering; a later change drops the undo; runner out delete/undo; close + reopen shows no stale notice; Jugadores in RF-1 order with Equipo and key; detail AVE/OBP/OPS between K and Turnos = table (.400/.500/1.400 for Kevin); at 360 px AVE/OBP/SLG visible on open. Fix found in the demo (D2): at 360×640 the picker scrolled and "Listo" sat below the fold → row labels moved to the left of each row (.pa-row); now 413 px, no scroll. Also found: the working lineup on localhost had lost its roster/field/order (saved game intact); reopened the saved game
- 2026-11-06 · 005 · T4 done (grouped picker rows, JS title/aria-label, 44 px chips, closeCapture hides a pending undo — gap left by T3) + 006 · T1 done (Stats.STAT_COLS rates first, detail AVE/OBP/OPS from the players row); reviewer APPROVE both; merged clean; +key-order assertion; 117/117
- 2026-11-06 · 005 · T1–T3 done in parallel worktrees (JS code + groups + default outs; views tests; undo a deleted turn), reviewer APPROVE, merged, 115/115 green
- 2026-11-06 · 006 · plan (fable; D1: detail rates from the players row) and tasks

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
