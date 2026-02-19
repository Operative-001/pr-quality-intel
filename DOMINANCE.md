# Dominance Analysis: PR Quality Intelligence

## Feature Spark
"PR Drift Guard" — detect when PRs diverge from original intent

## Feature → Workflow Mapping

```
FEATURE: Detect PR scope creep / drift from original intent
    ↓
WORKFLOW: Code review process
    ↓
OUTCOME: Higher quality merges, faster reviews, reduced rework
    ↓
OWNER: Engineering Manager / Tech Lead
    ↓
BUDGET: Developer productivity tools ($50-200/dev/month)
```

## Component Expansion

| Component | Can We Be Best? | Status | Notes |
|-----------|-----------------|--------|-------|
| PR drift detection | Yes | Build | Core feature, no dominant player |
| Stale PR alerts | Yes | Build | Simple, high value |
| Coverage delta | Yes | Build | Requires CI integration |
| Merge readiness score | Yes | Build | Composite metric |
| Review time tracking | Yes | Build | GitHub API provides data |
| Auto-comment suggestions | Yes | Build | LLM-powered, differentiated |
| Security scanning | **No** | Skip | Snyk/Dependabot dominate |
| Review assignment | Maybe | Skip | GitHub native is good enough |

**Blocked by:** Security scanning — dominated by existing players
**Solution:** Don't include security. Focus on quality/process, not security.

## Parent Project Candidates

| Scale | Candidate | Components | Dominance? |
|-------|-----------|------------|------------|
| Narrow | PR Drift Detector | 2 | Yes, but tiny market |
| **Medium** | **PR Quality Intelligence** | 6 | **Yes — all achievable** |
| Broad | Dev Productivity Platform | 15+ | No — too broad |

**Chosen: PR Quality Intelligence (Medium)**

Reason: All 6 components are achievable with current resources. No dominant player in this specific space. Clear budget exists.

## Dominance Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Market Clarity | 2 | "PR quality automation" |
| Pain Intensity | 2 | Reviews are universal bottleneck |
| Budget Exists | 2 | GitHub/GitLab spend already allocated |
| Champion Clarity | 2 | Engineering Manager |
| Completeness Advantage | 2 | One dashboard vs. 5 tools |
| Best-in-Class Feasible | 2 | All 6 components achievable |
| Time to Value | 2 | GitHub App → first score in <5 min |
| Switching Cost | 1 | Moderate (config, not data) |
| Expansion Path | 2 | Team analytics, AI suggestions, CI |
| Build Efficiency | 2 | GitHub API well-documented |

**Total: 19/20** ✓ PURSUE

## Module Structure

| Module | Source | Priority | Round |
|--------|--------|----------|-------|
| PR Drift Detector | Original spark | P0 | 1 |
| Stale PR Alerter | Component expansion | P0 | 1 |
| Coverage Delta Checker | Component expansion | P1 | 2 |
| Merge Readiness Score | Component expansion | P1 | 2 |
| Review Time Tracker | Component expansion | P2 | 3 |
| Auto-Comment Suggestions | Component expansion | P2 | 3 |

## Competitive Landscape

| Competitor | What They Do | Gap We Fill |
|------------|--------------|-------------|
| GitHub native | Basic PR checks | No drift detection, no quality score |
| Reviewable | Review UX | No automation, no scoring |
| Graphite | Stacking workflow | Different use case |
| CodeClimate | Quality metrics | Repo-level, not PR-level |

**Our angle:** PR-level quality intelligence with actionable automation.

## Next Steps

1. ✅ Dominance analysis complete (this doc)
2. → Proceed to VALIDATE phase
3. → Find 5+ community complaints about PR quality issues
4. → Competitive deep-dive on gaps
