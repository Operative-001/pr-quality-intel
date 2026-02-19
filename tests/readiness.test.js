import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateReadiness, generateReadinessReport } from '../src/readiness.js';

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
