'use strict';

const { get, post } = require('../api');
const { getBaseUrl } = require('../config');
const { table, ok, err, requireToken } = require('../output');

const COMMENT_COLS = [
  { key: 'id', label: 'ID' },
  { key: 'isDeleted', label: 'Del' },
  { key: 'userDisplayName', label: 'User', maxWidth: 20 },
  { key: 'userEmail', label: 'Email', maxWidth: 30 },
  { key: 'verseTitle', label: 'Verse', maxWidth: 25 },
  { key: 'content', label: 'Content', maxWidth: 50 },
];

function registerComments(program) {
  const cmd = program.command('comments').description('Comment management');

  cmd
    .command('list')
    .description('List recent comments')
    .option('-l, --limit <n>', 'limit (max 100)', '30')
    .option('-p, --page <n>', 'page', '1')
    .option('-f, --filter <status>', 'all|active|deleted')
    .action(async function () {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      let qs = `limit=${opts.limit}&page=${opts.page}`;
      if (opts.filter) qs += `&filter=${opts.filter}`;
      const res = await get(base, `/v1/admin/comments?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      const rows = (res.data.comments || []).map((c) => ({
        ...c,
        isDeleted: c.isDeleted ? 'Y' : '',
      }));
      table(rows, COMMENT_COLS);
      if (res.data.total) console.log(`total: ${res.data.total} (page ${res.data.page}/${res.data.totalPages})`);
    });

  cmd
    .command('search')
    .description('Search comments')
    .requiredOption('--by <type>', 'searchType: userEmail|userDisplayName|verseTitle|verseShortId|commentContent')
    .argument('<keyword>', 'search keyword')
    .option('-l, --limit <n>', 'limit', '100')
    .option('-p, --page <n>', 'page', '1')
    .option('-f, --filter <status>', 'all|active|deleted')
    .action(async function (keyword) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      let qs = `searchType=${opts.by}&keyword=${encodeURIComponent(keyword)}&limit=${opts.limit}&page=${opts.page}`;
      if (opts.filter) qs += `&filter=${opts.filter}`;
      const res = await get(base, `/v1/admin/comments?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      const rows = (res.data.comments || []).map((c) => ({
        ...c,
        isDeleted: c.isDeleted ? 'Y' : '',
      }));
      table(rows, COMMENT_COLS);
      if (res.data.total) console.log(`total: ${res.data.total}`);
    });

  cmd
    .command('delete <ids...>')
    .description('Delete comments by ID')
    .action(async function (ids) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const commentIds = ids.map(Number);
      const res = await post(base, '/v1/admin/comments/batch-action', config.token, {
        commentIds,
        action: 'delete',
      });
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      ok(`Deleted ${res.data.processed} comment(s) (${res.data.failed} failed)`);
    });

  cmd
    .command('restore <ids...>')
    .description('Restore deleted comments by ID')
    .action(async function (ids) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const commentIds = ids.map(Number);
      const res = await post(base, '/v1/admin/comments/batch-action', config.token, {
        commentIds,
        action: 'restore',
      });
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      ok(`Restored ${res.data.processed} comment(s) (${res.data.failed} failed)`);
    });
}

module.exports = { registerComments };
