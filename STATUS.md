# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-05 11:35 UTC-4 by Claude

## Now (one line)
Spec 003 — T9 next (start empty: fresh/stored, save guard, applyRemote branch). G1 approved, G2 pre-approved by Kevin 2026-11-05. Pushed through 7290a62 (Kevin: push when I see fit).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | implement | T9 | T10 | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- (none)

## Recently done (keep last 10)
- 2026-11-05 · 003 · T8 done — stats save also updates the open game (K_STATS → K_CUR → K_SAVED, full rollback on failure), "Guardar estadísticas", title "<team> vs <opp> · dd/mm", focus on Cerrar, legend; reviewer APPROVE (rare double-failure pending-put note accepted, same as HEAD)
- 2026-11-05 · 003 · T7 done — Abrir juego list (time, result, Estadísticas/Abierto pills, empty text), open + Nuevo guards, delete of the open game, game wording; reviewer APPROVE; orchestrator: failed delete write now toasts instead of claiming success
- 2026-11-05 · 003 · T6 done — saveGame (replace/add, 200 cap confirm, write failure), Guardar como nuevo, cross-device conflict prompt, mergeFirst without the 60 cut; reviewer APPROVE; orchestrator: saved copy carries its own link, list re-read at commit, plural "se borran"
- 2026-11-05 · 003 · T5 done — normalizers parametrized (7 callers), normalizeState/linkedGame/hasUnsaved, askChoice with a locked mode (reopens if a second Esc closes it); reviewer APPROVE; 108/108 green. Browser boot check deferred to T16
- 2026-11-05 · 003 · T4 done — Stats.shortName/shortNames + cardNames() in field, image and ticket (BD included whenever set); review BLOCK (initial-word test gap) fixed by the orchestrator + cross-group collision fix; 108/108 green. Browser check of the field deferred to T16
- 2026-11-05 · 003 · T1–T3 done — saved-games pure logic in stats.js (11 functions), 24 tests, 101/101 green; reviewer APPROVE (dead POS line and sameInts→diffInts fixed by the orchestrator)
- 2026-11-05 · 003 · plan.md (fable planner + orchestrator review R1–R4) and tasks.md (T1–T16)
- 2026-11-05 · 003 · G1 approved by Kevin; clarifier pass 2 on the design RFs (7 blocking, 13 minor) resolved: 42 RFs
- 2026-11-05 · 003 · Impeccable critique (dual-agent): 25/40, 3 P1 + 2 P2; Kevin chose all four design groups → RF-18–34 added to spec 003
- 2026-11-05 · 003 · Spec drafted (14 RFs), clarifier NEEDS WORK (7 blocking, 9 minor); Kevin answered 8 decisions; spec rewritten to 17 RFs, 0 open questions
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
