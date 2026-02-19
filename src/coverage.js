/**
 * Coverage delta utilities
 */

export function calculateCoverageDelta(basePct, headPct) {
  const base = Number(basePct);
  const head = Number(headPct);
  if (Number.isNaN(base) || Number.isNaN(head)) {
    throw new Error('coverage values must be numbers');
  }

  const delta = Math.round((head - base) * 100) / 100;
  let level = 'ok';
  if (delta < 0) level = 'regression';
  if (delta <= -2) level = 'critical_regression';

  return {
    base,
    head,
    delta,
    level
  };
}

export function formatCoverageDeltaReport(result) {
  const emoji = result.level === 'ok' ? '✅' : result.level === 'regression' ? '⚠️' : '🔴';
  const sign = result.delta > 0 ? '+' : '';

  let line = `${emoji} Coverage delta: ${result.base}% → ${result.head}% (${sign}${result.delta}pp)`;
  if (result.level === 'critical_regression') {
    line += '\nAction: add/restore tests before merge.';
  } else if (result.level === 'regression') {
    line += '\nAction: review changed lines for missing test coverage.';
  }
  return line;
}
