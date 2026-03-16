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

program
  .name('v8')
  .version(require('../package.json').version)
  .description('Token-optimized CLI for V8 platform admin API')
  .option('--env <env>', 'environment (test|local)')
  .option('--token <jwt>', 'bearer token override')
  .option('--json', 'output raw JSON')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    const config = loadConfig();
    if (opts.env) config.env = opts.env;
    if (opts.token) config.token = opts.token;
    thisCommand._v8config = config;
  });

registerConfig(program);
registerAuth(program);
registerUsers(program);
registerCredits(program);
registerCoupons(program);
registerComments(program);
registerVerses(program);

program.parse();
