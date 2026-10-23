# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-10-23 19:32 UTC-4 by Claude

## Now (one line)
Idle — project complete: specs 001 and 002 done and live on Pages, backlog empty.

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- (none)

## Recently done (keep last 10)
- 2026-10-23 · — · Backlog closed by Kevin: pitching, opponent and defensive stats, spray chart and CSV export will not be built; the inning-by-inning entry was already shipped as spec 002. Demo gaps accepted: 002 step 22 (phone) approved, he reports if it fails; 001 offline save and two-devices-offline (steps 33–37) closed as not a real use case; 001 steps 18–19 closed with them
- 2026-10-23 · 002 · Spec done — Kevin closed it (G3) after the desktop demo in prod (21/22 ✔, sw.js stats.js fix b2f3d19); 21/21 RFs, 77 tests green
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page
- 2026-10-23 · 002 · T8 partial — validator: 21/21 RFs, 0 missing; README section; RF-4/5/19 wording aligned; message when every batter has 2 turns; demo checklist
- 2026-10-23 · 002 · T6 done — guided mode (opus implementer), reviewer APPROVE; orchestrator: advance skips innings already closed
- 2026-10-23 · 002 · T4 done — outs chips, ord, renumber, runner outs list + roPick, sub flag; reviewer APPROVE. Orchestrator: merge conflict resolved, re-tapping the same result keeps outs, "Out corriendo" also in a full cell (RF-16 amended)
- 2026-10-23 · 002 · T5 + T7 done — grid shows turn order, runner outs, inning outs + ⚠; AR column; sw v5; reviewer APPROVE. RF-8 amended: blank at 0 outs, ⚠ above 3 in the last inning too (+test)
- 2026-10-23 · 002 · T2 done — slots, dueBatter, nextOrd, renumberOrd; review BLOCK (fallback test let an inning-blind mutant pass) fixed by the orchestrator, mutant now fails
- 2026-10-23 · 002 · T3 done — cs + runner-out-only players in players/playerGames, 5 tests, reviewer APPROVE
- 2026-10-23 · 002 · T1 done — outs, runner outs, cell lines, minInnings with ro; 13 tests; reviewer APPROVE (12a46bc).

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
