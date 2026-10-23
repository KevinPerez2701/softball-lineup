# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-10-23 14:34 UTC-4 by Claude

## Now (one line)
Idle — specs 001 and 002 done and live on Pages. Next: pick from the backlog.

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Spec 002 demo step 22 (steps 4–8 on the phone) was not reported when Kevin closed the spec on 2026-10-23.
- Spec 001 demo was partial: Kevin checked the capture sheet live on 2026-10-23 and accepted ("está bien, luego lo
  pulimos"). Not reported as tested: offline save, two devices offline (specs/001-game-stats/demo.md steps 33–37),
  the Esc/back guard (step 18) and the console rollback check (step 19). Run them if a sync problem shows up.

## Recently done (keep last 10)
- 2026-10-23 · 002 · Spec done — Kevin closed it (G3) after the desktop demo in prod (21/22 ✔, sw.js stats.js fix b2f3d19); 21/21 RFs, 77 tests green
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page
- 2026-10-23 · 002 · T8 partial — validator: 21/21 RFs, 0 missing; README section; RF-4/5/19 wording aligned; message when every batter has 2 turns; demo checklist
- 2026-10-23 · 002 · T6 done — guided mode (opus implementer), reviewer APPROVE; orchestrator: advance skips innings already closed
- 2026-10-23 · 002 · T4 done — outs chips, ord, renumber, runner outs list + roPick, sub flag; reviewer APPROVE. Orchestrator: merge conflict resolved, re-tapping the same result keeps outs, "Out corriendo" also in a full cell (RF-16 amended)
- 2026-10-23 · 002 · T5 + T7 done — grid shows turn order, runner outs, inning outs + ⚠; AR column; sw v5; reviewer APPROVE. RF-8 amended: blank at 0 outs, ⚠ above 3 in the last inning too (+test)
- 2026-10-23 · 002 · T2 done — slots, dueBatter, nextOrd, renumberOrd; review BLOCK (fallback test let an inning-blind mutant pass) fixed by the orchestrator, mutant now fails
- 2026-10-23 · 002 · T3 done — cs + runner-out-only players in players/playerGames, 5 tests, reviewer APPROVE
- 2026-10-23 · 002 · T1 done — outs, runner outs, cell lines, minInnings with ro; 13 tests; reviewer APPROVE (12a46bc).
- 2026-10-23 · 001 · Spec done — G3 accepted by Kevin after a partial demo; 39/39 RFs implemented, 43 tests green, live on Pages (d1e9f7f).

## Backlog (ideas not yet specified)
- **Spec 002 candidate — inning-by-inning capture (Kevin, 2026-10-23):** fill the sheet one inning at a time
  following the batting order (the next batter comes up by himself, the inning starts with whoever is due), with
  an outs counter per inning (inning closes at 3 outs). Outs must be chargeable to the batter AND to runners, e.g. a
  double play puts out the batter and a runner. Today the grid accepts any cell in any order, so it is easy to fill
  a batter's turn in the wrong inning and lose the batting sequence (happened to Kevin in inning 3).
- Pitching stats (IP, R, ER, K, BB per pitcher) — deferred by Kevin on 2026-10-23.
- Opponent stats, defensive stats, spray chart, CSV export — not requested.
