#!/usr/bin/env node

/**
 * PR Quality Intel CLI
 */

import fs from 'node:fs';
import { extractIntent, analyzeDrift, generateDriftReport } from './drift.js';
import { calculateReadiness, generateReadinessReport, calculateTeamReadiness, generateTeamDashboard } from './readiness.js';
import { calculateStaleness, findPreStalePRs, buildReviewerPingPayload } from './staleness.js';
import { generateAISummary } from './summary.js';

const args = process.argv.slice(2);
const command = args[0];

function arg(name, fallback = null) {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : fallback;
}

function printUsage() {
  console.log(`
PR Quality Intel CLI

Usage:
  pqi analyze <pr-json-file>                 Analyze a PR from JSON file
  pqi precheck <pr-json-file>                Pre-submit drift warning
  pqi ping <pr-list-json-file>               Generate pre-stale reviewer pings
  pqi summary <pr-list-json-file>            AI summary grouped by urgency
  pqi dashboard <pr-list-json-file>          Team-level merge readiness dashboard
  pqi drift <description>                    Check extracted intent
  pqi demo                                   Run demo analysis

Options:
  --threshold <n>      Drift threshold (default 0.40)
  --base-drift <n>     Baseline drift before this change (default 0)
  --stale-days <n>     Stale threshold days (default 5)
  --warn-before <n>    Days before stale to ping (default 3)
  --webhook <url>      Send payload to webhook
  --json               Output as JSON
  --help               Show this help
`);
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function postWebhook(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.status;
}

function runDemo() {
  console.log('🔍 PR Quality Intel - Demo Analysis\n');

  const demoPR = {
    number: 42,
    title: 'Add user authentication',
    body: 'This PR adds user authentication with JWT tokens. Changes to `src/auth.js` and `src/middleware.js`.',
    draft: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    requested_reviewers: [{ login: 'reviewer1' }],
    ci_status: 'success',
    mergeable: true,
    additions: 150,
    deletions: 20,
    approvals: 1
  };

  const demoCommits = [
    { message: 'Add JWT auth module', files_changed: ['src/auth.js'] },
    { message: 'Add auth middleware', files_changed: ['src/middleware.js'] },
    { message: 'Fix typo in readme', files_changed: ['README.md'] }
  ];

  const intent = extractIntent(demoPR.body);
  const drift = analyzeDrift(intent, demoCommits);
  const readiness = calculateReadiness(demoPR);
  const staleness = calculateStaleness(demoPR);

  console.log('━'.repeat(50));
  console.log(generateDriftReport(drift));
  console.log('━'.repeat(50));
  console.log(generateReadinessReport(readiness));
  console.log('━'.repeat(50));
  console.log(`\n## ${staleness.emoji} Staleness: ${staleness.level}`);
  console.log(`- Age: ${staleness.age_days} days`);
  console.log(`- Inactive: ${staleness.inactive_days} days`);
  console.log('━'.repeat(50));
}

async function main() {
  if (!command || command === '--help') {
    printUsage();
    process.exit(0);
  }

  if (command === 'demo') {
    runDemo();
    process.exit(0);
  }

  if (command === 'analyze') {
    const file = args[1];
    if (!file) {
      console.error('Error: Missing PR JSON file path');
      process.exit(1);
    }

    try {
      const data = readJson(file);
      const intent = extractIntent(data.body || '');
      const drift = analyzeDrift(intent, data.commits || []);
      const readiness = calculateReadiness(data);
      const staleness = calculateStaleness(data);

      if (args.includes('--json')) {
        console.log(JSON.stringify({ drift, readiness, staleness }, null, 2));
      } else {
        console.log(generateDriftReport(drift));
        console.log('\n');
        console.log(generateReadinessReport(readiness));
      }
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  if (command === 'precheck') {
    const file = args[1];
    if (!file) {
      console.error('Error: Missing PR JSON file path');
      process.exit(1);
    }
    const threshold = Number(arg('threshold', '0.4'));
    const data = readJson(file);
    const intent = extractIntent(data.body || '');
    const drift = analyzeDrift(intent, data.commits || []);
    const driftPct = Math.round(drift.drift_score * 100);
    const baseDrift = Number(arg('base-drift', '0'));
    const increasePct = Math.round(Math.max(0, (drift.drift_score - baseDrift) * 100));

    if (drift.drift_score >= threshold) {
      console.log(`⚠️ Pre-submit warning: this will increase drift to ${driftPct}% (+${increasePct}pp, threshold ${Math.round(threshold * 100)}%).`);
      console.log('Action: split unrelated commits/files before push or mark scope update in PR description.');
      process.exit(2);
    }

    console.log(`✅ Pre-submit check passed: estimated drift ${driftPct}% (+${increasePct}pp, threshold ${Math.round(threshold * 100)}%).`);
    process.exit(0);
  }

  if (command === 'ping') {
    const file = args[1];
    if (!file) {
      console.error('Error: Missing PR list JSON file path');
      process.exit(1);
    }
    const staleDays = Number(arg('stale-days', '5'));
    const warnBefore = Number(arg('warn-before', '3'));
    const prs = readJson(file);
    const preStale = findPreStalePRs(prs, { stale_days: staleDays, warning_days_before_stale: warnBefore });
    const payload = buildReviewerPingPayload(preStale, { stale_days: staleDays, warning_days_before_stale: warnBefore });

    if (args.includes('--json')) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(payload.text);
    }

    const webhook = arg('webhook');
    if (webhook && preStale.length > 0) {
      const status = await postWebhook(webhook, payload);
      console.log(`webhook_status=${status}`);
    }
    process.exit(0);
  }

  if (command === 'summary') {
    const file = args[1];
    if (!file) {
      console.error('Error: Missing PR list JSON file path');
      process.exit(1);
    }
    const prs = readJson(file);
    const summary = generateAISummary(prs, {
      stale_days: Number(arg('stale-days', '5')),
      drift_threshold: Number(arg('threshold', '0.4'))
    });

    if (args.includes('--json')) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log(summary.summary);
      if (summary.details.length) {
        console.log('\nDetails:');
        summary.details.forEach(d => console.log(`- ${d}`));
      }
    }

    const webhook = arg('webhook');
    if (webhook) {
      const status = await postWebhook(webhook, { text: `${summary.summary}\n${summary.details.slice(0, 10).map(x => `• ${x}`).join('\n')}` });
      console.log(`webhook_status=${status}`);
    }
    process.exit(0);
  }

  if (command === 'dashboard') {
    const file = args[1];
    if (!file) {
      console.error('Error: Missing PR list JSON file path');
      process.exit(1);
    }
    const prs = readJson(file);
    const team = calculateTeamReadiness(prs);
    if (args.includes('--json')) {
      console.log(JSON.stringify(team, null, 2));
    } else {
      console.log(generateTeamDashboard(team));
    }
    process.exit(0);
  }

  if (command === 'drift') {
    const description = args.slice(1).join(' ');
    if (!description) {
      console.error('Error: Missing PR description');
      process.exit(1);
    }

    const intent = extractIntent(description);
    console.log('Extracted intent:', JSON.stringify(intent, null, 2));
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main();
