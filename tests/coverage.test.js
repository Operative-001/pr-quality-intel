import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

import { calculateCoverageDelta, formatCoverageDeltaReport } from '../src/coverage.js';

const CWD = '/home/reverser/.openclaw/workspace-swarm/projects/pr-quality-intel';

test('calculateCoverageDelta detects regression', () => {
  const r = calculateCoverageDelta(82, 79.5);
  assert.equal(r.level, 'critical_regression');
  assert.equal(r.delta, -2.5);
});

test('formatCoverageDeltaReport renders actionable text', () => {
  const text = formatCoverageDeltaReport({ base: 80, head: 78, delta: -2, level: 'critical_regression' });
  assert.match(text, /Coverage delta/);
  assert.match(text, /Action:/);
});

test('coverage-delta CLI prints report', () => {
  const out = execSync('node src/cli.js coverage-delta 81 83', { cwd: CWD, encoding: 'utf8' });
  assert.match(out, /Coverage delta/);
  assert.match(out, /\+2/);
});
