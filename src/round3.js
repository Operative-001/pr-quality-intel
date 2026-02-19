import { calculateStaleness } from './staleness.js';

export function isTrivialChange(pr = {}) {
  const files = pr.files_changed || [];
  const additions = Number(pr.additions || 0);
  const deletions = Number(pr.deletions || 0);
  const total = additions + deletions;
  const nonCodeOnly = files.length > 0 && files.every(f => /\.(md|txt|rst|adoc|png|jpg|jpeg|gif|svg)$/i.test(f));
  return nonCodeOnly && total <= 30;
}

export function canAutoMerge(pr = {}, options = {}) {
  const safeguards = {
    require_ci: options.require_ci ?? true,
    min_approvals: options.min_approvals ?? 1,
    max_drift: options.max_drift ?? 0.2,
    allow_trivial_fastpath: options.allow_trivial_fastpath ?? true
  };

  const reasons = [];
  if (safeguards.require_ci && !(pr.ci_status === 'success' || pr.mergeable_state === 'clean')) reasons.push('ci_not_green');
  if (pr.mergeable === false) reasons.push('merge_conflict');
  if ((pr.approvals || 0) < safeguards.min_approvals) reasons.push('insufficient_approvals');
  if ((pr.drift_score ?? 0) > safeguards.max_drift) reasons.push('drift_too_high');
  if (pr.draft) reasons.push('draft_pr');

  const trivial = isTrivialChange(pr);
  const fastpath = safeguards.allow_trivial_fastpath && trivial && (pr.ci_status === 'success' || pr.mergeable_state === 'clean');

  const eligible = reasons.length === 0 || (fastpath && reasons.every(r => ['insufficient_approvals'].includes(r)));
  return {
    eligible,
    mode: fastpath ? 'zero_wait_trivial' : 'standard',
    trivial,
    reasons,
    safeguards
  };
}

export function shouldRequestScopeClarification(pr = {}, options = {}) {
  const driftThreshold = options.drift_threshold ?? 0.4;
  const drift = Number(pr.drift_score ?? 0);
  if (drift < driftThreshold) return { needed: false, comment: null };

  const comment = [
    '⚠️ Scope clarification requested:',
    `Current drift is ${Math.round(drift * 100)}% (threshold ${Math.round(driftThreshold * 100)}%).`,
    'Please clarify what changed vs original intent and whether this should be split into separate PRs.'
  ].join('\n');

  return { needed: true, comment };
}

export function prioritizePRs(prs = []) {
  const scored = prs.map(pr => {
    const stale = calculateStaleness(pr, { stale_days: 5, very_stale_days: 14 });
    const drift = Number(pr.drift_score ?? 0);
    let score = 0;
    if (pr.mergeable === false || pr.ci_status === 'failure' || pr.blocked) score += 40;
    score += Math.min(30, Math.round(drift * 30));
    score += stale.level === 'very_stale' ? 20 : stale.level === 'stale' ? 10 : 0;
    score += Math.min(10, Math.round(((pr.additions || 0) + (pr.deletions || 0)) / 100));

    return {
      ...pr,
      urgency_score: score,
      urgency_reason: {
        blocked: !!(pr.mergeable === false || pr.ci_status === 'failure' || pr.blocked),
        drift,
        stale: stale.level
      }
    };
  });

  return scored.sort((a, b) => b.urgency_score - a.urgency_score);
}

export function suggestBetterDescription(pr = {}) {
  const title = pr.title || 'Untitled PR';
  const files = (pr.files_changed || []).slice(0, 6);
  const body = [
    `## Summary`,
    `${title}.`,
    '',
    `## Why`,
    `Improve code review clarity and reduce drift risk by documenting intent and scope.`,
    '',
    `## Scope`,
    ...files.map(f => `- ${f}`),
    '',
    `## Validation`,
    `- [ ] Tests added/updated`,
    `- [ ] CI passing`,
    `- [ ] Rollback impact considered`
  ].join('\n');
  return body;
}

export function writeDescriptionFromCommits(commits = [], title = 'PR Update') {
  const bullets = commits.slice(0, 12).map(c => `- ${c.message || '(no message)'}`);
  return [
    '## Summary',
    `${title}`,
    '',
    '## Changes from commits',
    ...bullets,
    '',
    '## Reviewer notes',
    '- Please focus on behavioral changes and any migration risk.'
  ].join('\n');
}

export function parsePrUrl(url) {
  const m = String(url).match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!m) throw new Error('invalid PR URL');
  return { owner: m[1], repo: m[2], number: Number(m[3]) };
}

export function trendGraph(prs = []) {
  const byWeek = new Map();
  for (const pr of prs) {
    const d = new Date(pr.merged_at || pr.closed_at || pr.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const week = `${d.getUTCFullYear()}-W${String(getWeek(d)).padStart(2, '0')}`;
    byWeek.set(week, (byWeek.get(week) || 0) + 1);
  }
  const rows = [...byWeek.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return rows.map(([w, c]) => `${w} ${'█'.repeat(Math.min(20, c))} ${c}`).join('\n');
}

function getWeek(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
