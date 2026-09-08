---
name: ai-agent-git-hygiene
description: "Use this skill when a project's .gitignore or .gitattributes needs AI-coding-agent rules -- Claude Code, Codex, OpenCode, Cursor, Laravel Boost, gem-team, Superset, design-sync, Playwright MCP. Triggers: 'ignore Claude files', 'should .mcp.json be committed', 'settings.local.json shows up in git status', 'CLAUDE.md is in our composer/GitLab tarball', 'port the AI ignore rules from <repo>', setting up a new AMI project, or auditing an existing one. Covers which AI paths are the shared (versioned) layer vs the personal (ignored) layer, the export-ignore set that keeps all AI config out of git archive, and how to verify by building a tarball. Do NOT use for general .gitignore hygiene unrelated to AI tooling, or for authoring the AI config files themselves (use create-ai-skill / create-ai-guideline)."
compatibility: "Requires a git working tree and the git + tar CLIs for the verification script."
---

# AI-Agent Git Hygiene

AI coding agents leave two kinds of files in a repository. The **shared layer** is project config every teammate should get on clone: skills, guidelines, MCP server lists, agent instructions. Each tool's documentation says to commit it. The **personal layer** is per-developer state: local permission overrides, auth tokens, session history, worktrees. It must be ignored. And regardless of layer, **none of it belongs in a distribution archive** -- `git archive`, `composer archive`, GitLab source tarballs -- so every AI path is `export-ignore`d in `.gitattributes`.

This skill applies the AMI convention established in pcr-prestavby and ported to automotive-leads and automotive-api. Apply it verbatim, then verify by building a tarball. Do not trust `git check-attr` or an existing `.gitignore` line.

## The Two Layers

| Layer | Paths | Action |
|-------|-------|--------|
| Shared (commit) | `.agents/`, `.ai/`, `.cursor/`, `.claude/settings.json`, `.mcp.json`, `opencode.json`, `opencode.jsonc`, `tui.json`, `tui.jsonc`, `.codex/config.toml`, `AGENTS.md`, `CLAUDE.md`, `boost.json`, `.gem-team.yaml`, `.superset/`, `.design-sync/` (except its machine state) | Tracked, and `export-ignore`d |
| Personal (ignore) | `**/.claude/settings.local.json`, `.claude/worktrees/`, `CLAUDE.local.md`, `AGENTS.override.md`, `**/.codex/auth.json`, `**/.codex/history.jsonl`, `**/.codex/sessions/`, `**/.codex/logs/`, `.playwright-mcp/` | `.gitignore`, and `export-ignore`d |
| Personal, design-sync only | `/.ds-sync`, `/ds-bundle`, `/.design-sync/.cache`, `/.design-sync/learnings`, `/.design-sync/node_modules` | `.gitignore` in a separate block, only when `.design-sync/` exists |

The shared/personal split follows the tools' own docs, not taste:

- Claude Code: "Check `.mcp.json` into version control so everyone on your team gets the same MCP tools and services." `settings.local.json` is the file the docs tell you to gitignore yourself.
- OpenCode: `opencode.json` "is also safe to be checked into Git." There is no `opencode.local.json`; that is an open upstream feature request.
- The `.agents` protocol defines the project directory as "plain, version-controllable files" with `agents.md` marked "Commit to git for team config". The personal layer is the global `~/.agents/`, not the project one.
- Codex: `AGENTS.override.md` is its documented local-override mechanism; `auth.json`, `history.jsonl`, `sessions/`, `logs/` are per-user state.

## Step-by-Step

