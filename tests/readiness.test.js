import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateReadiness,
  generateReadinessReport,
  calculateTeamReadiness,
  generateTeamDashboard
} from '../src/readiness.js';

test('calculateReadiness gives max score for perfect PR', () => {
  const pr = {
    body: 'This is a detailed description of the changes.',
    draft: false,
    requested_reviewers: [{ login: 'reviewer1' }],
    ci_status: 'success',
    mergeable: true,
    additions: 50,
    deletions: 10,
    approvals: 1
  };
  const result = calculateReadiness(pr);
  assert.equal(result.score, 100);
  assert.equal(result.level, 'ready');
});

test('calculateReadiness penalizes missing description', () => {
  const pr = {
    body: '',
    draft: false,
    requested_reviewers: [{ login: 'reviewer1' }],
    ci_status: 'success',
    mergeable: true,
    additions: 50,
    deletions: 10,
    approvals: 1
  };
  const result = calculateReadiness(pr);
  assert.ok(result.score < 100);
  assert.ok(result.checks.find(c => c.name === 'Has description' && !c.passed));
});

test('calculateReadiness flags large PRs', () => {
  const pr = {
    body: 'Description here with enough text.',
    draft: false,
    requested_reviewers: [],
    ci_status: 'success',
    mergeable: true,
    additions: 800,
    deletions: 200,
    approvals: 0
  };
  const result = calculateReadiness(pr);
  const sizeCheck = result.checks.find(c => c.name.includes('size'));
  assert.ok(sizeCheck && !sizeCheck.passed);
});

test('generateReadinessReport produces markdown table', () => {
  const readiness = {
    score: 75,
    max_score: 100,
    percentage: 75,
    level: 'almost',
    emoji: '🟡',
    checks: [
      { name: 'Has description', passed: true, points: 10 },
      { name: 'CI passing', passed: true, points: 25 }
    ],
    blocking: []
  };
  const report = generateReadinessReport(readiness);
  assert.ok(report.includes('Merge Readiness'));
  assert.ok(report.includes('75%'));
});

test('calculateTeamReadiness builds team-level dashboard stats', () => {
  const prs = [
    {
      number: 1,
      title: 'Ready PR',
      body: 'Detailed enough description for this pull request.',
      draft: false,
      requested_reviewers: [{ login: 'r1' }],
      ci_status: 'success',
      mergeable: true,
      additions: 10,
      deletions: 2,
      approvals: 1
    },
    {
      number: 2,
      title: 'Blocked PR',
      body: '',
      draft: true,
      requested_reviewers: [],
      ci_status: 'failure',
      mergeable: false,
      additions: 700,
      deletions: 10,
      approvals: 0
    }
  ];

  const result = calculateTeamReadiness(prs);
  assert.equal(result.total_prs, 2);
  assert.ok(result.team_readiness_percentage >= 0);
  assert.equal(result.counts.ready, 1);
  assert.ok(result.top_blockers.length > 0);
});

test('generateTeamDashboard renders merge readiness section', () => {
  const report = generateTeamDashboard({
    total_prs: 2,
    team_readiness_percentage: 65,
    merge_ready_percentage: 50,
    counts: { ready: 1, almost: 0, not_ready: 1 },
    top_blockers: [{ name: 'CI passing', count: 1 }],
    prs: [{ number: 1, title: 'A', readiness: 100, level: 'ready' }]
  });

  assert.match(report, /Team Merge Readiness Dashboard/);
  assert.match(report, /65%/);
});
