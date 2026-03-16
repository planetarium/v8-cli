# v8-cli

Token-optimized CLI for V8 platform admin API. ~82% fewer tokens compared to raw API calls when used with Claude Code.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/planetarium/v8-cli/main/install.sh | bash
```

Or manually:

```bash
git clone https://github.com/planetarium/v8-cli.git ~/.v8-cli
cd ~/.v8-cli && npm install && npm link
```

## Setup

```bash
v8 config set-env local    # local | test
v8 config set-token <jwt>  # admin JWT
v8 auth                    # verify
```

## Commands

```
v8 auth                                   Verify token
v8 users search <keyword>                 Search users
v8 users low-balance [--threshold N]      Low balance users
v8 users set-seller <uid> true|false      Set seller status
v8 credits give <uid> <usd>              Give credits
v8 credits balance <keyword>              Check balance
v8 coupons generate <usd> <count>         Generate coupons
v8 comments list [--limit N] [--filter]   List comments
v8 comments search --by <type> <keyword>  Search comments
v8 comments delete <id...>                Delete comments
v8 comments restore <id...>               Restore comments
v8 verses list [--limit N] [--featured]   List verses
v8 verses search <keyword>                Search verses
v8 verses get <id>                        Get verse detail
v8 verses update <id> [--featured true]   Update verse
```

Add `--json` for raw JSON output.

## Claude Code Skill

The installer automatically links the skill to `~/.claude/skills/v8-admin`. This teaches Claude Code to use `v8` commands instead of raw HTTP calls.

## License

Apache-2.0
