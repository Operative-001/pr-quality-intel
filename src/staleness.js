/**
 * Staleness Detection
 * Track when PRs become stale
 */

const DEFAULT_STALE_DAYS = 5;
const DEFAULT_VERY_STALE_DAYS = 14;

/**
 * Calculate PR staleness
 * @param {Object} pr - PR data with created_at, updated_at
 * @param {Object} options - Configuration options
 * @returns {Object} Staleness analysis
 */
export function calculateStaleness(pr, options = {}) {
  const staleDays = options.stale_days || DEFAULT_STALE_DAYS;
  const veryStaleDays = options.very_stale_days || DEFAULT_VERY_STALE_DAYS;
  
  const now = new Date();
  const created = new Date(pr.created_at);
  const updated = new Date(pr.updated_at);
  
  const ageMs = now - created;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  
  const inactiveMs = now - updated;
  const inactiveDays = Math.floor(inactiveMs / (1000 * 60 * 60 * 24));
  
  // Determine staleness level
  let level, emoji;
  if (inactiveDays >= veryStaleDays) {
    level = 'very_stale';
    emoji = '🔴';
  } else if (inactiveDays >= staleDays) {
    level = 'stale';
    emoji = '🟡';
  } else {
    level = 'fresh';
    emoji = '🟢';
  }

  return {
    age_days: ageDays,
    inactive_days: inactiveDays,
    level,
    emoji,
    is_stale: level !== 'fresh',
    thresholds: { stale_days: staleDays, very_stale_days: veryStaleDays }
  };
}

/**
 * Filter stale PRs from a list
 * @param {Array} prs - List of PR objects
 * @param {Object} options - Configuration options
 * @returns {Array} Stale PRs sorted by staleness
 */
export function filterStalePRs(prs, options = {}) {
  return prs
    .map(pr => ({
      ...pr,
      staleness: calculateStaleness(pr, options)
    }))
    .filter(pr => pr.staleness.is_stale)
    .sort((a, b) => b.staleness.inactive_days - a.staleness.inactive_days);
}

/**
 * Generate staleness notification
 * @param {Object} pr - PR with staleness data
 * @returns {string} Notification message
 */
export function generateStalenessAlert(pr) {
  const s = pr.staleness;
  
  if (s.level === 'very_stale') {
    return `🔴 **PR #${pr.number}** is very stale (${s.inactive_days} days inactive). Consider closing or updating.`;
  } else if (s.level === 'stale') {
    return `🟡 **PR #${pr.number}** is going stale (${s.inactive_days} days inactive). Needs attention.`;
  }
  return null;
}

/**
 * Generate daily digest of stale PRs
 * @param {Array} stalePRs - List of stale PRs
 * @param {string} repoName - Repository name
 * @returns {string} Markdown digest
 */
export function generateDigest(stalePRs, repoName) {
  if (stalePRs.length === 0) {
    return `✅ **${repoName}**: No stale PRs. Great work keeping things moving!`;
  }

  let digest = `## 📋 Stale PR Digest: ${repoName}\n\n`;
  digest += `Found **${stalePRs.length}** stale PR(s):\n\n`;

  const veryStale = stalePRs.filter(pr => pr.staleness.level === 'very_stale');
  const stale = stalePRs.filter(pr => pr.staleness.level === 'stale');

  if (veryStale.length > 0) {
    digest += `### 🔴 Very Stale (${veryStale.length})\n`;
    for (const pr of veryStale) {
      digest += `- **#${pr.number}** - ${pr.title} (${pr.staleness.inactive_days}d inactive)\n`;
    }
    digest += '\n';
  }

  if (stale.length > 0) {
    digest += `### 🟡 Stale (${stale.length})\n`;
    for (const pr of stale) {
      digest += `- **#${pr.number}** - ${pr.title} (${pr.staleness.inactive_days}d inactive)\n`;
    }
  }

  digest += `\n---\n*PR Quality Intel Daily Digest*`;
  return digest;
}
