# Effective Instruction Patterns

This reference provides full worked examples for each instruction pattern described in the main SKILL.md. All examples use PHP/Laravel to stay consistent with the project context.

## Gotchas Sections

The highest-value content in many skills. Document environment-specific facts that defy reasonable assumptions -- not general advice ("handle errors"), but concrete corrections to mistakes the agent will make without being told.

### Full example: e-commerce platform gotchas

```markdown
## Gotchas

- The `users` table uses soft deletes. Queries must use the `SoftDeletes`
  trait or explicitly add `whereNull('deleted_at')`. The `email` unique
  index is scoped to non-deleted rows only.
- The `orders.total` column stores cents as an integer, not dollars as a
  float. Divide by 100 for display (`$order->total / 100`), multiply by
  100 before saving. Never use floating-point arithmetic for money.
- The `products.slug` column is unique per tenant, not globally. Uniqueness
  validation must include `where('tenant_id', $tenant->id)`.
- The `email` column in `users` is case-insensitive in the app layer but
  case-sensitive in the database index. Always normalize with `strtolower()`
  before queries and inserts.
- The `created_at` column uses UTC in the database. The app timezone is
  `America/New_York`. Use `->setTimezone(config('app.timezone'))` for
  display, never store local times.
- Webhook endpoints (`/api/webhooks/*`) do not use the standard auth
  middleware. They verify signatures via `VerifyWebhookSignature` middleware
  instead. Do not add `auth:sanctum` to webhook routes.
```

### When to keep gotchas in SKILL.md vs. references

Keep gotchas in the main SKILL.md where the agent reads them before encountering the situation. For non-obvious issues, the agent may not recognize the trigger condition that would prompt it to load a reference file.

## Templates for Output Format

When output must follow a specific structure, a concrete template is more reliable than prose description. The agent pattern-matches well against structures.

### Full example: API resource response template

```markdown
## API Response Structure

All API resources must follow this response envelope. Store this template
in `assets/api-response-template.json` for complex nested structures.

Inline template for standard responses:

` ` `php
// app/Http/Resources/ExampleResource.php
class ExampleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'example',
            'attributes' => [
                // Model-specific fields go here
                'name' => $this->name,
                'created_at' => $this->created_at->toIso8601String(),
                'updated_at' => $this->updated_at->toIso8601String(),
            ],
            'relationships' => [
                // Only include relationships that were eager-loaded
                'owner' => $this->whenLoaded('owner', fn () =>
                    new UserResource($this->owner)
                ),
            ],
            'meta' => [
                'permissions' => [
                    'can_edit' => $request->user()?->can('update', $this->resource),
                    'can_delete' => $request->user()?->can('delete', $this->resource),
                ],
            ],
        ];
    }
}
` ` `

Error responses must use this structure:

` ` `json
{
    "error": {
        "code": "VALIDATION_FAILED",
        "message": "Human-readable summary",
        "details": [
            {"field": "email", "message": "The email has already been taken."}
        ]
    }
}
` ` `
```

## Checklists for Multi-Step Workflows

An explicit checklist helps the agent track progress and avoid skipping steps, especially when steps have dependencies.

### Full example: adding a new API endpoint

```markdown
## Adding a New API Endpoint

Follow this checklist in order. Do not skip steps.

- [ ] Step 1: Create the migration (`php artisan make:migration`)
      - Use the column naming conventions in the gotchas section
      - Add appropriate indexes for foreign keys and frequently queried columns
- [ ] Step 2: Create the Eloquent model (`php artisan make:model`)
      - Add `$fillable`, relationships, and any required traits (`SoftDeletes`, etc.)
      - Add the model to the tenant's relationship if it's tenant-scoped
- [ ] Step 3: Create a Form Request (`php artisan make:request`)
      - Define validation rules. Use `exists:table,column` for foreign keys
      - Add authorization logic in `authorize()` method
- [ ] Step 4: Create an API Resource (`php artisan make:resource`)
      - Follow the response template in the Templates section
      - Use `whenLoaded()` for optional relationships
- [ ] Step 5: Create the Controller (`php artisan make:controller --api`)
      - Use single-action controllers for non-CRUD endpoints
      - Inject the Form Request, return the Resource
- [ ] Step 6: Add the route to `routes/api.php`
      - Apply `auth:sanctum` and `throttle:api` middleware
      - Use resource routing: `Route::apiResource()`
- [ ] Step 7: Write feature tests with Pest
      - Test happy path, validation errors, authorization, and 404 cases
      - Run: `./vendor/bin/pest --filter=NewEndpointTest`
- [ ] Step 8: Run static analysis
      - `./vendor/bin/phpstan analyse`
      - Fix any errors before proceeding
```

## Validation Loops

Instruct the agent to validate its own work before moving on. The pattern is: do the work, run a validator, fix issues, repeat.

### Full example: code change validation

```markdown
## After Making Code Changes

After every change, run this validation loop:

1. Run the relevant test suite:
   ` ` `bash
   ./vendor/bin/pest --filter=RelevantTest
   ` ` `
2. Run static analysis:
   ` ` `bash
   ./vendor/bin/phpstan analyse --memory-limit=512M
   ` ` `
3. Run code style fixer:
   ` ` `bash
   ./vendor/bin/pint
   ` ` `
4. If any step fails:
   - Read the error output carefully
   - Fix the issues in the relevant files
   - Re-run ALL three steps from the beginning
5. Only proceed to the next task when all three steps pass cleanly.

Do not skip Pint -- CI will reject code style violations.
```

### Full example: database migration validation

```markdown
## Validating Database Migrations

1. Preview the migration:
   ` ` `bash
   php artisan migrate --pretend
   ` ` `
2. Review the SQL output. Check for:
   - Correct table and column names
   - Appropriate column types and sizes
   - Foreign key constraints pointing to the right tables
   - Indexes on columns used in WHERE clauses and JOINs
3. If anything looks wrong, edit the migration and re-run `--pretend`
4. Only run the actual migration when the preview output is correct:
   ` ` `bash
   php artisan migrate
   ` ` `
5. Verify with `php artisan migrate:status` -- the new migration should
   show as "Ran"
```

## Plan-Validate-Execute

For batch or destructive operations, create an intermediate plan, validate it, then execute. This prevents irreversible mistakes.

### Full example: bulk data import

```markdown
## Bulk Data Import

1. **Plan:** Parse the import file and generate a dry-run report:
   ` ` `bash
   php artisan import:preview storage/imports/data.csv --format=json > storage/imports/preview.json
   ` ` `
2. **Validate:** Review the preview output. Check:
   - Row count matches expected input
   - No duplicate keys in the `conflicts` section
   - All foreign key references resolve (no orphaned records)
   - Data types match column expectations
3. **Fix:** If the preview shows issues, correct the source data or the
   import mapping, then re-run the preview
4. **Execute:** Only run the actual import when the preview is clean:
   ` ` `bash
   php artisan import:run storage/imports/data.csv --verified
   ` ` `
   The `--verified` flag requires a clean preview to exist. It will
   refuse to run if the preview showed errors.
5. **Verify:** Check the import log at `storage/logs/import.log` for
   any runtime errors
```

## Bundling Reusable Scripts

If you notice the agent independently reinventing the same logic across runs, that's a signal to write a tested script and bundle it in `scripts/`.

### Signals that a script is worth bundling

- The agent writes the same parsing/formatting logic in multiple runs
- A multi-step operation requires exact command sequences
- Output validation requires checking multiple conditions
- The operation involves error-prone transformations (e.g., data format conversion)

### Example: bundling a validation script

If the agent repeatedly writes ad-hoc checks for API response format compliance, bundle it:

```bash
#!/bin/bash
# scripts/validate-api-response.sh
# Validates that a JSON response matches the project's API envelope format.
#
# Usage: ./scripts/validate-api-response.sh response.json
# Exit code 0 = valid, 1 = invalid (errors printed to stderr)

set -euo pipefail

FILE="${1:?Usage: validate-api-response.sh <response.json>}"

if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE" >&2
    exit 1
fi

# Check required top-level keys
for key in "id" "type" "attributes"; do
    if ! jq -e "has(\"$key\")" "$FILE" > /dev/null 2>&1; then
        echo "Error: Missing required key '$key'" >&2
        exit 1
    fi
done

# Check timestamp format (ISO 8601)
for field in "attributes.created_at" "attributes.updated_at"; do
    value=$(jq -r ".$field // empty" "$FILE")
    if [ -n "$value" ] && ! echo "$value" | grep -qP '^\d{4}-\d{2}-\d{2}T'; then
        echo "Error: $field is not ISO 8601 format: $value" >&2
        exit 1
    fi
done

echo "Valid API response format."
```

Reference it from the skill:

```markdown
Validate response format: `scripts/validate-api-response.sh output.json`
```
