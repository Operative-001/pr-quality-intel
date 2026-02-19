import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { analyzeDrift, extractIntent } from '../src/drift.js';
import { findPreStalePRs, buildReviewerPingPayload } from '../src/staleness.js';
import { generateAISummary } from '../src/summary.js';

const CWD = '/home/reverser/.openclaw/workspace-swarm/projects/pr-quality-intel';

test('commit-level drift highlighting returns sorted contributors', () => {
  const intent = extractIntent('Add auth\nChanges to `src/auth.js`');
  const commits = [
    { message: 'auth core', files_changed: ['src/auth.js'] },
    { message: 'massive unrelated docs', files_changed: ['README.md', 'docs/guide.md'] }
  ];
  const out = analyzeDrift(intent, commits);
  assert.ok(out.commit_highlights.length >= 2);
  assert.ok(out.commit_highlights[0].drift_contribution >= out.commit_highlights[1].drift_contribution);
});

test('pre-submit drift warning command exits non-zero and prints actionable warning', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pqi-'));
  const p = path.join(dir, 'pr.json');
  fs.writeFileSync(p, JSON.stringify({
    body: 'Auth change only. Changes to `src/auth.js`.',
    commits: [{ message: 'add auth' , files_changed: ['src/auth.js', 'README.md', 'ops/runbook.md']}]
  }), 'utf8');

  let failed = false;
  try {
    execSync(`node src/cli.js precheck ${p} --threshold 0.2`, { cwd: CWD, stdio: 'pipe' });
  } catch (e) {
    failed = true;
    const stdout = String(e.stdout || '');
    assert.match(stdout, /Pre-submit warning/);
    assert.match(stdout, /Action:/);
  }
  assert.equal(failed, true);
});

test('self-healing ping payload includes PR links for pre-stale PRs', () => {
  const now = Date.now();
  const prs = [
    { number: 1, title: 'Soon stale', html_url: 'https://example/pr/1', created_at: new Date(now-8*86400000).toISOString(), updated_at: new Date(now-3*86400000).toISOString() },
    { number: 2, title: 'Fresh', html_url: 'https://example/pr/2', created_at: new Date(now-2*86400000).toISOString(), updated_at: new Date(now-1*86400000).toISOString() }
  ];
  const pre = findPreStalePRs(prs, { stale_days: 5, warning_days_before_stale: 3 });
  assert.equal(pre.length, 1);
  const payload = buildReviewerPingPayload(pre, { stale_days: 5, warning_days_before_stale: 3 });
  assert.match(payload.text, /https:\/\/example\/pr\/1/);
});

test('AI summary groups by urgency buckets', () => {
  const now = Date.now();
  const prs = [
    { number: 11, title: 'Blocked PR', created_at: new Date(now-2*86400000).toISOString(), updated_at: new Date(now-1*86400000).toISOString(), mergeable: false, drift_score: 0.1 },
    { number: 12, title: 'Drift PR', created_at: new Date(now-2*86400000).toISOString(), updated_at: new Date(now-1*86400000).toISOString(), mergeable: true, drift_score: 0.8 },
    { number: 13, title: 'Stale PR', created_at: new Date(now-10*86400000).toISOString(), updated_at: new Date(now-6*86400000).toISOString(), mergeable: true, drift_score: 0.1 }
  ];
  const s = generateAISummary(prs, { stale_days: 5, drift_threshold: 0.4 });
  assert.equal(s.totals.blocked, 1);
  assert.equal(s.totals.high_drift, 1);
  assert.equal(s.totals.stale, 1);
  assert.match(s.summary, /PRs need attention/);
});
