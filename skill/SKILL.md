---
name: v8-admin
description: >
  V8 platform admin operations via v8-cli. Use when asked to manage users,
  grant or query credits, manage verses, game payments, coupons, analytics,
  or comments. Triggers on requests like "give credits to user", "search user",
  "set verse featured", "generate coupons", "find spam comments".
license: Apache-2.0
metadata:
  author: swen
  version: "0.2"
compatibility: Requires v8-cli installed and configured
---

# V8 Admin Skill

## Setup

1. **v8-cli must be installed**. Verify with `v8 --version`.
   - If not installed: `gh repo clone planetarium/v8-cli /tmp/v8-cli && cd /tmp/v8-cli && npm install && npm link`
2. **Configuration** — check with `v8 config show`.
   - If env not set: `v8 config set-env local` (or `test`)
   - If token not set: ask user to provide admin JWT, then `v8 config set-token <jwt>`

## How to call

Always use `v8` CLI commands via Bash tool. Do NOT make raw HTTP calls.

## Command Reference

### Auth
```bash
v8 auth                              # verify token, show uid/role
```

### Users
```bash
v8 users search <keyword>            # search by email/name/handle
v8 users low-balance                  # list low-balance users
v8 users set-seller <uid> true|false
```

### Credits
```bash
v8 credits give <uid> <amount-usd>   # give credits (amount in USD)
v8 credits balance <keyword>          # check balance by email/name
```

### Coupons
```bash
v8 coupons generate <amount-usd> <count>
```

### Comments
```bash
v8 comments list [--limit N] [--filter all|active|deleted]
v8 comments search --by <type> <keyword> [--filter all|active|deleted]
v8 comments delete <id...>
v8 comments restore <id...>
```
`searchType` values: `userEmail`, `userDisplayName`, `verseTitle`, `verseShortId`, `commentContent`

### Verses
```bash
v8 verses list [--limit N] [--featured]
v8 verses search <keyword>
v8 verses get <verseId|shortId>
v8 verses update <verseId> [--featured true] [--showcase true] [--hidden true] [--visibility public]
```

### JSON mode
Append `--json` before the subcommand for raw JSON output:
```bash
v8 --json comments list --limit 5
```

## Common Workflows

### Search user + grant credits
1. `v8 users search <email>` → get uid
2. `v8 credits give <uid> 20`
3. `v8 credits balance <email>` → verify

### Find and remove spam comments
1. `v8 comments list --limit 50` → scan for suspicious patterns
2. `v8 comments search --by userEmail <email> --filter all` → get all by suspect
3. `v8 comments delete <id1> <id2> <id3>` → bulk delete

## Local Workflows

If `~/.v8-cli/local/workflows.md` exists, read it for additional user-defined workflows. This file is not managed by the skill and survives upgrades.

To propose a new workflow for the shared CLI, run:
`gh issue create --repo planetarium/v8-cli --title "workflow: <description>"`

## API Reference

See `references/admin-api.md` for full endpoint details (useful when CLI doesn't cover an edge case).

## Notes

- Credit amounts in `credits give` are in USD (e.g. `20` = $20)
- Comment search requires `--by` and keyword together
- `--json` flag outputs raw API response for piping or debugging
