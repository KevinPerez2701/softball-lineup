# STATUS — Diamante 10 (softball-lineup)

Single source of truth for what is in flight and what is left. Update it in the same commit as the
work it describes. Dates come from `date`, never from memory.

Last updated: 2026-11-05 12:25 UTC-4 by Claude

## Now (one line)
Idle — spec 003 done and pushed (G3 by Kevin 2026-11-05). Known gap: impeccable critique re-run not completed (Kevin closed before it finished).

## Active specs
| Spec | Phase | Current task | Next task | Blocked by |
|---|---|---|---|---|
| 001-game-stats | done | — | — | — |
| 002-inning-capture | done | — | — | — |
| 003-saved-games | done | — | — | — |

Phases: constitution · spec · clarify · plan · tasks · implement · validate · done

## Open questions (block work until answered)
- (none)

## Known gaps (not blocking)
- Spec 003: the impeccable critique re-run (Done criteria: heuristics 1, 4, 5, 6 ≥ 3) was stopped when Kevin closed the spec; run `/impeccable critique` later to confirm. Storage-failure paths (RF-7, RF-39) and 375 px were not exercised in the browser.

## Recently done (keep last 10)
- 2026-11-05 · 003 · T16 done — sw.js v6 + network-first fetch with cache no-cache (fixes new page + stale stats.js after a deploy); browser demo 15/16 ✔ at 360/800/1440, the ✘ (RF-38 empty text after deleting the last game) fixed; detector: no new findings; 108/108 green. Spec closed by Kevin (G3)
- 2026-11-05 · 003 · T15 done (orchestrator, measured in the browser at 360 px with SF+4F+DH, 12 cards): every field-card text ≥ 10 px via max(10px, …cqw), padding .4cqw, BD 83.6% and C 94% → no overlaps, "Kevin P."/"Keven P." uncut. Found: the SW network-first fetch goes through the HTTP cache, so a deploy can pair a new index.html with an old stats.js (Stats.unsaved missing) → fix in T16
- 2026-11-05 · 003 · T13+T14 done (one batch) — picker "Más detalles" + outlined default chips; team names on the final scoreboard; import confirm; reviewer APPROVE (check long names at 1100 px and print in T16)
- 2026-11-05 · 003 · T11+T12 done (one batch, opus implementer) — header with game name + ●, Guardar as key, Compartir/Más reuse the phone sheets, unified labels; reviewer APPROVE; orchestrator: header redraw on capture rollback, "Instalar" label. Browser layout check in T16
- 2026-11-05 · 003 · T10 done — Recuperar lo último offer + locked RF-10 question; review BLOCK (focus landed on Descartar: a stray space would drop the stored lineup) fixed by the orchestrator with the reviewer's one-line fix (focus on Recuperar) + offer refresh when saved arrives while fresh
- 2026-11-05 · 003 · T9 done — app starts empty (fresh/stored), nothing written until the first change, remote current while fresh only updates stored; reviewer APPROVE; orchestrator: backup export uses the stored lineup while fresh
- 2026-11-05 · 003 · T8 done — stats save also updates the open game (K_STATS → K_CUR → K_SAVED, full rollback on failure), "Guardar estadísticas", title "<team> vs <opp> · dd/mm", focus on Cerrar, legend; reviewer APPROVE (rare double-failure pending-put note accepted, same as HEAD)
- 2026-11-05 · 003 · T7 done — Abrir juego list (time, result, Estadísticas/Abierto pills, empty text), open + Nuevo guards, delete of the open game, game wording; reviewer APPROVE; orchestrator: failed delete write now toasts instead of claiming success
- 2026-11-05 · 003 · T6 done — saveGame (replace/add, 200 cap confirm, write failure), Guardar como nuevo, cross-device conflict prompt, mergeFirst without the 60 cut; reviewer APPROVE; orchestrator: saved copy carries its own link, list re-read at commit, plural "se borran"
- 2026-11-05 · 003 · T5 done — normalizers parametrized (7 callers), normalizeState/linkedGame/hasUnsaved, askChoice with a locked mode (reopens if a second Esc closes it); reviewer APPROVE; 108/108 green. Browser boot check deferred to T16
- 2026-10-23 · 002 · T8 desktop demo in prod: steps 1–21 ✔. Found and fixed (quick fix): first load after a deploy paired the new index.html with the cached old stats.js (sheet crashed, "Stats.cellLines is not a function"); sw.js now fetches stats.js network-first like the page

## Backlog (ideas not yet specified)
- (none — closed by Kevin on 2026-10-23)
