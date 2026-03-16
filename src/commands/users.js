'use strict';

const { get, post } = require('../api');
const { getBaseUrl } = require('../config');
const { table, ok, err, requireToken } = require('../output');

function registerUsers(program) {
  const cmd = program.command('users').description('User management');

  cmd
    .command('search <keyword>')
    .description('Search users by email/name/handle')
    .option('-l, --limit <n>', 'limit', '20')
    .option('-p, --page <n>', 'page', '1')
    .action(async function (keyword) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      const qs = `keyword=${encodeURIComponent(keyword)}&limit=${opts.limit}&page=${opts.page}`;
      const res = await get(base, `/v1/admin/users/search?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      table(res.data.users || res.data, [
        { key: 'userUid', label: 'UID' },
        { key: 'email', label: 'Email', maxWidth: 35 },
        { key: 'handle', label: 'Handle', maxWidth: 20 },
        { key: 'name', label: 'Name', maxWidth: 15 },
        { key: 'creditInUSD', label: 'Credit($)' },
        { key: 'isSeller', label: 'Seller' },
      ]);
    });

  cmd
    .command('low-balance')
    .description('Get users with low credit balance')
    .option('-t, --threshold <usd>', 'USD threshold', '5')
    .option('-l, --limit <n>', 'limit', '20')
    .option('-p, --page <n>', 'page', '1')
    .action(async function () {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      const qs = `threshold=${opts.threshold}&limit=${opts.limit}&page=${opts.page}`;
      const res = await get(base, `/v1/admin/users/low-balance-details?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      table(res.data.users || res.data, [
        { key: 'userUid', label: 'UID' },
        { key: 'email', label: 'Email', maxWidth: 35 },
        { key: 'name', label: 'Name', maxWidth: 15 },
        { key: 'creditInUSD', label: 'Credit($)' },
      ]);
    });

  cmd
    .command('set-seller <uid> <status>')
    .description('Set seller status (true|false)')
    .action(async function (uid, status) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const res = await post(base, '/v1/admin/users/set-seller', config.token, {
        userUid: uid,
        isSeller: status === 'true',
      });
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      ok(`User ${uid} seller → ${status}`);
    });
}

module.exports = { registerUsers };
