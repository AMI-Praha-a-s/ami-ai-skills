# Changelog

All notable changes to `ami-ai-skills` will be documented in this file.

## v0.0.4 - 2026-09-08

## New skill: `ai-agent-git-hygiene`

Encodes the AMI convention for AI-coding-agent files in git, previously ported by hand across pcr-prestavby, automotive-leads and automotive-api:

- The **shared layer** (`.agents/`, `.ai/`, `.cursor/`, `.mcp.json`, `opencode.json`, `.claude/settings.json`, `AGENTS.md`, `CLAUDE.md`, ...) stays versioned, per each tool's docs.
- The **personal layer** (`settings.local.json`, `CLAUDE.local.md`, `AGENTS.override.md`, Codex auth/history/sessions/logs, `.claude/worktrees/`, `.playwright-mcp/`) is gitignored.
- Every AI config path is `export-ignore`d so it stays out of `git archive`, Composer and GitLab source tarballs.

Ships with:

- `assets/gitignore-block.txt` and `assets/gitattributes-block.txt` -- the canonical blocks to append verbatim.
- `scripts/verify-ai-export.sh` -- builds the archive from the staged index, counts AI and `app/` entries before/after, checks each personal path resolves to the repo's own `.gitignore`, and fails if a tracked file became ignored.
- A Gotchas section sourced from the original commits (bare path plus `path/**`, root-anchored patterns, `git check-attr` is not verification, global ignores hide the problem locally).

## Docs

- README "Included Skills" table now lists all six skills, adding the previously missing `ai-logger-get-log-entry` and `grill-with-docs` rows.

## Upgrade

```bash
composer update ami-praha-a-s/ami-ai-skills
php artisan boost:update --discover
```
