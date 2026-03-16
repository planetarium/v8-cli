'use strict';

const { loadConfig, saveConfig, CONFIG_FILE } = require('../config');
const { ok } = require('../output');

function registerConfig(program) {
  const cmd = program.command('config').description('Manage CLI configuration');

  cmd
    .command('set-env <env>')
    .description('Set environment (test|local)')
    .action((env) => {
      const config = loadConfig();
      config.env = env;
      saveConfig(config);
      ok(`env → ${env}`);
    });

  cmd
    .command('set-token <jwt>')
    .description('Set bearer token')
    .action((jwt) => {
      const config = loadConfig();
      config.token = jwt;
      saveConfig(config);
      ok('token saved');
    });

  cmd
    .command('set-url <url>')
    .description('Set custom base URL (overrides env)')
    .action((url) => {
      const config = loadConfig();
      config.baseUrl = url;
      saveConfig(config);
      ok(`baseUrl → ${url}`);
    });

  cmd
    .command('show')
    .description('Show current config')
    .action(() => {
      const config = loadConfig();
      console.log(`file:  ${CONFIG_FILE}`);
      console.log(`env:   ${config.env}`);
      console.log(`url:   ${config.baseUrl || '(default)'}`);
      console.log(`token: ${config.token ? config.token.slice(0, 20) + '...' : '(not set)'}`);
    });
}

module.exports = { registerConfig };
