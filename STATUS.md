# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-05 14:47 UTC-4 by Claude

## Now (one line)
Spec 004 — T1, T2, T3, T5, T6 merged (reviewed, APPROVE each); T4 (field cards) in progress; then T7 demo. Not pushed: push after T7. G1 approved, G2 pre-approved by Kevin 2026-11-05.

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | done | — | — | — |
| 004-critique-fixes | implement | T4 | T7 | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Spec 003 Done criteria: critique re-run 2026-11-05 scored heuristics 1=3, 4=2, 5=2, 6=3 (27/40). Open P1s: destructive confirms styled and focused as primary; HR saved without run/RBI and 0–0 counted as a tie. Snapshot in .impeccable/critique/ (git-excluded).

## Recently done (keep last 10)
- 2026-11-05 · 004 · T1, T2, T3, T5, T6 done in parallel worktrees, each reviewed (APPROVE) and merged; 112/112 green on main
- 2026-11-05 · 004 · plan.md (fable + review D1: red resting .btn-danger app-wide) and tasks.md in 3 parallel waves (T1–T7)
- 2026-11-05 · 004 · Spec drafted and clarified (clarifier NEEDS WORK: 4 blocking, 9 minor; Kevin answered BO, extra confirms, HR undo, long names) → 18 RFs
- 2026-11-05 · 003 · Browser checks closed: RF-39 (Guardar with the saved-list write failing: error toast, list and link unchanged) ✔, RF-7 (stats save with the saved-list write failing: stats, lineup and list unchanged, sheet stays open, error toast) ✔, 375 px (no horizontal scroll, header Guardar/Compartir/Más, 10 cards ≥ 10 px without overlaps, "Call · Visita"/"MSO · Casa") ✔
- 2026-11-05 · 003 · T16 done — sw.js v6 + network-first fetch with cache no-cache (fixes new page + stale stats.js after a deploy); browser demo 15/16 ✔ at 360/800/1440, the ✘ (RF-38 empty text after deleting the last game) fixed; detector: no new findings; 108/108 green. Spec closed by Kevin (G3)
- 2026-11-05 · 003 · T15 done (orchestrator, measured in the browser at 360 px with SF+4F+DH, 12 cards): every field-card text ≥ 10 px via max(10px, …cqw), padding .4cqw, BD 83.6% and C 94% → no overlaps, "Kevin P."/"Keven P." uncut. Found: the SW network-first fetch goes through the HTTP cache, so a deploy can pair a new index.html with an old stats.js (Stats.unsaved missing) → fix in T16
- 2026-11-05 · 003 · T13+T14 done (one batch) — picker "Más detalles" + outlined default chips; team names on the final scoreboard; import confirm; reviewer APPROVE (check long names at 1100 px and print in T16)
- 2026-11-05 · 003 · T11+T12 done (one batch, opus implementer) — header with game name + ●, Guardar as key, Compartir/Más reuse the phone sheets, unified labels; reviewer APPROVE; orchestrator: header redraw on capture rollback, "Instalar" label. Browser layout check in T16
- 2026-11-05 · 003 · T10 done — Recuperar lo último offer + locked RF-10 question; review BLOCK (focus landed on Descartar: a stray space would drop the stored lineup) fixed by the orchestrator with the reviewer's one-line fix (focus on Recuperar) + offer refresh when saved arrives while fresh
- 2026-11-05 · 003 · T9 done — app starts empty (fresh/stored), nothing written until the first change, remote current while fresh only updates stored; reviewer APPROVE; orchestrator: backup export uses the stored lineup while fresh
- 2026-11-05 · 003 · T8 done — stats save also updates the open game (K_STATS → K_CUR → K_SAVED, full rollback on failure), "Guardar estadísticas", title "<team> vs <opp> · dd/mm", focus on Cerrar, legend; reviewer APPROVE (rare double-failure pending-put note accepted, same as HEAD)
- 2026-11-05 · 003 · T7 done — Abrir juego list (time, result, Estadísticas/Abierto pills, empty text), open + Nuevo guards, delete of the open game, game wording; reviewer APPROVE; orchestrator: failed delete write now toasts instead of claiming success
- 2026-11-05 · 003 · T6 done — saveGame (replace/add, 200 cap confirm, write failure), Guardar como nuevo, cross-device conflict prompt, mergeFirst without the 60 cut; reviewer APPROVE; orchestrator: saved copy carries its own link, list re-read at commit, plural "se borran"
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
