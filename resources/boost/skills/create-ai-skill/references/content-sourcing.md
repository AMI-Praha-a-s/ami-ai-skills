# Content Sourcing Strategies

This reference provides detailed guidance on gathering quality content for AI skills. Skills grounded in real project expertise consistently outperform those generated from generic knowledge.

## Extracting from a Hands-On Task

The most effective way to source skill content is to complete a real task in conversation with an AI agent, then extract the reusable pattern.

### What to capture during the task

- **Steps that worked.** Record the sequence of actions that led to success. Note the order -- it often matters more than you'd expect.
- **Corrections you made.** Every time you steer the agent ("don't use X, use Y instead" or "you forgot to check for Z"), that's a gotcha for your skill.
- **Input/output formats.** What the data looked like going in and coming out. Concrete examples beat prose descriptions.
- **Context you provided.** Project-specific facts, conventions, or constraints the agent didn't know. These are prime candidates for the skill body.

### Example: extracting a deployment skill

Suppose you walked the agent through deploying a Laravel application:

1. You corrected it to run `php artisan config:cache` before `php artisan route:cache` (order matters for config-dependent route definitions).
2. You told it to skip `php artisan optimize` because your project uses a custom optimization script at `scripts/optimize.sh`.
3. You explained that the `.env` file is managed by Vault and must not be committed or regenerated.

Each correction becomes a gotcha or explicit instruction in the skill:

```markdown
## Gotchas

- Run `config:cache` BEFORE `route:cache`. Route caching depends on
  resolved config values, so reversing the order causes stale config
  in cached routes.
- Do not run `php artisan optimize`. Use `scripts/optimize.sh` instead,
  which includes project-specific optimizations for the queue and
  event discovery.
- The `.env` file is managed by HashiCorp Vault. Never commit, regenerate,
  or overwrite it during deployment.
```

## Synthesizing from Project Artifacts

When you have existing knowledge spread across project artifacts, you can feed it into the skill creation process.

### Good source materials

| Source | What it reveals |
|--------|----------------|
| Internal documentation and runbooks | Established procedures and conventions |
| API specifications and schemas | Data structures, endpoints, validation rules |
| Code review comments | Recurring concerns and reviewer expectations |
| VCS history (especially patches/fixes) | Patterns through what actually changed |
| Issue trackers and bug reports | Common failure modes and their resolutions |
| Style guides and linting configs | Code conventions and formatting rules |
| CI/CD pipeline configurations | Build, test, and deployment sequences |
| Incident reports and post-mortems | Real-world failure cases and recovery procedures |

### How to synthesize effectively

1. **Gather project-specific material.** Collect the relevant artifacts listed above. Prioritize material that captures *your* schemas, failure modes, and conventions -- not generic references.
2. **Feed material to the AI.** Provide the collected artifacts as context when asking the AI to draft the skill. Be explicit: "Based on these code review comments and this runbook, create a skill for..."
3. **Focus on the delta.** The skill should capture what the AI wouldn't know from general training. If your API follows standard REST conventions, don't document that. If it uses a custom pagination format with cursor-based tokens, document that.

### Example: synthesizing from code review comments

If your team's code reviews repeatedly flag the same issues:

```
PR #142: "Remember to dispatch events through the tenant-aware dispatcher"
PR #187: "Use $this->authorize() not Gate::allows() in controllers"
PR #201: "Queue jobs must implement ShouldBeUnique for idempotency"
PR #215: "Don't eager-load audit logs -- they're append-only and massive"
```

These recurring comments become skill content:

```markdown
## Coding Conventions

- Dispatch events through `$tenant->dispatch()`, not the global
  `event()` helper. The tenant-aware dispatcher ensures event
  listeners receive the correct tenant context.
- Use `$this->authorize()` in controllers, not `Gate::allows()`.
  The controller method automatically throws AuthorizationException
  and returns a 403 response.
- All queued jobs must implement `ShouldBeUnique` to guarantee
  idempotency. Use the job's primary model ID as the unique key.
- Never eager-load the `auditLogs` relationship. Audit logs are
  append-only and can contain millions of rows. Load them only
  through dedicated audit endpoints with pagination.
```

## Anti-Pattern: Pure LLM Generation

Asking an LLM to "create a skill for Laravel API development" without providing project-specific context produces generic advice like "handle errors appropriately" and "follow REST conventions." This adds no value beyond what the agent already knows.

The fix is always the same: feed real expertise into the process. Even a brief list of "things our team always gets wrong" or "conventions that surprise new developers" provides more value than a comprehensive generic guide.
