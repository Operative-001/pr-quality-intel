import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateStaleness, filterStalePRs, generateStalenessAlert } from '../src/staleness.js';

test('calculateStaleness returns fresh for recently updated PR', () => {
  const now = Date.now();
  const pr = {
    created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
  };

  const result = calculateStaleness(pr);
  assert.equal(result.level, 'fresh');
  assert.equal(result.is_stale, false);
});

test('calculateStaleness returns stale when inactive exceeds threshold', () => {
  const now = Date.now();
  const pr = {
    created_at: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString()
  };

  const result = calculateStaleness(pr, { stale_days: 5, very_stale_days: 14 });
  assert.equal(result.level, 'stale');
  assert.equal(result.is_stale, true);
});

test('filterStalePRs returns only stale PRs sorted by inactivity', () => {
  const now = Date.now();
  const prs = [
    {
      number: 1,
      title: 'Fresh PR',
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      number: 2,
      title: 'Stale PR',
      created_at: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      number: 3,
      title: 'Very stale PR',
      created_at: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const stale = filterStalePRs(prs, { stale_days: 5, very_stale_days: 14 });
  assert.equal(stale.length, 2);
  assert.equal(stale[0].number, 3);
  assert.equal(stale[1].number, 2);
});

test('generateStalenessAlert returns null for fresh PR and message for stale', () => {
  const stalePr = {
    number: 42,
    staleness: {
      level: 'stale',
      inactive_days: 7
    }
  };
  const freshPr = {
    number: 99,
    staleness: {
      level: 'fresh',
      inactive_days: 1
    }
  };

  assert.match(generateStalenessAlert(stalePr), /going stale/);
  assert.equal(generateStalenessAlert(freshPr), null);
});
