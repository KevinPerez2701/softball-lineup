# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-05 11:21 UTC-4 by Claude

## Now (one line)
Spec 003 — T5 next (normalizeState, linkedGame, hasUnsaved, askChoice). G1 approved, G2 pre-approved by Kevin 2026-11-05. Pushed through 7290a62 (Kevin: push when I see fit).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | implement | T5 | T6 | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- (none)

## Recently done (keep last 10)
- 2026-11-05 · 003 · T4 done — Stats.shortName/shortNames + cardNames() in field, image and ticket (BD included whenever set); review BLOCK (initial-word test gap) fixed by the orchestrator + cross-group collision fix; 108/108 green. Browser check of the field deferred to T16
- 2026-11-05 · 003 · T1–T3 done — saved-games pure logic in stats.js (11 functions), 24 tests, 101/101 green; reviewer APPROVE (dead POS line and sameInts→diffInts fixed by the orchestrator)
- 2026-11-05 · 003 · plan.md (fable planner + orchestrator review R1–R4) and tasks.md (T1–T16)
- 2026-11-05 · 003 · G1 approved by Kevin; clarifier pass 2 on the design RFs (7 blocking, 13 minor) resolved: 42 RFs
- 2026-11-05 · 003 · Impeccable critique (dual-agent): 25/40, 3 P1 + 2 P2; Kevin chose all four design groups → RF-18–34 added to spec 003
- 2026-11-05 · 003 · Spec drafted (14 RFs), clarifier NEEDS WORK (7 blocking, 9 minor); Kevin answered 8 decisions; spec rewritten to 17 RFs, 0 open questions
- 2026-11-05 · — · Quick fix: the stats sheet scoreboard put our team on top even as home club; it now follows `home` (visitor on top, home below), like the lineup scoreboard. 77 tests green
- 2026-10-23 · — · Backlog closed by Kevin: pitching, opponent and defensive stats, spray chart and CSV export will not be built; the inning-by-inning entry was already shipped as spec 002. Demo gaps accepted: 002 step 22 (phone) approved, he reports if it fails; 001 offline save and two-devices-offline (steps 33–37) closed as not a real use case; 001 steps 18–19 closed with them
- 2026-10-23 · 002 · Spec done — Kevin closed it (G3) after the desktop demo in prod (21/22 ✔, sw.js stats.js fix b2f3d19); 21/21 RFs, 77 tests green
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
