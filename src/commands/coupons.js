'use strict';

const { post } = require('../api');
const { getBaseUrl } = require('../config');
const { ok, err, requireToken } = require('../output');

function registerCoupons(program) {
  const cmd = program.command('coupons').description('Coupon management');

  cmd
    .command('generate <amount> <count>')
    .description('Generate coupon codes (amount in USD, count 1-1000)')
    .action(async function (amount, count) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const res = await post(base, '/v1/admin/coupon/generate', config.token, {
        amount: Number(amount),
        count: Number(count),
      });
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      const codes = res.data.codes || [];
      for (const code of codes) console.log(code);
      ok(`\nGenerated ${codes.length} coupons ($${amount} each)`);
    });
}

module.exports = { registerCoupons };
