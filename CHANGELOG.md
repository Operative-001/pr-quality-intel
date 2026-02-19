# Changelog

## 0.2.0 - 2026-02-19

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
