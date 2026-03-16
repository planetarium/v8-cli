# v8-cli

Token-optimized CLI wrapping V8 platform admin API.

## Dev setup

```bash
npm install && npm link   # registers `v8` command
v8 config set-env local
v8 config set-token <admin-jwt>
```

## Testing

No automated tests. Manual verification against live API server (g2-sync on localhost:3003).
See `test/integration.md` for the checklist.

## Release

Push a `v*` tag → GitHub Actions builds tarball + creates GitHub Release automatically.

```bash
# bump version in package.json first
git tag v0.2.0 && git push origin v0.2.0
```

## Gotchas

- API response shapes vary by endpoint: `items`, `verses`, `comments` — always check with `--json` first when adding new commands
- `searchType` and `keyword` must be used together in comments API, otherwise 400
- `local/` dir is gitignored — for personal workflow overrides, not checked in
