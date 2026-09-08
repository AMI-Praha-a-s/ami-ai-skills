#!/usr/bin/env bash
#
# verify-ai-export.sh -- prove that AI-agent config stays out of `git archive`
# and that the personal-layer ignore rules resolve to the repo's own .gitignore.
#
# Usage: verify-ai-export.sh [repo-root] [--before <ref>]
#
#   repo-root   Repository to check. Defaults to the current directory.
#   --before    Ref whose archive is the "before" baseline. Defaults to HEAD.
#               The "after" archive is built from the current index
#               (git write-tree), so staged-but-uncommitted .gitattributes and
#               .gitignore edits are exactly what gets verified. Stage them first.
#
# Checks:
#   1. No AI-agent path is present in the archive built from the index.
#   2. No app/ (or src/) path was lost between the baseline and the index.
#   3. Every canonical personal-layer path is ignored, and the matching rule
#      lives in this repository's .gitignore -- not in ~/.config/git/ignore or
#      .git/info/exclude, which a teammate's clone does not have.
#   4. No tracked file became ignored (git ls-files -ci --exclude-standard).
#
# Exit code 0 when all checks pass, 1 otherwise. Report goes to stdout,
# warnings to stderr. Read-only apart from a temp directory and the tree
# object that git write-tree adds to .git/objects (unreachable, gc'd later).

set -euo pipefail

repo_root="."
before_ref="HEAD"

while [ $# -gt 0 ]; do
  case "$1" in
    --before)
      [ $# -ge 2 ] || { echo "--before needs a ref" >&2; exit 2; }
      before_ref="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)
      echo "unknown option: $1" >&2; exit 2 ;;
    *)
      repo_root="$1"; shift ;;
  esac
done

cd "$repo_root"
git rev-parse --show-toplevel >/dev/null 2>&1 || { echo "not a git repository: $repo_root" >&2; exit 2; }
cd "$(git rev-parse --show-toplevel)"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

warn() { printf '[verify-ai-export] %s\n' "$*" >&2; }

# Single source of truth for what counts as an AI-agent path. Mirrors
# ../assets/gitattributes-block.txt. Directories at any depth, files at any depth.
ai_regex='(^|/)(\.agents|\.ai|\.claude|\.codex|\.cursor|\.opencode|\.design-sync|\.superset)(/|$)|(^|/)(\.mcp\.json|opencode\.jsonc?|tui\.jsonc?|AGENTS\.md|AGENTS\.override\.md|CLAUDE\.md|CLAUDE\.local\.md|\.gem-team\.yaml|boost\.json)$'

# Canonical personal-layer paths. Mirrors ../assets/gitignore-block.txt.
# Directory rules are probed with a file inside them, at root and nested.
personal_paths=(
  .claude/settings.local.json
  nested/dir/.claude/settings.local.json
  .claude/worktrees/some-branch/README.md
  CLAUDE.local.md
  AGENTS.override.md
  .codex/auth.json
  nested/dir/.codex/auth.json
  .codex/history.jsonl
  .codex/sessions/2026/session.jsonl
  .codex/logs/codex.log
  .playwright-mcp/trace.zip
)

failures=0
fail() { printf 'FAIL  %s\n' "$*"; failures=$((failures + 1)); }
ok()   { printf 'ok    %s\n' "$*"; }

count() { grep -E -c -- "$1" "$2" || true; }

# ---- 1 + 2: archives ------------------------------------------------------------

after_tree="$(git write-tree)"
git archive --format=tar "$after_tree" | tar -tf - > "$tmp/after.txt"

have_before=1
if git rev-parse --verify --quiet "${before_ref}^{tree}" >/dev/null; then
  git archive --format=tar "$before_ref" | tar -tf - > "$tmp/before.txt"
else
  have_before=0
  warn "cannot resolve --before ref '$before_ref'; skipping the baseline comparison"
  : > "$tmp/before.txt"
fi

code_prefix=""
if git ls-files --error-unmatch app >/dev/null 2>&1; then
  code_prefix="app/"
elif git ls-files --error-unmatch src >/dev/null 2>&1; then
  code_prefix="src/"
fi

total_before="$(wc -l < "$tmp/before.txt" | tr -d ' ')"
total_after="$(wc -l < "$tmp/after.txt" | tr -d ' ')"
ai_before="$(count "$ai_regex" "$tmp/before.txt")"
ai_after="$(count "$ai_regex" "$tmp/after.txt")"

printf 'Archive entries      before: %-6s after: %s\n' "$total_before" "$total_after"
printf 'AI-agent entries     before: %-6s after: %s\n' "$ai_before" "$ai_after"

if [ -n "$code_prefix" ]; then
  code_before="$(count "^${code_prefix}" "$tmp/before.txt")"
  code_after="$(count "^${code_prefix}" "$tmp/after.txt")"
  printf '%-20s before: %-6s after: %s\n' "${code_prefix} entries" "$code_before" "$code_after"
else
  warn "no app/ or src/ directory tracked; skipping the code-path count"
fi
echo

if [ "$ai_after" -eq 0 ]; then
  ok "no AI-agent path in the archive built from the index"
else
  fail "$ai_after AI-agent path(s) still exported:"
  grep -E -- "$ai_regex" "$tmp/after.txt" | sed 's/^/        /'
fi

if [ "$have_before" -eq 1 ] && [ -n "$code_prefix" ]; then
  if [ "$code_after" -ge "$code_before" ]; then
    ok "${code_prefix} entries preserved ($code_after)"
  else
    fail "${code_prefix} entries dropped from $code_before to $code_after -- an export-ignore pattern is too broad"
    comm -23 <(sort "$tmp/before.txt") <(sort "$tmp/after.txt") | grep -E "^${code_prefix}" | head -20 | sed 's/^/        /'
  fi
fi

# ---- 3: personal layer resolves to this repo's .gitignore -----------------------

for p in "${personal_paths[@]}"; do
  if out="$(git check-ignore -v --no-index -- "$p" 2>/dev/null)"; then
    source="${out%%:*}"
    if [ "$source" = ".gitignore" ]; then
      ok "ignored by .gitignore: $p  (${out%%	*})"
    else
      fail "$p is ignored only by '$source' -- a teammate's clone has no such rule"
    fi
  else
    fail "$p is NOT ignored"
  fi
done

# ---- 4: no tracked file became ignored ------------------------------------------

if newly_ignored="$(git ls-files -ci --exclude-standard)" && [ -n "$newly_ignored" ]; then
  fail "tracked file(s) now match an ignore rule:"
  printf '%s\n' "$newly_ignored" | sed 's/^/        /'
else
  ok "no tracked file is matched by an ignore rule"
fi

echo
if [ "$failures" -eq 0 ]; then
  echo "PASS: all checks passed"
  exit 0
fi
echo "FAIL: $failures check(s) failed"
exit 1
