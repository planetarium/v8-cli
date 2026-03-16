'use strict';

const { get } = require('../api');
const { getBaseUrl } = require('../config');
const { ok, err, requireToken } = require('../output');

function registerAuth(program) {
  program
    .command('auth')
    .description('Verify current token')
    .action(async function () {
      const config = this.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const res = await get(base, '/v1/auth/verify', config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      const d = res.data;
      ok(`uid: ${d.userUid}  handle: ${d.handle}  name: ${d.displayName}  role: ${d.role}  email: ${d.email}`);
    });
}

module.exports = { registerAuth };
