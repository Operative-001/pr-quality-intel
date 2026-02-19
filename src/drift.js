/**
 * PR Drift Detection
 * Measures how much a PR has changed from its original scope
 */

/**
 * Extract original intent from PR description
 * @param {string} description - PR body/description
 * @returns {Object} Extracted intent (summary, files_expected, scope_keywords)
 */
export function extractIntent(description) {
  if (!description) {
    return { summary: '', files_expected: [], scope_keywords: [] };
  }

  // Extract scope from common patterns
  const lines = description.split('\n');
  const summary = lines[0] || '';
  
  // Look for file patterns
  const filePatterns = description.match(/`([^`]+\.(js|ts|py|go|rs|java|rb|css|html|md))`/gi) || [];
  const files_expected = filePatterns.map(f => f.replace(/`/g, ''));
  
  // Extract scope keywords (nouns after "this PR", "changes", "adds", "fixes")
  const scopeMatch = description.match(/(?:this pr|changes?|adds?|fixes?|implements?|updates?)\s+([^.!?\n]+)/gi) || [];
  const scope_keywords = scopeMatch
    .map(m => m.replace(/(?:this pr|changes?|adds?|fixes?|implements?|updates?)\s+/i, ''))
    .filter(k => k.length > 3);

  return { summary, files_expected, scope_keywords };
}

/**
 * Analyze PR commits to detect scope drift
 * @param {Object} intent - Original intent from extractIntent()
 * @param {Array} commits - Array of commit objects {message, files_changed}
 * @returns {Object} Drift analysis
 */
export function analyzeDrift(intent, commits) {
  const allFilesChanged = new Set();
  const allCommitKeywords = [];
  
  for (const commit of commits) {
    (commit.files_changed || []).forEach(f => allFilesChanged.add(f));
    
    // Extract keywords from commit message
    const words = commit.message.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);
    allCommitKeywords.push(...words);
  }

  // Calculate drift metrics
  const expectedFiles = new Set(intent.files_expected.map(f => f.toLowerCase()));
  const unexpectedFiles = [...allFilesChanged].filter(f => {
    const fLower = f.toLowerCase();
    return ![...expectedFiles].some(exp => fLower.includes(exp) || exp.includes(fLower));
  });

  // Keyword overlap
  const intentKeywords = new Set(intent.scope_keywords.map(k => k.toLowerCase()));
  const keywordOverlap = allCommitKeywords.filter(k => intentKeywords.has(k)).length;
  const keywordDrift = intentKeywords.size > 0 
    ? 1 - (keywordOverlap / Math.max(intentKeywords.size, 1))
    : 0;

  // File drift ratio
  const fileDrift = allFilesChanged.size > 0
    ? unexpectedFiles.length / allFilesChanged.size
    : 0;

  // Combined drift score (0 = no drift, 1 = complete drift)
  // Weight keywords less if we have good file matches
  const fileMatch = expectedFiles.size > 0 && allFilesChanged.size > 0;
  const driftScore = fileMatch 
    ? (keywordDrift * 0.3) + (fileDrift * 0.7)
    : (keywordDrift * 0.5) + (fileDrift * 0.5);

  return {
    drift_score: Math.round(driftScore * 100) / 100,
    drift_level: driftScore < 0.2 ? 'low' : driftScore < 0.5 ? 'medium' : 'high',
    files_changed: [...allFilesChanged],
    files_unexpected: unexpectedFiles,
    scope_summary: {
      original: intent.summary,
      keywords_expected: intent.scope_keywords,
      keywords_found_in_commits: [...new Set(allCommitKeywords)].slice(0, 10)
    }
  };
}

/**
 * Generate drift report for PR comment
 * @param {Object} analysis - Result from analyzeDrift()
 * @returns {string} Markdown report
 */
export function generateDriftReport(analysis) {
  const emoji = analysis.drift_level === 'low' ? '✅' : 
                analysis.drift_level === 'medium' ? '⚠️' : '🔴';
  
  let report = `## ${emoji} PR Drift Score: ${Math.round(analysis.drift_score * 100)}%\n\n`;
  
  if (analysis.drift_level === 'low') {
    report += `This PR stays on scope. Nice work!\n`;
  } else if (analysis.drift_level === 'medium') {
    report += `This PR has some scope drift. Consider splitting if it grows further.\n`;
  } else {
    report += `⚠️ **High drift detected.** This PR may be doing too many things.\n`;
  }

  if (analysis.files_unexpected.length > 0) {
    report += `\n### Unexpected files changed\n`;
    analysis.files_unexpected.slice(0, 5).forEach(f => {
      report += `- \`${f}\`\n`;
    });
    if (analysis.files_unexpected.length > 5) {
      report += `- ...and ${analysis.files_unexpected.length - 5} more\n`;
    }
  }

  report += `\n---\n*PR Quality Intel*`;
  return report;
}
