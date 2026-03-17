#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { loadConfig } = require('./config');
const { registerComments } = require('./commands/comments');
const { registerUsers } = require('./commands/users');
const { registerCredits } = require('./commands/credits');
const { registerCoupons } = require('./commands/coupons');
const { registerVerses } = require('./commands/verses');
const { registerAuth } = require('./commands/auth');
const { registerConfig } = require('./commands/config-cmd');
const { track, report } = require('./usage');
const { registerGamePayments } = require('./commands/gen-game-payments');
const { registerVerseTags } = require('./commands/gen-verse-tags');
const { registerMissions } = require('./commands/gen-missions');
const { registerAnalytics } = require('./commands/gen-analytics');

program
  .name('v8')
  .version(require('../package.json').version)
  .description('Token-optimized CLI for V8 platform admin API')
  .option('--env <env>', 'environment (test|local)')
  .option('--token <jwt>', 'bearer token override')
  .option('--json', 'output raw JSON')
  .hook('preAction', (thisCommand, actionCommand) => {
    const target = actionCommand || thisCommand;
    const opts = target.optsWithGlobals();
    const config = loadConfig();
    if (opts.env) config.env = opts.env;
    if (opts.token) config.token = opts.token;
    target._v8config = config;
    // Also set on thisCommand for compatibility
    if (target !== thisCommand) thisCommand._v8config = config;
    // Track usage: "parent subcommand" e.g. "comments list"
    const parts = [];
    let cmd = target;
    while (cmd && cmd.name() !== 'v8') {
      parts.unshift(cmd.name());
      cmd = cmd.parent;
    }
    if (parts.length > 0 && parts[0] !== 'usage') track(parts.join(' '));
  });

registerConfig(program);
program.command('usage').description('Show command usage stats').action(report);
registerAuth(program);
registerUsers(program);
registerCredits(program);
registerCoupons(program);
registerComments(program);
registerVerses(program);
registerGamePayments(program);
registerVerseTags(program);
registerMissions(program);
registerAnalytics(program);

program.parse();
