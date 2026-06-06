# ai-logger-get-log-entry skill — setup

A Claude Code skill that lets agents fetch a single ai-logger `log_entries` row by id.

## One-time setup

1. **Start the app locally.**

   ```bash
   docker compose up -d
   ```

   The API is then reachable at `http://localhost:7144`.

2. **Mint a Sanctum personal access token.**

   - Log into Filament at `http://localhost:7144/admin`.
   - Open **Personal Access Tokens** in the sidebar.
   - Click **Create**, give it a name (e.g. `claude-code`), optionally set `Expires at`.
   - The plaintext token is shown **once** in the success notification — copy it immediately.

3. **Export the token (and optionally the base URL) in your shell.**

   ```bash
   export AI_LOGGER_API_TOKEN='paste-the-plaintext-token-here'
   # Optional — only needed if the app runs on a non-default host/port.
   export AI_LOGGER_BASE_URL='http://localhost:7144'
   ```

   Add the exports to `~/.zshrc` / `~/.bashrc` to make them persistent for your Claude Code sessions.

## Verifying the skill

In a Claude Code session inside this repo, ask:

> show me ai-logger log entry 1

Claude should invoke this skill, run the curl call, and surface the entry. To verify the error paths:

- Use an id you know doesn't exist → expect a 404 message.
- Revoke the token in Filament and re-run → expect a 401 message and instructions to re-mint.

## What it returns

Whatever [`LogEntryResource`](../../../app/Http/Resources/LogEntryResource.php) serializes — currently:

```
id, source, level, created_at, message, context,
user_tracking_data, debug_data, performance_data
```

If new fields are added to the resource, the skill picks them up automatically — no skill change needed.

## Endpoint reference

- Route: `POST /api/get-log-entry-by-id` (see [routes/api.php](../../../routes/api.php))
- Controller: [`App\Http\Controllers\Api\GetController@getLogEntryById`](../../../app/Http/Controllers/Api/GetController.php)
- Auth: `auth:sanctum` (Bearer token in `Authorization` header)
- Body: `{"id": <integer>}`
