'use strict';

const { get, post } = require('../api');
const { getBaseUrl } = require('../config');
const { table, ok, err, requireToken } = require('../output');

const VERSE_COLS = [
  { key: 'verseId', label: 'ID', maxWidth: 25 },
  { key: 'verseShortId', label: 'ShortID' },
  { key: 'title', label: 'Title', maxWidth: 30 },
  { key: 'visibility', label: 'Vis' },
  { key: 'featured', label: 'Feat' },
  { key: 'showcase', label: 'Show' },
  { key: 'createdDate', label: 'Created' },
];

function extractVerses(data) {
  const rows = data.items || data.verses || (Array.isArray(data) ? data : []);
  return rows.map((v) => ({
    ...v,
    createdDate: v.createdAt ? v.createdAt.slice(0, 10) : '',
  }));
}

function registerVerses(program) {
  const cmd = program.command('verses').description('Verse management');

  cmd
    .command('list')
    .description('List verses')
    .option('-l, --limit <n>', 'limit', '20')
    .option('-p, --page <n>', 'page', '1')
    .option('--featured', 'featured only')
    .action(async function () {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      let qs = `limit=${opts.limit}&page=${opts.page}`;
      if (opts.featured) qs += '&featured=true';
      const res = await get(base, `/v1/admin/verse?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      table(extractVerses(res.data), VERSE_COLS);
    });

  cmd
    .command('search <keyword>')
    .description('Search verses by keyword')
    .option('-l, --limit <n>', 'limit', '20')
    .action(async function (keyword) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      const qs = `keyword=${encodeURIComponent(keyword)}&limit=${opts.limit}`;
      const res = await get(base, `/v1/admin/verse/search?${qs}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      table(extractVerses(res.data), VERSE_COLS);
    });

  cmd
    .command('get <verseId>')
    .description('Get verse by ID or shortId')
    .action(async function (verseId) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const base = getBaseUrl(config);
      const res = await get(base, `/v1/admin/verse/${encodeURIComponent(verseId)}`, config.token);
      if (res.status !== 200) return err(`${res.status}: ${res.data.message || 'failed'}`);
      if (this.parent.parent.opts().json) return console.log(JSON.stringify(res.data));
      const v = res.data;
      console.log(`id:            ${v.verseId}`);
      console.log(`shortId:       ${v.verseShortId || v.shortId}`);
      console.log(`title:         ${v.title}`);
      console.log(`description:   ${v.description || ''}`);
      console.log(`shortDesc:     ${v.shortDescription || ''}`);
      console.log(`category:      ${v.category || ''}`);
      console.log(`tags:          ${(v.tag || []).join(', ')}`);
      console.log(`visibility:    ${v.visibility}`);
      console.log(`featured:      ${v.featured}`);
      console.log(`showcase:      ${v.showcase}`);
      console.log(`mobileFeatured:${v.mobileFeatured}`);
      console.log(`allowRemix:    ${v.allowRemix}`);
      console.log(`mobileSupport: ${v.isMobileSupported}`);
      console.log(`imageUrl:      ${v.imageUrl || ''}`);
      console.log(`coverImageUrl: ${v.coverImageUrl || ''}`);
      console.log(`videoUrl:      ${v.videoUrl || ''}`);
      console.log(`creator:       ${v.creatorName || v.creatorHandle || 'n/a'}`);
      console.log(`created:       ${v.createdAt ? v.createdAt.slice(0, 10) : 'n/a'}`);
    });

  cmd
    .command('update <verseId>')
    .description('Update verse admin fields')
    .option('--featured <bool>', 'set featured')
    .option('--showcase <bool>', 'set showcase')
    .option('--mobile-featured <bool>', 'set mobile featured')
    .option('--hidden <bool>', 'hide from recommendations')
    .option('--visibility <v>', 'public|unlisted|private')
    .option('--title <text>', 'set verse title')
    .option('--description <text>', 'set verse description')
    .option('--short-description <text>', 'set verse short description')
    .option('--category <text>', 'set verse category')
    .option('--tags <tags>', 'set verse tags (comma-separated)')
    .option('--allow-remix <bool>', 'allow remix')
    .option('--mobile-supported <bool>', 'set mobile supported')
    .option('--image-url <url>', 'set thumbnail image URL')
    .option('--cover-image-url <url>', 'set cover image URL')
    .option('--video-url <url>', 'set video URL')
    .action(async function (verseId) {
      const config = this.parent.parent._v8config;
      requireToken(config);
      const opts = this.opts();
      const base = getBaseUrl(config);
      const body = {};
      if (opts.featured !== undefined) body.featured = opts.featured === 'true';
      if (opts.showcase !== undefined) body.showcase = opts.showcase === 'true';
      if (opts.mobileFeatured !== undefined) body.mobileFeatured = opts.mobileFeatured === 'true';
      if (opts.hidden !== undefined) body.isHiddenFromRecommendation = opts.hidden === 'true';
      if (opts.visibility) body.visibility = opts.visibility;
      if (opts.title !== undefined) body.title = opts.title;
      if (opts.description !== undefined) body.description = opts.description;
      if (opts.shortDescription !== undefined) body.shortDescription = opts.shortDescription;
      if (opts.category !== undefined) body.category = opts.category;
      if (opts.tags !== undefined) body.tag = opts.tags.split(',').map((t) => t.trim());
      if (opts.allowRemix !== undefined) body.allowRemix = opts.allowRemix === 'true';
      if (opts.mobileSupported !== undefined) body.isMobileSupported = opts.mobileSupported === 'true';
      if (opts.imageUrl !== undefined) body.imageUrl = opts.imageUrl;
      if (opts.coverImageUrl !== undefined) body.coverImageUrl = opts.coverImageUrl;
      if (opts.videoUrl !== undefined) body.videoUrl = opts.videoUrl;
      if (Object.keys(body).length === 0) return err('No fields to update. Use --help to see available options.');
      const res = await post(base, `/v1/admin/verse/${encodeURIComponent(verseId)}`, config.token, body);
      if (res.status !== 200 && res.status !== 201) return err(`${res.status}: ${res.data.message || 'failed'}`);
      ok(`Verse ${verseId} updated: ${JSON.stringify(body)}`);
    });
}

module.exports = { registerVerses };
