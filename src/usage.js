'use strict';

const fs = require('fs');
const path = require('path');

const USAGE_FILE = path.join(process.env.HOME || '', '.config', 'v8-cli', 'usage.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function track(commandName) {
  const data = load();
  data[commandName] = (data[commandName] || 0) + 1;
  fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2) + '\n');
}

function report() {
  const data = load();
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    console.log('(no usage data)');
    return;
  }
  const maxCmd = Math.max(...entries.map(([k]) => k.length), 7);
  console.log('Command'.padEnd(maxCmd) + '  Count');
  console.log('-'.repeat(maxCmd) + '  -----');
  for (const [cmd, count] of entries) {
    console.log(cmd.padEnd(maxCmd) + '  ' + count);
  }
}

module.exports = { track, report, USAGE_FILE };
