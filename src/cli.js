#!/usr/bin/env node

/**
 * PR Quality Intel CLI
 * Usage: pqi analyze <pr-url> | pqi digest <owner/repo>
 */

import { extractIntent, analyzeDrift, generateDriftReport } from './drift.js';
import { calculateReadiness, generateReadinessReport } from './readiness.js';
import { calculateStaleness, generateStalenessAlert } from './staleness.js';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
PR Quality Intel CLI

Usage:
  pqi analyze <pr-json-file>    Analyze a PR from JSON file
  pqi drift <description>       Check drift from PR description
  pqi demo                      Run demo analysis

Options:
  --help    Show this help
  --json    Output as JSON
`);
}

function runDemo() {
  console.log('🔍 PR Quality Intel - Demo Analysis\n');
  
  // Demo PR data
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
    { message: 'Fix typo in readme', files_changed: ['README.md'] } // slight drift
  ];

  // Run analyses
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
      const fs = await import('node:fs');
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      
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