1. **Inventory what the repo does today.** Run from the repo root:

   ```bash
   git ls-files | grep -E '(^|/)(\.agents|\.ai|\.claude|\.codex|\.cursor|\.opencode|\.design-sync|\.superset)/|(^|/)(\.mcp\.json|opencode\.jsonc?|tui\.jsonc?|AGENTS\.md|CLAUDE\.md|boost\.json|\.gem-team\.yaml)$'
   git status --porcelain --ignored | grep -E '\.(claude|codex|agents|ai|cursor|opencode)|CLAUDE|AGENTS|mcp|opencode|boost'
   grep -nE 'agents|claude|codex|cursor|opencode|mcp|AGENTS|CLAUDE|boost' .gitignore .gitattributes
   ```

   For every AI line already in `.gitignore`, run `git log -S'<line>' --oneline -- .gitignore` before trusting it. In pcr-prestavby the lines `/.mcp.json`, `/.agents`, `/opencode.json` had been added incidentally in a Vite migration commit and then copied to sibling repos as if they were a convention.

2. **Fix inverted rules.** If `.gitignore` ignores a shared-layer path, delete that line. If the now-unignored file exists and holds no secrets (an `mcp_config.json` with bare command names is fine; anything with a token is not), `git add` it. If it holds a secret, stop and tell the user -- that file needs to move to the personal layer or use env-var references.

3. **Append the `.gitignore` block** from [assets/gitignore-block.txt](assets/gitignore-block.txt) verbatim, including its three comment lines, after the editor/IDE block. If the repo has `.design-sync/`, keep its machine-state paths in their own commented block below, as automotive-api does.

4. **Append the `.gitattributes` block** from [assets/gitattributes-block.txt](assets/gitattributes-block.txt) after the existing `export-ignore` lines. Keep the existing ones (`CHANGELOG.md`, `/.github`, `.styleci.yml`, ...) untouched.

5. **Decide repo-specific extras.** Anything from the inventory in step 1 that is AI-only and not in the canonical block gets two lines: `path export-ignore` and `path/** export-ignore`. Known cases:
   - `docs/plan` + `docs/plan/**`: only when `docs/plan` holds AI planning artifacts (pcr-prestavby yes; automotive-leads no -- its `docs/` holds hand-written feature docs tied to Jira tickets). Read a couple of files before deciding.
   - `.superset/`, `.gem-team.yaml`, `boost.json` are already in the canonical block; they are harmless when absent.

6. **Stage both files, then verify.** Run the bundled script from the target repo root:

   ```bash
   git add .gitignore .gitattributes
   bash {path-to-this-skill}/scripts/verify-ai-export.sh
   ```

   It exits 0 only when the archive built from the index has zero AI paths, `app/` (or `src/`) kept every entry, every personal path resolves to this repo's `.gitignore`, and no tracked file became ignored. Fix and re-run until it passes.

7. **Commit with the evidence.** The commit message states which repo/commit it mirrors, lists the personal paths added and why they were unprotected before, lists extras beyond the canonical set with the reason, and pastes the verification numbers (archive entries before/after, AI entries before/after, `app/` entries kept). Example: "0 AI paths in the tarball (319 of 717 entries before), all 92 app/ paths still exported, git check-ignore resolves every personal path to this .gitignore, and no tracked file became ignored."

## Canonical Blocks

Copy these exactly. They are the union of the three AMI ports and are also shipped as files under `assets/`.

`.gitignore`:

```gitignore
# AI agents — personal layer only. The shared layer is versioned per each tool's
# docs: .agents/, .ai/, .cursor/, .mcp.json, opencode.json, .codex/config.toml,
# .claude/settings.json, AGENTS.md, CLAUDE.md.
**/.claude/settings.local.json
.claude/worktrees/
CLAUDE.local.md
AGENTS.override.md
**/.codex/auth.json
**/.codex/history.jsonl
**/.codex/sessions/
**/.codex/logs/
.playwright-mcp/
```

`.gitattributes`:

```gitattributes
.agents export-ignore
.agents/** export-ignore
.ai export-ignore
.ai/** export-ignore
.claude export-ignore
.claude/** export-ignore
.codex export-ignore
.codex/** export-ignore
.cursor export-ignore
.cursor/** export-ignore
.opencode export-ignore
.opencode/** export-ignore
.design-sync export-ignore
.design-sync/** export-ignore
.superset export-ignore
.superset/** export-ignore
.mcp.json export-ignore
opencode.json export-ignore
opencode.jsonc export-ignore
tui.json export-ignore
tui.jsonc export-ignore
AGENTS.md export-ignore
AGENTS.override.md export-ignore
CLAUDE.md export-ignore
CLAUDE.local.md export-ignore
.gem-team.yaml export-ignore
boost.json export-ignore
```

