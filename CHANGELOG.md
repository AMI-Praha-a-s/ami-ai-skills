# Changelog

All notable changes to `ami-ai-skills` will be documented in this file.

## v0.1.0 - 2026-11-11

### `ai-agent-git-hygiene`: `.destherai/` joins the personal layer, both desther folders are export-ignored

`.destherai/` holds the same per-developer agent-runner config as `.destheraif/`: a `config.json` with setup, run, checks and format commands, sometimes with helper scripts. It is not team config, so it is now gitignored too:

- Added to the canonical `.gitignore` block (`assets/gitignore-block.txt` and the inline copy in `SKILL.md`), the personal-layer table and the step 1 inventory commands.
- `.destherai` and `.destheraif` (bare path + `/**`) are added to the canonical `.gitattributes` block. pcr-prestavby, adpcr-web, custody-shield and fis-skladovky already commit `.destherai/`. These lines keep those copies out of `git archive`, Composer and GitLab tarballs until the folder is untracked.
- `scripts/verify-ai-export.sh` counts both folders as AI paths in its archive check. It also checks that `.destherai/config.json` is ignored by the repo's own `.gitignore`.

#### Untracking needs the user's OK

Gitignoring a folder that is already committed does not untrack it, so the verify script's "tracked file(s) now match an ignore rule" check fails. The skill now tells the agent not to run `git rm -r --cached` on its own. It must ask first and explain the effect: the files stay in the current clone, but they are deleted from every other clone once that commit is pulled. The script's failure message repeats this.

If a repo already applied the blocks, append `.destherai/` to its AI-agents `.gitignore` section and the four new `export-ignore` lines to `.gitattributes`.

### Upgrade

This is a minor bump, and a `^0.0.x` constraint stays on that exact patch. Require the new range instead of running `composer update`:

```bash
composer require --dev ami-praha-a-s/ami-ai-skills:^0.1
php artisan boost:update --discover

```
## v0.0.5 - 2026-10-16

### `ai-agent-git-hygiene`: `.destheraif/` joins the personal layer

`.destheraif/config.json` holds one developer's agent-runner commands (worktree setup, checks, format). It is per-developer state, not team config, so it is now gitignored:

- Added to the canonical `.gitignore` block (`assets/gitignore-block.txt` and the inline copy in `SKILL.md`) and to the personal-layer table.
- `scripts/verify-ai-export.sh` now also checks that `.destheraif/config.json` is ignored by the repo's own `.gitignore`.
- Like `.playwright-mcp/`, it is gitignored only. An ignored path is never tracked, so it needs no `export-ignore` line.

Repos that already applied the block can append `.destheraif/` to their AI-agents `.gitignore` section.

### Upgrade

```bash
composer update ami-praha-a-s/ami-ai-skills
php artisan boost:update --discover


```
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