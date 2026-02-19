import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCoverageDelta, formatCoverageDeltaReport } from '../src/coverage.js';

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

test('calculateCoverageDelta handles positive delta', () => {
  const r = calculateCoverageDelta(81, 83);
  assert.equal(r.level, 'ok');
  assert.equal(r.delta, 2);
});
