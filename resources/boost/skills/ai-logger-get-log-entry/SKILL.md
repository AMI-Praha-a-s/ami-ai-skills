---
name: ai-logger-get-log-entry
description: "Fetch a single ai-logger log entry by its numeric id from the local ai-logger API. Use whenever the user references an ai-logger log entry id while debugging — e.g. \"log entry 1234\", \"log_entry #1234\", \"show me log 1234\", or pasting a bare numeric id in the context of this project's logs. Returns the full LogEntryResource payload (level, message, source, context, debug_data, etc.) so you can reason about the underlying error."
---

# ai-logger — fetch log entry by id

Calls `POST /api/get-log-entry-by-id` on the ai-logger backend and surfaces the payload to the user.

## When to use

- The user asks about an ai-logger log entry, referencing a numeric id.
- You are about to suggest a fix and need to read the entry's `message`, `context`, `debug_data`, or `performance_data` to ground the recommendation.

Do **not** use this skill for arbitrary HTTP debugging or for entries from other systems — it is specific to this project's ai-logger.

## Configuration

Two environment variables drive the call:

- `AI_LOGGER_BASE_URL` — defaults to `http://localhost:7144` (the local docker-compose nginx port).
- `AI_LOGGER_API_TOKEN` — a Sanctum personal access token for a user in the ai-logger app. Mint one in Filament under "Personal Access Tokens" (see `README.md` in this skill folder).

If `AI_LOGGER_API_TOKEN` is unset, stop and tell the user how to mint one before proceeding.

## How to call the endpoint

Run from the shell (the user's working directory does not matter):

```bash
curl -sS -X POST "${AI_LOGGER_BASE_URL:-http://localhost:7144}/api/get-log-entry-by-id" \
  -H "Authorization: Bearer $AI_LOGGER_API_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"id": <ID>}'
```

Replace `<ID>` with the integer id the user referenced.

## How to present the result

1. Parse the JSON response.
2. Lead with a one-line summary: `[<level>] <source.name> — <message>` (truncate the message to ~120 chars in the summary).
3. Then show the full `created_at`, `source`, `level`, `message`.
4. If `context`, `user_tracking_data`, `debug_data`, or `performance_data` are non-empty, render each as a fenced JSON block under a clear heading. If they are empty, omit them.
5. Do **not** dump the raw JSON wholesale — extract the meaningful fields.

## Error handling

- **401 Unauthorized**: the token is missing, wrong, or revoked. Tell the user to mint a new one at `${AI_LOGGER_BASE_URL}/admin` → Personal Access Tokens → Create, then export `AI_LOGGER_API_TOKEN` in their shell.
- **404 Not Found**: the id does not exist. State this plainly and ask whether they meant a different id (don't guess).
- **422 Unprocessable Entity**: the id was not an integer. Re-check what id the user actually said.
- **Connection refused / DNS failure**: the ai-logger app is not running. Suggest `docker compose up -d` from the repo root.

## Out of scope

This skill only fetches a single entry by id. For range queries, listing, or status updates, fall back to calling the other endpoints in `routes/api.php` directly — there is no skill wrapper for those yet.
