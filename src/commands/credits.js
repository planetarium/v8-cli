'use strict';

const { get, post } = require('../api');
const { getBaseUrl } = require('../config');
const { ok, err, requireToken } = require('../output');

function registerCredits(program) {
  const cmd = program.command('credits').description('Credit management');

  cmd
    .command('give <uid> <amount>')
    .description('Give credits to user (amount in USD)')
    .action(async function (uid, amount) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const res = await post(base, '/v1/admin/credits/coupon', config.token, {
        userUid: uid,
        amount: Number(amount),
      });
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      ok(`Gave $${amount} to user ${uid} (txn: ${res.data.transactionId || 'n/a'})`);
    });

  cmd
    .command('balance <keyword>')
    .description('Check user credit balance by email/name/handle')
    .action(async function (keyword) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const qs = `keyword=${encodeURIComponent(keyword)}&limit=5`;
      const res = await get(base, `/v1/admin/users/search?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      const users = res.data.users || res.data;
      for (const u of users) {
        console.log(`${u.userUid}  ${u.email}  $${u.creditInUSD}`);
      }
      if (users.length === 0) ok('(no users found)');
    });
}

module.exports = { registerCredits };
