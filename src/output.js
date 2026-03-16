'use strict';

function table(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log('(no results)');
    return;
  }

  const widths = {};
  for (const col of columns) {
    widths[col.key] = col.label.length;
  }
  for (const row of rows) {
    for (const col of columns) {
      const val = String(row[col.key] ?? '');
      widths[col.key] = Math.max(widths[col.key], val.length);
    }
  }

  // Cap content column at 60 chars
  for (const col of columns) {
    if (col.maxWidth) widths[col.key] = Math.min(widths[col.key], col.maxWidth);
  }

  const header = columns.map((c) => c.label.padEnd(widths[c.key])).join('  ');
  const sep = columns.map((c) => '-'.repeat(widths[c.key])).join('  ');
  console.log(header);
  console.log(sep);
  for (const row of rows) {
    const line = columns
      .map((c) => {
        let val = String(row[c.key] ?? '');
        if (c.maxWidth && val.length > c.maxWidth) val = val.slice(0, c.maxWidth - 3) + '...';
        return val.padEnd(widths[c.key]);
      })
      .join('  ');
    console.log(line);
  }
  console.log(`\n${rows.length} row(s)`);
}

function ok(msg) {
  console.log(msg);
}

function err(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function requireToken(config) {
  if (!config.token) {
    err('No token configured. Run: v8 config set-token <jwt>');
  }
}

module.exports = { table, ok, err, requireToken };
