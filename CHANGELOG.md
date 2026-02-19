# Changelog

## 0.3.0 - 2026-02-19

- Added safe auto-merge evaluator with safeguards (`pqi auto-merge`)
- Added scope-clarification bot comment trigger on high drift (`pqi clarify`)
- Added urgency-based review prioritization (`pqi prioritize`)
- Added description improvement helpers (`pqi improve-desc`, `pqi desc-from-commits`)
- Added zero-wait trivial-change detection for merge fast-path
- Added PR URL local check command (`pqi check <pr-url>`)
- Added merged PR trend graph command (`pqi trends`)

## 0.2.0 - 2026-02-19

- Added coverage delta inline signal (`pqi coverage-delta <base> <head>`)
- Added pre-submit drift warning command (`pqi precheck`) with actionable threshold output
- Added self-healing reviewer ping flow (`pqi ping`) with configurable pre-stale window
- Added AI summary command (`pqi summary`) grouping PRs by urgency (stale/high-drift/blocked)
- Added commit-level drift highlighting (`commit_highlights`) to drift analysis/report
- Added Round 2 tests covering all new features

## 0.1.0 - 2026-02-19

- Initial release with:
  - Drift detection
  - Staleness analysis
  - Merge readiness scoring
  - CLI demo and JSON analysis mode
