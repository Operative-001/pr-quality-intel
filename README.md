# PR Quality Intel

[![CI](https://github.com/Operative-001/pr-quality-intel/actions/workflows/test.yml/badge.svg)](https://github.com/Operative-001/pr-quality-intel/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](LICENSE)

> PR-level quality intelligence: drift detection, staleness alerts, merge readiness scoring.

## Problem

- PRs grow out of scope without anyone noticing
- Stale PRs accumulate and block releases
- "Is this ready to merge?" requires checking 5 different things
- Reviewers waste time on unfocused PRs

## Solution

**PR Quality Intel** provides:

1. **Drift Detection** — Measures how much a PR has changed from its original intent
2. **Staleness Alerts** — Notifies when PRs go stale before it becomes a problem
3. **Merge Readiness Score** — Composite checklist: description, CI, conflicts, size, approvals

## Quick Start

```bash
# Install
npm install -g pr-quality-intel

# Run demo
pqi demo

# Analyze a PR from JSON
pqi analyze pr-data.json

# Output as JSON
pqi analyze pr-data.json --json
```

## Features

### 🔍 Drift Detection

Extracts intent from PR description, then measures how much commits deviate:

```
## ✅ PR Drift Score: 15%

This PR stays on scope. Nice work!
```

### ⏰ Staleness Tracking

```
## 🟡 PR #42 is going stale (7 days inactive)
Needs attention.
```

### 📋 Merge Readiness

```
## 🟢 Merge Readiness: 85%

| Check | Status | Points |
|-------|--------|--------|
| Has description | ✅ | 10/10 |
| Not a draft | ✅ | 10/10 |
| CI passing | ✅ | 25/25 |
| No conflicts | ✅ | 20/20 |
| Reasonable size | ✅ | 10/10 |
| Has approvals | ✅ | 10/10 |
```

## Configuration

Create `.github/pr-quality.yml`:

```yaml
drift_threshold: 0.3      # Alert if >30% scope change
stale_days: 5             # Days until "stale"
very_stale_days: 14       # Days until "very stale"
coverage_required: 80     # Minimum coverage %
```

## API

### Drift Analysis

```javascript
import { extractIntent, analyzeDrift } from 'pr-quality-intel/drift';

const intent = extractIntent(prDescription);
const drift = analyzeDrift(intent, commits);
// { drift_score: 0.15, drift_level: 'low', files_unexpected: [] }
```

### Readiness Score

```javascript
import { calculateReadiness } from 'pr-quality-intel/readiness';

const readiness = calculateReadiness(prData);
// { score: 85, level: 'ready', checks: [...] }
```

### Staleness

```javascript
import { calculateStaleness, filterStalePRs } from 'pr-quality-intel/staleness';

const staleness = calculateStaleness(pr);
// { inactive_days: 7, level: 'stale', is_stale: true }
```

## Roadmap

- [ ] Round 2: Pre-commit drift warning, Slack integration
- [ ] Round 3: GitHub App for automatic PR comments
- [ ] Round 4: Team analytics dashboard

## Commercial License

Free for personal and non-commercial use.

For commercial use, open an issue:
```
[COMMERCIAL LICENSE INQUIRY]
```

---

*Built with the Project Factory methodology*
