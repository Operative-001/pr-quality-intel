import test from 'node:test';
import assert from 'node:assert/strict';

import { extractIntent, analyzeDrift, generateDriftReport } from '../src/drift.js';

test('extractIntent extracts summary from first line', () => {
  const desc = 'Add user authentication\n\nThis PR adds JWT tokens.';
  const intent = extractIntent(desc);
  assert.equal(intent.summary, 'Add user authentication');
});

test('extractIntent extracts file patterns', () => {
  const desc = 'Changes to `src/auth.js` and `src/middleware.js`.';
  const intent = extractIntent(desc);
  assert.deepEqual(intent.files_expected, ['src/auth.js', 'src/middleware.js']);
});

test('extractIntent handles empty description', () => {
  const intent = extractIntent('');
  assert.equal(intent.summary, '');
  assert.deepEqual(intent.files_expected, []);
});

test('analyzeDrift returns low drift for matching commits', () => {
  const intent = {
    summary: 'Add auth',
    files_expected: ['src/auth.js'],
    scope_keywords: ['auth', 'authentication']
  };
  const commits = [
    { message: 'Add auth module', files_changed: ['src/auth.js'] }
  ];
  const result = analyzeDrift(intent, commits);
  assert.equal(result.drift_level, 'low');
});

test('analyzeDrift detects unexpected files', () => {
  const intent = {
    summary: 'Add auth',
    files_expected: ['src/auth.js'],
    scope_keywords: ['auth']
  };
  const commits = [
    { message: 'Add auth', files_changed: ['src/auth.js'] },
    { message: 'Fix readme', files_changed: ['README.md', 'docs/api.md'] }
  ];
  const result = analyzeDrift(intent, commits);
  assert.ok(result.files_unexpected.includes('README.md'));
});

test('generateDriftReport produces markdown', () => {
  const analysis = {
    drift_score: 0.15,
    drift_level: 'low',
    files_changed: ['src/auth.js'],
    files_unexpected: []
  };
  const report = generateDriftReport(analysis);
  assert.ok(report.includes('PR Drift Score'));
  assert.ok(report.includes('✅'));
});
