# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-06 11:20 UTC-4 by Claude

## Now (one line)
Spec 005 (JS + grouped picker + undo a deleted turn) clarified, waiting for G1. Critique re-run 29/40 (4 and 5 up to 3); Kevin took every item, stats on phone first: specs 006 (stats on phone) and 007 (keyboard/screen reader, lime, labels) to draft. New report from Kevin: batting order does not adjust when a player is added (needs details).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | done | — | — | — |
| 004-critique-fixes | done | — | — | — |
| 005-fielders-choice | clarify (done) | — | G1 | Kevin (G1) |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Not covered by the 004 demo: RF-13 backdrop tap and back button, RF-2 storage-failure toast.

## Recently done (keep last 10)
- 2026-11-06 · 005 · Spec drafted from Kevin's answers, widened to the grouped picker + undo delete, clarifier READY (0 blocking, 3 minor applied)
- 2026-11-06 · — · impeccable critique re-run after 004: 29/40 (H4 3, H5 3); snapshot .impeccable/critique/2026-11-06T14-56-11Z__index-html.md (git-excluded)
- 2026-11-06 · 001 · T16 done — refreshRows: rows of players in the lineup take num/name/pos from it; reviewer APPROVE; 112/112 green
- 2026-11-06 · — · Pages: the 8123cd5 deploy had failed ("in progress deployment" left by the stuck f476807 one); rebuild requested on Kevin's OK → built, sw v7 live
- 2026-11-06 · 001 · change: RF-8 amended — rows of players in the lineup take number, name and position from it (Kevin, after loading MSO vs Call 2 · 05/11 with Pages stuck on 7bf41b4)
- 2026-11-05 · 004 · T4 + T7 done — field cards fit names 11.5→10 px without jersey; sw.js v7; browser demo on 127.0.0.1: 9/9 checklist steps ✔ (all closed-list confirms red with focus on Cancelar, RF-10 still locked, Guardar y salir, HR run/CI and undo, Sin marcador, column titles, Guardado ✓, cards no overlap); spec closed
- 2026-11-05 · 004 · T1, T2, T3, T5, T6 done in parallel worktrees, each reviewed (APPROVE) and merged; 112/112 green on main
- 2026-11-05 · 004 · plan.md (fable + review D1: red resting .btn-danger app-wide) and tasks.md in 3 parallel waves (T1–T7)
- 2026-11-05 · 004 · Spec drafted and clarified (clarifier NEEDS WORK: 4 blocking, 9 minor; Kevin answered BO, extra confirms, HR undo, long names) → 18 RFs
- 2026-11-05 · 003 · Browser checks closed: RF-39 (Guardar with the saved-list write failing: error toast, list and link unchanged) ✔, RF-7 (stats save with the saved-list write failing: stats, lineup and list unchanged, sheet stays open, error toast) ✔, 375 px (no horizontal scroll, header Guardar/Compartir/Más, 10 cards ≥ 10 px without overlaps, "Call · Visita"/"MSO · Casa") ✔

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
