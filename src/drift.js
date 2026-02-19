/**
 * PR Drift Detection
 * Measures how much a PR has changed from its original scope
 */

export function extractIntent(description) {
  if (!description) {
    return { summary: '', files_expected: [], scope_keywords: [] };
  }

  const lines = description.split('\n');
  const summary = lines[0] || '';

  const filePatterns = description.match(/`([^`]+\.(js|ts|py|go|rs|java|rb|css|html|md))`/gi) || [];
  const files_expected = filePatterns.map(f => f.replace(/`/g, ''));

  const scopeMatch = description.match(/(?:this pr|changes?|adds?|fixes?|implements?|updates?)\s+([^.!?\n]+)/gi) || [];
  const scope_keywords = scopeMatch
    .map(m => m.replace(/(?:this pr|changes?|adds?|fixes?|implements?|updates?)\s+/i, ''))
    .filter(k => k.length > 3);

  return { summary, files_expected, scope_keywords };
}

function commitDrift(intent, commit) {
  const expectedFiles = new Set(intent.files_expected.map(f => f.toLowerCase()));
  const filesChanged = commit.files_changed || [];
  const unexpected = filesChanged.filter(f => {
    const fLower = String(f).toLowerCase();
    if (expectedFiles.size === 0) return false;
    return ![...expectedFiles].some(exp => fLower.includes(exp) || exp.includes(fLower));
  });

  const intentKeywords = new Set(intent.scope_keywords.map(k => String(k).toLowerCase()));
  const words = String(commit.message || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  const overlap = words.filter(w => intentKeywords.has(w)).length;
  const keywordMiss = intentKeywords.size > 0 ? 1 - (overlap / Math.max(intentKeywords.size, 1)) : 0;
  const fileMiss = filesChanged.length > 0 ? unexpected.length / filesChanged.length : 0;

  const drift = (fileMiss * 0.7) + (keywordMiss * 0.3);
  return {
    message: commit.message,
    files_changed: filesChanged,
    unexpected_files: unexpected,
    drift_contribution: Math.round(drift * 100) / 100
  };
}

export function analyzeDrift(intent, commits) {
  const allFilesChanged = new Set();
  const allCommitKeywords = [];

  for (const commit of commits) {
    (commit.files_changed || []).forEach(f => allFilesChanged.add(f));

    const words = String(commit.message || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);
    allCommitKeywords.push(...words);
  }

  const expectedFiles = new Set(intent.files_expected.map(f => f.toLowerCase()));
  const unexpectedFiles = [...allFilesChanged].filter(f => {
    const fLower = f.toLowerCase();
    return ![...expectedFiles].some(exp => fLower.includes(exp) || exp.includes(fLower));
  });

  const intentKeywords = new Set(intent.scope_keywords.map(k => k.toLowerCase()));
  const keywordOverlap = allCommitKeywords.filter(k => intentKeywords.has(k)).length;
  const keywordDrift = intentKeywords.size > 0 ? 1 - (keywordOverlap / Math.max(intentKeywords.size, 1)) : 0;

  const fileDrift = allFilesChanged.size > 0 ? unexpectedFiles.length / allFilesChanged.size : 0;

  const fileMatch = expectedFiles.size > 0 && allFilesChanged.size > 0;
  const driftScore = fileMatch ? (keywordDrift * 0.3) + (fileDrift * 0.7) : (keywordDrift * 0.5) + (fileDrift * 0.5);

  const commit_highlights = commits
    .map(c => commitDrift(intent, c))
    .sort((a, b) => b.drift_contribution - a.drift_contribution);

  return {
    drift_score: Math.round(driftScore * 100) / 100,
    drift_level: driftScore < 0.2 ? 'low' : driftScore < 0.5 ? 'medium' : 'high',
    files_changed: [...allFilesChanged],
    files_unexpected: unexpectedFiles,
    commit_highlights,
    scope_summary: {
      original: intent.summary,
      keywords_expected: intent.scope_keywords,
      keywords_found_in_commits: [...new Set(allCommitKeywords)].slice(0, 10)
    }
  };
}

export function generateDriftReport(analysis) {
  const emoji = analysis.drift_level === 'low' ? '✅' : analysis.drift_level === 'medium' ? '⚠️' : '🔴';

  let report = `## ${emoji} PR Drift Score: ${Math.round(analysis.drift_score * 100)}%\n\n`;

  if (analysis.drift_level === 'low') {
    report += 'This PR stays on scope. Nice work!\n';
  } else if (analysis.drift_level === 'medium') {
    report += 'This PR has some scope drift. Consider splitting if it grows further.\n';
  } else {
    report += '⚠️ **High drift detected.** This PR may be doing too many things.\n';
  }

  if (analysis.files_unexpected.length > 0) {
    report += '\n### Unexpected files changed\n';
    analysis.files_unexpected.slice(0, 5).forEach(f => {
      report += `- \`${f}\`\n`;
    });
    if (analysis.files_unexpected.length > 5) {
      report += `- ...and ${analysis.files_unexpected.length - 5} more\n`;
    }
  }

  if (analysis.commit_highlights?.length) {
    report += '\n### Commit-level drift highlights\n';
    analysis.commit_highlights.slice(0, 5).forEach(c => {
      report += `- ${(c.drift_contribution * 100).toFixed(0)}%: ${c.message || '(no message)'}\n`;
    });
  }

  report += '\n---\n*PR Quality Intel*';
  return report;
}
