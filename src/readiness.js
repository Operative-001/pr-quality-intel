/**
 * Merge Readiness Scoring
 * Composite score for PR merge readiness
 */

/**
 * Calculate merge readiness score
 * @param {Object} pr - PR data object
 * @returns {Object} Readiness analysis
 */
export function calculateReadiness(pr) {
  const checks = [];
  let score = 0;
  const maxScore = 100;

  // 1. Has description (10 points)
  const hasDescription = pr.body && pr.body.trim().length > 20;
  checks.push({
    name: 'Has description',
    passed: hasDescription,
    points: hasDescription ? 10 : 0,
    suggestion: hasDescription ? null : 'Add a description explaining what this PR does'
  });
  score += hasDescription ? 10 : 0;

  // 2. Not a draft (10 points)
  const notDraft = !pr.draft;
  checks.push({
    name: 'Not a draft',
    passed: notDraft,
    points: notDraft ? 10 : 0,
    suggestion: notDraft ? null : 'Mark as ready for review when complete'
  });
  score += notDraft ? 10 : 0;

  // 3. Has reviewers assigned (15 points)
  const hasReviewers = (pr.requested_reviewers?.length || 0) > 0;
  checks.push({
    name: 'Reviewers assigned',
    passed: hasReviewers,
    points: hasReviewers ? 15 : 0,
    suggestion: hasReviewers ? null : 'Request reviewers for feedback'
  });
  score += hasReviewers ? 15 : 0;

  // 4. CI passing (25 points)
  const ciPassing = pr.ci_status === 'success' || pr.mergeable_state === 'clean';
  checks.push({
    name: 'CI passing',
    passed: ciPassing,
    points: ciPassing ? 25 : 0,
    suggestion: ciPassing ? null : 'Fix failing CI checks'
  });
  score += ciPassing ? 25 : 0;

  // 5. No merge conflicts (20 points)
  const noConflicts = pr.mergeable !== false;
  checks.push({
    name: 'No merge conflicts',
    passed: noConflicts,
    points: noConflicts ? 20 : 0,
    suggestion: noConflicts ? null : 'Resolve merge conflicts with base branch'
  });
  score += noConflicts ? 20 : 0;

  // 6. Reasonable size (10 points) - less than 500 lines
  const additions = pr.additions || 0;
  const deletions = pr.deletions || 0;
  const totalLines = additions + deletions;
  const reasonableSize = totalLines < 500;
  checks.push({
    name: 'Reasonable size (<500 lines)',
    passed: reasonableSize,
    points: reasonableSize ? 10 : 0,
    suggestion: reasonableSize ? null : `PR is ${totalLines} lines. Consider splitting into smaller PRs.`
  });
  score += reasonableSize ? 10 : 0;

  // 7. Has approvals (10 points)
  const hasApprovals = (pr.approvals || 0) > 0;
  checks.push({
    name: 'Has approvals',
    passed: hasApprovals,
    points: hasApprovals ? 10 : 0,
    suggestion: hasApprovals ? null : 'Get at least one approval'
  });
  score += hasApprovals ? 10 : 0;

  // Determine readiness level
  const level = score >= 80 ? 'ready' : score >= 50 ? 'almost' : 'not_ready';
  const emoji = level === 'ready' ? '🟢' : level === 'almost' ? '🟡' : '🔴';

  return {
    score,
    max_score: maxScore,
    percentage: Math.round((score / maxScore) * 100),
    level,
    emoji,
    checks,
    blocking: checks.filter(c => !c.passed && c.points >= 15)
  };
}

/**
 * Generate readiness checklist for PR comment
 * @param {Object} readiness - Result from calculateReadiness()
 * @returns {string} Markdown checklist
 */
export function generateReadinessReport(readiness) {
  let report = `## ${readiness.emoji} Merge Readiness: ${readiness.percentage}%\n\n`;
  
  report += `| Check | Status | Points |\n`;
  report += `|-------|--------|--------|\n`;
  
  for (const check of readiness.checks) {
    const status = check.passed ? '✅' : '❌';
    report += `| ${check.name} | ${status} | ${check.points}/${check.name === 'CI passing' ? 25 : check.name === 'No merge conflicts' ? 20 : check.name === 'Reviewers assigned' || check.name === 'Has approvals' ? 15 : 10} |\n`;
  }

  if (readiness.blocking.length > 0) {
    report += `\n### 🚧 Blocking Issues\n`;
    for (const blocker of readiness.blocking) {
      report += `- ${blocker.suggestion}\n`;
    }
  }

  if (readiness.level === 'ready') {
    report += `\n✅ **This PR is ready to merge!**\n`;
  }

  report += `\n---\n*PR Quality Intel*`;
  return report;
}
