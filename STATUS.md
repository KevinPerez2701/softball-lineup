# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-06 09:58 UTC-4 by Claude

## Now (one line)
Idle — spec 001 change T16 done (not pushed yet); Pages live again on 8123cd5 (spec 004).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | done | — | — | — |
| 004-critique-fixes | done | — | — | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Re-run `/impeccable critique` after spec 004 to measure heuristics 4 and 5 (were 2/4 before 004). Not covered by the 004 demo: RF-13 backdrop tap and back button, RF-2 storage-failure toast.

## Recently done (keep last 10)
- 2026-11-06 · 001 · T16 done — refreshRows: rows of players in the lineup take num/name/pos from it; reviewer APPROVE; 112/112 green
- 2026-11-06 · — · Pages: the 8123cd5 deploy had failed ("in progress deployment" left by the stuck f476807 one); rebuild requested on Kevin's OK → built, sw v7 live
- 2026-11-06 · 001 · change: RF-8 amended — rows of players in the lineup take number, name and position from it (Kevin, after loading MSO vs Call 2 · 05/11 with Pages stuck on 7bf41b4)
- 2026-11-05 · 004 · T4 + T7 done — field cards fit names 11.5→10 px without jersey; sw.js v7; browser demo on 127.0.0.1: 9/9 checklist steps ✔ (all closed-list confirms red with focus on Cancelar, RF-10 still locked, Guardar y salir, HR run/CI and undo, Sin marcador, column titles, Guardado ✓, cards no overlap); spec closed
- 2026-11-05 · 004 · T1, T2, T3, T5, T6 done in parallel worktrees, each reviewed (APPROVE) and merged; 112/112 green on main
- 2026-11-05 · 004 · plan.md (fable + review D1: red resting .btn-danger app-wide) and tasks.md in 3 parallel waves (T1–T7)
- 2026-11-05 · 004 · Spec drafted and clarified (clarifier NEEDS WORK: 4 blocking, 9 minor; Kevin answered BO, extra confirms, HR undo, long names) → 18 RFs
- 2026-11-05 · 003 · Browser checks closed: RF-39 (Guardar with the saved-list write failing: error toast, list and link unchanged) ✔, RF-7 (stats save with the saved-list write failing: stats, lineup and list unchanged, sheet stays open, error toast) ✔, 375 px (no horizontal scroll, header Guardar/Compartir/Más, 10 cards ≥ 10 px without overlaps, "Call · Visita"/"MSO · Casa") ✔
- 2026-11-05 · 003 · T16 done — sw.js v6 + network-first fetch with cache no-cache (fixes new page + stale stats.js after a deploy); browser demo 15/16 ✔ at 360/800/1440, the ✘ (RF-38 empty text after deleting the last game) fixed; detector: no new findings; 108/108 green. Spec closed by Kevin (G3)
- 2026-11-05 · 003 · T15 done (orchestrator, measured in the browser at 360 px with SF+4F+DH, 12 cards): every field-card text ≥ 10 px via max(10px, …cqw), padding .4cqw, BD 83.6% and C 94% → no overlaps, "Kevin P."/"Keven P." uncut. Found: the SW network-first fetch goes through the HTTP cache, so a deploy can pair a new index.html with an old stats.js (Stats.unsaved missing) → fix in T16

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
