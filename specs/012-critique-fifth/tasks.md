# Tasks — Spec 012 critique-fifth

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Worktrees `../softball-lineup-wt/012-Tn`; no git stash/checkout/reset/clean, no servers,
no repo-wide commands beyond `node --test 'tests/*.test.js' < /dev/null`.

Overlap map (lines of 2b34624): T1 `stats.js`, `tests/order.test.js`, `tests/games.test.js` · T2 `index.html` 27–374
(CSS only) · T3 `index.html` 1180–3892 (HTML + JS) · T4 `ver.html`, `view.js` · T5 `sw.js`, `STATUS.md`, `tasks.md`.

## Wave 1 — in parallel
- [x] T1. `Stats.fieldReason`, `Stats.updatedText` after `orderReason`; tests first. (RF-6, RF-7) Deps: —
      Done when: suite prints `# pass 178`, `# fail 0`.
- [ ] T2. Selected-state tokens in the three index.html theme blocks, `.btn-default` + hover (190–192), `.game-empty`
      order rule after 361, `.field-head .hint` in 373–374. (RF-1, RF-2, RF-3 CSS, RF-7 CSS) Deps: —
      Done when: suite green; `grep -c -- '--sel-' index.html` = 9 (3 tokens × 3 blocks) + the uses; traced: light gives
      fill #eef5b4 / border #5d6b00, both dark blocks transparent / --accent, hover per theme.

## Wave 2 — in parallel, after T1 is merged
- [ ] T3. `#fieldWhy` (1180), `#benchCard` (1331), `game-empty` toggle + `fieldReason` (2385–2388), comment 3184, note
      above the table (3891–3892). (RF-3, RF-7, RF-8) Deps: T1
      Done when: suite green; traced: the class is toggled on every renderAll, both reason strings, note before the
      table wrapper; the main inline script parses (`node --check` on an extracted copy).
- [ ] T4. ver.html: tokens + `.btn-default` copy, h1 header with text nodes, h1 reset, no uppercase, `render(rec, ms)` +
      footer; view.js comment. (RF-1, RF-4, RF-5, RF-6) Deps: T1
      Done when: suite green; the module script parses (`node --check` on an extracted .mjs); traced: one h1 only from
      `render`, footer last in `show([...])`, `notFound`/`failed` untouched.

## Wave 3 — orchestrator
- [ ] T5. Merge, `sw.js` v11, full suite, browser demo light/dark × 360/desktop per Test strategy (contrasts stated),
      `tasks.md` + `STATUS.md`, commit, push (pre-approved by Kevin), Pages built. Deps: T1–T4
      Done when: the deployed page serves v11 and STATUS.md records the deploy hash.
