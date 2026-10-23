# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-10-23 12:27 UTC-4 by Claude (sdd:implement)

## Now (one line)
Spec 002 — T1, T3 done; T2 and T5+T7 in review; then T4, T6, T8.

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | implement | T2 ‖ T5 ‖ T7 (review) | T4, then T6 | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Spec 001 demo was partial: Kevin checked the capture sheet live on 2026-10-23 and accepted ("está bien, luego lo
  pulimos"). Not reported as tested: offline save, two devices offline (specs/001-game-stats/demo.md steps 33–37),
  the Esc/back guard (step 18) and the console rollback check (step 19). Run them if a sync problem shows up.

## Recently done (keep last 10)
- 2026-10-23 · 002 · T3 done — cs + runner-out-only players in players/playerGames, 5 tests, reviewer APPROVE
- 2026-10-23 · 002 · T1 done — outs, runner outs, cell lines, minInnings with ro; 13 tests; reviewer APPROVE (12a46bc).
- 2026-10-23 · 001 · Spec done — G3 accepted by Kevin after a partial demo; 39/39 RFs implemented, 43 tests green, live on Pages (d1e9f7f).
- 2026-10-23 · — · SDD docs moved from the private personal-docs repo into this repo (STATUS.md, docs/, specs/); CLAUDE.local.md became the committed CLAUDE.md.
- 2026-10-23 · 001 · T15 — validator: 39/39 RFs, 0 missing; README stats section; stats dialog overflow fix; demo checklist.
- 2026-10-23 · 001 · T9 done — save + close guard; review BLOCK (Chromium forced close lost unsaved edits) fixed.
- 2026-10-23 · 001 · T14 done — games view; review BLOCK (delete lost to a later-clock save) fixed.
- 2026-10-23 · 001 · T8 done — substitutes + empty-row removal via row menu.
- 2026-10-23 · 001 · T7 / T13 done — PA picker; player detail.
- 2026-10-23 · 001 · T6 / T12 done — capture scoreboard + red headers; players table.
- 2026-10-23 · 001 · T4 / T10 done — stats sync via merge transaction (review BLOCK: blind setDoc lost offline records); OPS integer rounding (review BLOCK).
- 2026-10-23 · 001 · T1–T3, T5, T11 done — skeleton, sheet logic, merge, capture shell, games logic.

## Backlog (ideas not yet specified)
- **Spec 002 candidate — inning-by-inning capture (Kevin, 2026-10-23):** fill the sheet one inning at a time
  following the batting order (the next batter comes up by himself, the inning starts with whoever is due), with
  an outs counter per inning (inning closes at 3 outs). Outs must be chargeable to the batter AND to runners, e.g. a
  double play puts out the batter and a runner. Today the grid accepts any cell in any order, so it is easy to fill
  a batter's turn in the wrong inning and lose the batting sequence (happened to Kevin in inning 3).
- Pitching stats (IP, R, ER, K, BB per pitcher) — deferred by Kevin on 2026-10-23.
- Opponent stats, defensive stats, spray chart, CSV export — not requested.
