# User Profiles: PR Quality Intelligence

## Primary Archetypes

### 1. Engineering Manager
- **Role:** Oversees team delivery, responsible for review quality and velocity
- **Primary Environment:** Dashboard, Slack, GitHub notifications
- **Time Budget:** 30 sec glance at daily summary, 5 min weekly deep-dive
- **Values:** Team health metrics, bottleneck visibility, trends
- **Current Friction:** Manually checking PR ages, no visibility into drift/scope creep
- **Our Solution:** Daily digest with stale PRs, drift alerts, merge readiness overview

### 2. Tech Lead / Senior Developer
- **Role:** Reviews PRs, enforces quality standards, mentors juniors
- **Primary Environment:** GitHub PR page, CLI, IDE
- **Time Budget:** 2 min per PR to assess, 30 min daily on reviews
- **Values:** Fast context, clear signals, avoid wasted review cycles
- **Current Friction:** Opens PR, realizes scope changed, reviews outdated code
- **Our Solution:** Inline PR comment showing drift score, changed scope summary

### 3. Developer (PR Author)
- **Role:** Submits PRs, wants fast merge, needs clear feedback
- **Primary Environment:** GitHub PR page, CLI
- **Time Budget:** 1 min to check PR status, wants instant feedback
- **Values:** Clear "what's blocking?", actionable next steps
- **Current Friction:** Unclear why PR is stale, no merge readiness signal
- **Our Solution:** PR status badge, "ready to merge" checklist, drift warning before it grows

## Environment Matrix

| Archetype | GitHub PR | CLI | Web Dashboard | Slack | API |
|-----------|-----------|-----|---------------|-------|-----|
| Eng Manager | ★ | ☆ | ★★★ | ★★★ | ☆ |
| Tech Lead | ★★★ | ★★ | ★ | ★★ | ★ |
| Developer | ★★★ | ★★ | ☆ | ★ | ☆ |

**Legend:** ★★★ = Primary, ★★ = Secondary, ★ = Occasional, ☆ = Never

**Build Order:**
1. Round 1: GitHub App (PR comments, checks) — serves all archetypes
2. Round 2: Slack integration — serves Eng Manager
3. Round 3: Web dashboard — serves Eng Manager
4. Round 4: CLI — serves Tech Lead, Developer

## Convenience Layers

### Layer 0: DISCOVER
- SEO: "PR scope creep", "stale PR detection", "code review automation"
- Word of mouth: "It tells you when a PR has gone off the rails"
- Influencers: Developer productivity blogs, GitHub marketplace

### Layer 1: TRY (< 5 min)
```
# One-click GitHub App install
https://github.com/apps/pr-quality-intel → Install → Select repos

# First PR gets a comment within 60 seconds
```
No CLI, no config, just install and see results.

### Layer 2: ADOPT (< 1 hour)
```yaml
# .github/pr-quality.yml (optional customization)
drift_threshold: 0.3  # alert if >30% scope change
stale_days: 5
coverage_required: 80
```

### Layer 3: EXPAND
- Connect Slack for daily digests
- Add coverage integration (Codecov, Coveralls)
- Enable merge queue integration
- Team analytics dashboard

### Layer 4: ADVOCATE
- Share team's "PR health score" badge in README
- Export weekly reports for leadership
- Compare against industry benchmarks

## Build Priority

| Environment | Priority | Reason | Round |
|-------------|----------|--------|-------|
| GitHub App (comments/checks) | P0 | Serves all users where they work | 1 |
| Slack integration | P1 | Daily digests for managers | 2 |
| Web dashboard | P2 | Deep analytics for managers | 3 |
| CLI | P3 | Power users, CI integration | 3 |
| API | P3 | Integrations, automation | 3 |
