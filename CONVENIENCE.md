# Convenience Audit: PR Quality Intelligence

## Archetype: Engineering Manager

### Current Experience
1. Open GitHub → check each PR manually
2. Ask in Slack: "What's blocking X's PR?"
3. No visibility into scope creep until review complaints

### 10x Iteration
**Prompt:** "Someone 10x better at convenience designs this. What changes?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Daily Slack digest with stale PRs | 5 | 5 | 25 | ✓ Round 1 |
| One-click install (GitHub App) | 5 | 5 | 25 | ✓ Round 1 |
| Team-level merge readiness % | 4 | 4 | 16 | ✓ Round 2 |
| Trend graphs (PRs merged/week) | 4 | 3 | 12 | ✓ Round 3 |
| Alert when PR stale >X days | 5 | 4 | 20 | ✓ Round 1 |
| Highlight top blockers (who's waiting on who) | 4 | 4 | 16 | ✓ Round 2 |

### 100x Iteration
**Prompt:** "World-class team, 1 year, unlimited resources. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| AI summary: "3 PRs need attention, here's why" | 4 | 5 | 20 | ✓ Round 2 |
| Predict which PRs will stall (ML model) | 2 | 4 | 8 | Later |
| Auto-assign reviewers based on code ownership | 3 | 4 | 12 | ✓ Round 4 |
| Integration with Linear/Jira for PR→ticket linking | 3 | 3 | 9 | Later |
| Mobile app for quick PR triage | 2 | 2 | 4 | No - low demand |
| Video walkthrough of blocked PRs | 2 | 2 | 4 | No - overkill |

### 1000x Iteration
**Prompt:** "20 years from now, magic wand, at just a glance. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Zero config — learns team patterns automatically | 3 | 5 | 15 | ✓ Round 4 |
| Voice: "Hey PQ, what's blocking the release?" | 1 | 2 | 2 | No - low ROI |
| Auto-merge when all signals green (with safeguards) | 4 | 5 | 20 | ✓ Round 3 |
| Invisible: problems only surface when they matter | 3 | 4 | 12 | ✓ Round 3 |
| Self-healing: auto-pings reviewers before stale | 5 | 4 | 20 | ✓ Round 2 |

---

## Archetype: Tech Lead

### Current Experience
1. Get review request notification
2. Open PR, start reading
3. Realize scope has changed, ask author "what happened?"
4. Re-review after scope discussion

### 10x Iteration
**Prompt:** "Someone 10x better at convenience designs this. What changes?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Drift score shown at top of PR | 5 | 5 | 25 | ✓ Round 1 |
| Summary: "Scope changed: added X, removed Y" | 5 | 5 | 25 | ✓ Round 1 |
| "Original intent" extracted from PR description | 4 | 4 | 16 | ✓ Round 1 |
| Highlight which commits caused drift | 4 | 4 | 16 | ✓ Round 2 |
| Coverage delta inline | 4 | 4 | 16 | ✓ Round 2 |
| CLI: `pqi check <pr-url>` | 5 | 3 | 15 | ✓ Round 3 |

### 100x Iteration
**Prompt:** "World-class team, 1 year, unlimited resources. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| AI-suggested review comments based on drift | 3 | 4 | 12 | ✓ Round 4 |
| Auto-request scope clarification from author | 4 | 4 | 16 | ✓ Round 3 |
| IDE integration (VS Code shows drift inline) | 3 | 3 | 9 | Later |
| "Review this first" prioritization | 4 | 4 | 16 | ✓ Round 3 |
| Compare this PR's quality to team average | 4 | 3 | 12 | ✓ Round 4 |

### 1000x Iteration
**Prompt:** "20 years from now, magic wand. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Pre-submit warning: "This will increase drift to X%" | 5 | 5 | 25 | ✓ Round 2 |
| AI co-pilot suggests splitting PR | 3 | 4 | 12 | ✓ Round 4 |
| Zero-friction — drift info appears without clicking anything | 4 | 4 | 16 | ✓ Round 1 |
| Self-splitting: auto-suggest separate PRs | 2 | 4 | 8 | Later |

---

## Archetype: Developer (PR Author)

### Current Experience
1. Submit PR
2. Wait for review
3. Get feedback: "this is too big, please split"
4. Frustration, rework

### 10x Iteration
**Prompt:** "Someone 10x better at convenience designs this. What changes?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Pre-submit drift check (git hook or GH Action) | 5 | 5 | 25 | ✓ Round 2 |
| Clear "merge readiness" checklist | 5 | 5 | 25 | ✓ Round 1 |
| "Your PR is stale" notification before reviewer complains | 5 | 4 | 20 | ✓ Round 1 |
| Actionable feedback: "Add tests for X" not just "low coverage" | 4 | 4 | 16 | ✓ Round 2 |
| Progress indicator: "2 of 3 checks passing" | 5 | 3 | 15 | ✓ Round 1 |

### 100x Iteration
**Prompt:** "World-class team, 1 year. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| AI suggests better PR description | 4 | 4 | 16 | ✓ Round 3 |
| Auto-split large PRs into logical chunks | 2 | 5 | 10 | Later |
| "Fast-track" badge for high-quality PRs | 4 | 3 | 12 | ✓ Round 3 |
| Compare your PR quality to your past PRs | 3 | 2 | 6 | Later |

### 1000x Iteration
**Prompt:** "Magic wand. What exists?"

| Suggestion | Feas | Impact | Score | Decision |
|------------|------|--------|-------|----------|
| Zero-wait merge for trivial changes (typos, docs) | 4 | 4 | 16 | ✓ Round 3 |
| AI writes PR description from commits | 4 | 4 | 16 | ✓ Round 3 |
| Predictive: "This PR will be approved in ~2 hours" | 2 | 3 | 6 | Later |

---

## Consolidated Implementation Queue

| Rank | Suggestion | Score | Source | Round |
|------|------------|-------|--------|-------|
| 1 | One-click GitHub App install | 25 | EM-10x | 1 |
| 2 | Daily Slack digest with stale PRs | 25 | EM-10x | 1 |
| 3 | Drift score at top of PR | 25 | TL-10x | 1 |
| 4 | "Scope changed" summary | 25 | TL-10x | 1 |
| 5 | Clear merge readiness checklist | 25 | Dev-10x | 1 |
| 6 | Pre-submit drift check | 25 | TL-1000x | 2 |
| 7 | Alert when PR stale >X days | 20 | EM-10x | 1 |
| 8 | "Your PR is stale" notification | 20 | Dev-10x | 1 |
| 9 | AI summary for managers | 20 | EM-100x | 2 |
| 10 | Auto-merge when green | 20 | EM-1000x | 3 |
| 11 | Self-healing auto-pings | 20 | EM-1000x | 2 |
| 12 | Highlight drift-causing commits | 16 | TL-10x | 2 |
| 13 | Coverage delta inline | 16 | TL-10x | 2 |
| 14 | Team merge readiness % | 16 | EM-10x | 2 |
| 15 | Top blockers view | 16 | EM-10x | 2 |
| 16 | Original intent extraction | 16 | TL-10x | 1 |
| 17 | Zero-friction drift display | 16 | TL-1000x | 1 |
| 18 | Actionable feedback | 16 | Dev-10x | 2 |
| ... | ... | ... | ... | ... |

## Round 1 MVP Features (Score ≥20)

1. ✅ One-click GitHub App install
2. ✅ Drift score displayed at top of PR
3. ✅ "Scope changed" summary with before/after
4. ✅ Merge readiness checklist
5. ✅ Daily Slack digest (stale PRs, drift alerts)
6. ✅ Stale PR notifications
7. ✅ Original intent extraction from PR description

## Not Implementing (with reasons)

| Suggestion | Score | Reason |
|------------|-------|--------|
| Voice queries | 2 | Low demand, high effort |
| Mobile app | 4 | Desktop is primary for code review |
| Video walkthroughs | 4 | Overkill for the problem |
| Predictive stall ML | 8 | Need data first, revisit after v2 |
| Auto-split PRs | 10 | Too risky, needs human judgment |
