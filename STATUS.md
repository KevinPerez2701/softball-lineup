# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-10-23 10:47 UTC-4 by Claude

## Now (one line)
Spec 001 — validate: 39/39 RFs implemented (17 node-tested, 22 UI), 43 tests green; T15 waits for Kevin's manual demo (specs/001-game-stats/demo.md). Pushed to origin/main (f4e47b4) on Kevin's OK; local demo attempt hit ERR_CONNECTION_REFUSED on :8001 (no server running there).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | validate | T15 (demo) | G3 | Kevin's demo |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- [ ] Manual "Done when" parts of T4–T9 and T12–T14 (browser, phone 360 px, two-device offline sync) were deferred to the T15 demo under the verification budget: code is reviewed + syntax-checked, NOT yet seen running. Needs Kevin (login). — 2026-10-23, spec 001
- (none)

## Recently done (keep last 10)
- 2026-10-23 · — · SDD docs moved from the private personal-docs repo into this repo (root: STATUS.md, docs/, specs/); CLAUDE.local.md became the committed CLAUDE.md (Kevin: nothing sensitive, repo is public).
- 2026-10-23 · 001 · T15 partial — validator: 39/39 RFs implemented, 0 missing; README stats section (5951e90); stats dialog overflow fix (f4e47b4); demo checklist written
- 2026-10-23 · 001 · T9 done — save + close guard; review BLOCK (Chromium forced close lost unsaved edits) fixed with a close listener that reopens and asks; rollback keeps dirty flag on failure. Part A complete.
- 2026-10-23 · 001 · T14 done — games view; review BLOCK (delete lost to a record saved by a device with a later clock) fixed: marker stamp ≥ record savedAt; Abrir uses live records
- 2026-10-23 · 001 · T8 done — substitutes + empty-row removal via row menu, reviewer APPROVE
- 2026-10-23 · 001 · T7 done — PA picker, reviewer APPROVE; 40px tap targets fix
- 2026-10-23 · 001 · T13 done — player detail, reviewer APPROVE; header padding fix
- 2026-10-23 · 001 · T12 done — stats screen + players table, reviewer APPROVE; orchestrator added roster-change refresh (737639e)
- 2026-10-23 · 001 · T6 done — capture date/score/innings/red headers, reviewer APPROVE; orchestrator: fit coerces text runs to numbers (+test), team label ellipsis (f093485)
- 2026-10-23 · 001 · T5 done — capture shell + open rules, reviewer APPROVE; orchestrator fixed copy-before-open and long-name ellipsis (6c4492c)
- 2026-10-23 · 001 · T11 done — Stats.games/playerGames, 7 tests, reviewer APPROVE
- 2026-10-23 · 001 · T4 done — stats sync + backup; review BLOCK (blind setDoc lost offline records) fixed with a merge transaction + online retry (merged, cd763c1). Two-browser offline check pending for T15.
- 2026-10-23 · 001 · T10 done — players/rates/fmt/sort; review BLOCK on OPS half-up (float sum) fixed with integer math (merged 6909b27)
- 2026-10-23 · 001 · T2 done — sheet logic (CODES, refreshRows, fit, runCheck…), reviewer APPROVE
- 2026-10-23 · 001 · T3 done — Stats.merge/live, 10 tests, reviewer APPROVE (merged 61b8319 + 59488af)
- 2026-10-23 · 001 · T1 done — stats.js skeleton, smoke test, sw.js v4 (commit 72e3708, not pushed).
- 2026-10-23 · — · Constitution 4 test command corrected to `node --test 'tests/*.test.js'` (`node --test tests/` fails on Node 22 with MODULE_NOT_FOUND).
- 2026-10-23 · — · SDD initialized (constitution, `.gitattributes`).

## Backlog (ideas not yet specified)
- Pitching stats (IP, R, ER, K, BB per pitcher) — deferred by Kevin on 2026-10-23.
- Opponent stats, defensive stats, spray chart, CSV export — not requested.