## Gotchas

- **Both `path` and `path/**` are required for a directory.** The bare path alone still exports the files inside. `path/**` alone exports an empty directory entry. `path/` with a trailing slash is not a valid attribute pattern for this purpose.
- **`**/` is required for nested files.** A gitignore pattern with a slash in the middle is anchored to the repo root, so `.claude/settings.local.json` alone misses `packages/foo/.claude/settings.local.json`.
- **`git check-attr` is not verification.** pcr-prestavby's first pass passed `check-attr` and still shipped `opencode.jsonc`, `tui.json` and `docs/plan/` in the tarball. Only `git archive | tar -t` on the staged tree is proof.
- **`git archive HEAD` tests the old attributes.** Use `git archive $(git write-tree)` so staged, uncommitted `.gitattributes` edits are honoured. The script does this.
- **Global ignores hide the problem locally.** `~/.config/git/ignore` and `.git/info/exclude` make `settings.local.json` disappear from your `git status` while a teammate's clone has no protection at all. `git check-ignore -v` must report `.gitignore:<line>` as the source, not a path under `$HOME`.
- **A root `auth.json` line is Composer's, not Codex's.** It happens to match `.codex/auth.json` today; add the explicit `**/.codex/auth.json` anyway.
- **`.agents/` is shared, not personal.** Six of eight AMI repos track it; automotive-leads tracks dozens of authored skills there. Ignoring it throws away team config.
- **Do not add `opencode.local.json`.** OpenCode has not shipped it.
- **`boost.json`, `CLAUDE.md`, `AGENTS.md` are regenerated by Laravel Boost but committed in AMI repos.** The `create-ai-guideline` skill notes they are safe to ignore; AMI's choice is to keep them tracked so agents work on a fresh clone without running Boost. Follow the target repo's existing choice and `export-ignore` them either way.
- **Existing `.gitignore` lines are not a convention.** Check `git log -S` before preserving one.

## Verification

After staging both files, run `scripts/verify-ai-export.sh` (see step 6). Its manual equivalents, if the script is unavailable:

1. `git archive $(git write-tree) | tar -t | grep -E '(^|/)(\.agents|\.ai|\.claude|\.codex|\.cursor|\.opencode|\.design-sync|\.superset)(/|$)|(^|/)(\.mcp\.json|opencode\.jsonc?|tui\.jsonc?|AGENTS\.md|AGENTS\.override\.md|CLAUDE\.md|CLAUDE\.local\.md|\.gem-team\.yaml|boost\.json)$'` prints nothing.
2. `git archive HEAD | tar -t | grep -c '^app/'` equals the same count on `$(git write-tree)`; total entry counts before and after are reported in the commit message.
3. `git check-ignore -v --no-index .claude/settings.local.json CLAUDE.local.md AGENTS.override.md .codex/auth.json` reports `.gitignore:<line>` for each, not a `$HOME` path.
4. `git ls-files -ci --exclude-standard` prints nothing.
5. `git status --porcelain --ignored` shows the personal files as `!!` (ignored), not `??` (untracked).

## Common Pitfalls

- Do not ignore the shared layer (`.agents/`, `.mcp.json`, `opencode.json`, `.ai/`, `.cursor/`) -- the tools document it as check-in config.
- Do not `export-ignore` a directory with only `path/**` or only `path`; list both lines.
- Do not skip building the tarball; `check-attr` and reading the patterns are not enough.
- Do not port `docs/plan` blindly; it is an AI artifact in pcr-prestavby and hand-written docs in automotive-leads.
- Do not fix a teammate's `git status` noise by editing `.git/info/exclude`; the rule belongs in the repo's `.gitignore`.
- Do not rewrite the target repo's existing `.gitignore` or `.gitattributes`; append the blocks and remove only the inverted AI lines.
