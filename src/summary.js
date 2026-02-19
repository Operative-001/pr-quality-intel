import { calculateStaleness } from './staleness.js';

export function generateAISummary(prs, options = {}) {
  const staleDays = options.stale_days || 5;
  const driftThreshold = options.drift_threshold ?? 0.4;

  const bucket = {
    stale: [],
    high_drift: [],
    blocked: []
  };

  for (const pr of prs) {
    const staleness = calculateStaleness(pr, { stale_days: staleDays });
    if (staleness.is_stale) bucket.stale.push(pr);
    if ((pr.drift_score ?? 0) >= driftThreshold) bucket.high_drift.push(pr);
    if (pr.mergeable === false || pr.ci_status === 'failure' || pr.blocked === true) bucket.blocked.push(pr);
  }

  const uniqAttention = new Map();
  [...bucket.stale, ...bucket.high_drift, ...bucket.blocked].forEach(pr => uniqAttention.set(pr.number, pr));

  const lines = [];
  lines.push(`${uniqAttention.size} PRs need attention, here's why:`);
  lines.push(`- stale: ${bucket.stale.length}`);
  lines.push(`- high drift: ${bucket.high_drift.length}`);
  lines.push(`- blocked: ${bucket.blocked.length}`);

  const details = [];
  const pushDetail = (label, list) => {
    list.slice(0, 5).forEach(pr => details.push(`${label} #${pr.number} ${pr.title}`));
  };
  pushDetail('stale', bucket.stale);
  pushDetail('drift', bucket.high_drift);
  pushDetail('blocked', bucket.blocked);

  return {
    totals: {
      needs_attention: uniqAttention.size,
      stale: bucket.stale.length,
      high_drift: bucket.high_drift.length,
      blocked: bucket.blocked.length
    },
    summary: lines.join('\n'),
    details
  };
}
