'use strict';

const http = require('http');
const https = require('https');

function request(baseUrl, method, path, token, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (payload) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function get(baseUrl, path, token) {
  return request(baseUrl, 'GET', path, token);
}

function post(baseUrl, path, token, body) {
  return request(baseUrl, 'POST', path, token, body);
}

function put(baseUrl, path, token, body) {
  return request(baseUrl, 'PUT', path, token, body);
}

module.exports = { get, post, put };
