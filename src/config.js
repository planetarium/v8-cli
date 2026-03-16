'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME || '', '.config', 'v8-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const ENVS = {
  test: 'https://v8api.tests.mothership-pla.net',
  local: 'http://localhost:3003',
};

function loadConfig() {
  const defaults = { env: 'test', token: null, baseUrl: null };
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return { ...defaults, ...data };
  } catch {
    return defaults;
  }
}

function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

function getBaseUrl(config) {
  if (config.baseUrl) return config.baseUrl;
  return ENVS[config.env] || ENVS.test;
}

module.exports = { loadConfig, saveConfig, getBaseUrl, CONFIG_FILE };
