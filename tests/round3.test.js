import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canAutoMerge,
  shouldRequestScopeClarification,
  prioritizePRs,
  suggestBetterDescription,
  writeDescriptionFromCommits,
  isTrivialChange,
  parsePrUrl,
  trendGraph
} from '../src/round3.js';

test('auto-merge green signals eligible', () => {
  const r = canAutoMerge({ ci_status: 'success', mergeable: true, approvals: 1, drift_score: 0.1, draft: false, files_changed: ['src/a.js'] });
  assert.equal(r.eligible, true);
});

test('scope clarification comment generated on high drift', () => {
  const c = shouldRequestScopeClarification({ drift_score: 0.7 }, { drift_threshold: 0.4 });
  assert.equal(c.needed, true);
  assert.match(c.comment, /Scope clarification/);
});

test('prioritize ranks blocked first', () => {
  const now = Date.now();
  const ranked = prioritizePRs([
    { number: 1, title: 'normal', created_at: new Date(now - 2e8).toISOString(), updated_at: new Date(now - 1e8).toISOString(), mergeable: true, drift_score: 0.1 },
    { number: 2, title: 'blocked', created_at: new Date(now - 2e8).toISOString(), updated_at: new Date(now - 1e8).toISOString(), mergeable: false, drift_score: 0.1 }
  ]);
  assert.equal(ranked[0].number, 2);
});

test('description suggestion and commit-to-description work', () => {
  const d1 = suggestBetterDescription({ title: 'Improve auth', files_changed: ['src/auth.js'] });
  const d2 = writeDescriptionFromCommits([{ message: 'add auth flow' }], 'Auth update');
  assert.match(d1, /Summary/);
  assert.match(d2, /Changes from commits/);
});

test('trivial change detector supports zero-wait merge path', () => {
  const t = isTrivialChange({ files_changed: ['README.md'], additions: 5, deletions: 1 });
  assert.equal(t, true);
});

test('parse PR URL and trend graph', () => {
  const p = parsePrUrl('https://github.com/acme/repo/pull/42');
  assert.equal(p.repo, 'repo');
  const g = trendGraph([{ merged_at: '2026-02-01T00:00:00Z' }, { merged_at: '2026-02-02T00:00:00Z' }]);
  assert.match(g, /W/);
});

test('auto-merge trivial fastpath can pass with zero approvals', () => {
  const r = canAutoMerge({
    ci_status: 'success',
    mergeable: true,
    approvals: 0,
    drift_score: 0.05,
    draft: false,
    files_changed: ['README.md'],
    additions: 2,
    deletions: 1
  });
  assert.equal(r.eligible, true);
  assert.equal(r.mode, 'zero_wait_trivial');
});

test('prioritize includes urgency score metadata', () => {
  const now = Date.now();
  const ranked = prioritizePRs([
    { number: 10, title: 'A', created_at: new Date(now - 10 * 86400000).toISOString(), updated_at: new Date(now - 6 * 86400000).toISOString(), mergeable: true, drift_score: 0.4 }
  ]);
  assert.ok(ranked[0].urgency_score >= 0);
  assert.ok(ranked[0].urgency_reason);
});
