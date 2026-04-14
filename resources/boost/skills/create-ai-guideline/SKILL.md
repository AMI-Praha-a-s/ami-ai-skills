---
name: create-ai-guideline
description: "Use this skill when the user asks you to create, add, write, or scaffold a new AI guideline for Laravel Boost. This includes requests like: 'create a new Boost guideline', 'add AI guidelines', 'write guidelines for my package', or 'add always-on rules for the AI'. Do NOT use this skill for creating skills (use the create-ai-skill skill instead). Do NOT use this skill when merely querying or listing existing guidelines."
license: MIT
metadata:
  author: ami-praha
---

# Creating Laravel Boost AI Guidelines

## What Are Guidelines?

Guidelines are always-applied rules that get concatenated into a single file (like `CLAUDE.md` or `AGENTS.md`) that AI coding agents read at all times during a session. Unlike skills which activate on-demand, guidelines are always present and enforce project-wide standards.

Guidelines are discovered by Laravel Boost and merged into the agent's configuration file when the user runs `php artisan boost:install`.

## Guidelines vs Skills

| Aspect | Guidelines | Skills |
|--------|-----------|--------|
| Activation | Always applied | On-demand, based on task |
| Frontmatter | None | Required (name, description) |
| File name | `core.md` or `core.blade.php` | `SKILL.md` or `SKILL.blade.php` |
| Output | Concatenated into one file | Written as individual files |
| Purpose | Project-wide standards and rules | Domain-specific knowledge |
| Length | Short and focused | Can be detailed and long |

Use guidelines for rules that should always be followed (coding standards, project conventions, architectural decisions). Use skills for domain knowledge that is only relevant during specific tasks.

## Guideline Locations

Guidelines can live in three places:

1. **Third-party package guidelines** (for Composer packages):
   ```
   vendor/{package-name}/resources/boost/guidelines/core.md
   ```

2. **User-created guidelines** (project-specific overrides):
   ```
   .ai/guidelines/core.md
   ```

3. **Built-in Boost guidelines** (first-party Laravel packages only):
   ```
   vendor/laravel/boost/.ai/{package}/core.blade.php
   ```

For a Composer package that provides guidelines, use path #1.

## Directory Structure

For a third-party package providing guidelines:

```
your-package/
  resources/
    boost/
      guidelines/
        core.md               # Required: the guideline file
```

For user-created project guidelines:

```
.ai/
  guidelines/
    core.md                   # Custom project guideline
    my-custom-rules.md        # Additional guideline files
```

## Guideline File Format

Guidelines are plain Markdown files with **no frontmatter**. This is a key difference from skills.

### Third-Party Package Guideline

For a Composer package, create `resources/boost/guidelines/core.md`:

```markdown
# Package Name Guidelines

## Coding Standards

- Always use strict types in PHP files
- Follow PSR-12 coding style
- Use typed properties and return types

## Architecture Rules

- Keep controllers thin, use action classes for business logic
- Use form requests for validation
- Use API resources for JSON responses

## Naming Conventions

- Use PascalCase for class names
- Use camelCase for method and variable names
- Use snake_case for database columns and config keys
```

### User Project Guideline

For project-specific guidelines, create files in `.ai/guidelines/`:

```markdown
# Project Conventions

## Database

- All tables use UUID primary keys
- Always add soft deletes to models
- Use database transactions for multi-step operations

## API

- All API responses must use the standard envelope format
- Version APIs using URL prefix (v1, v2)
- Rate limit all public endpoints
```

## How Guidelines Are Composed

When Boost installs guidelines, it:

1. Discovers all guideline files from all sources
2. Renders any `.blade.php` files through the Blade engine
3. Wraps each guideline with a section header: `=== {key} rules ===`
4. Concatenates all sections into a single string
5. Formats the output (normalizes line endings, spacing)
6. Wraps in `<laravel-boost-guidelines>` tags
7. Writes to the agent's file (e.g., `CLAUDE.md`, `AGENTS.md`)

The final output in `CLAUDE.md` looks like:

```markdown
<laravel-boost-guidelines>

=== foundation rules ===

...

=== your-package/name rules ===

# Your Package Guidelines
...

</laravel-boost-guidelines>
```

## User Overrides

Users can override any guideline by placing a file with the same relative path in `.ai/guidelines/`. The user's version takes precedence over the package's version.

For example, if a package provides:
```
vendor/my-package/resources/boost/guidelines/core.md
```

A user can override it by creating:
```
.ai/guidelines/my-package/core.md
```

## Blade Templates (Advanced)

Guidelines can use `.blade.php` for dynamic content. The `$assist` variable (`GuidelineAssist`) is available:

```php
@php /** @var \Laravel\Boost\Install\GuidelineAssist $assist */ @endphp

# Project Guidelines

## Framework

This project uses Laravel {{ $assist->roster->laravelVersion() }}.

@if($assist->roster->uses('livewire/livewire'))
## Livewire

- Use Livewire components for interactive UI
- Keep component state minimal
@endif

## Commands

- Run tests: `{{ $assist->composerCommand('test') }}`
- Format code: `{{ $assist->composerCommand('format') }}`
- Create model: `{{ $assist->artisanCommand('make:model') }}`
```

Available `$assist` helpers:
- `$assist->artisanCommand('...')` -- generates the correct artisan command
- `$assist->composerCommand('...')` -- generates the correct composer command
- `$assist->binCommand('...')` -- generates the correct vendor/bin command
- `$assist->nodePackageManagerCommand('...')` -- NPM/Yarn/pnpm command
- `$assist->models()` -- discovered Eloquent models
- `$assist->controllers()` -- discovered controllers
- `$assist->enums()` -- discovered enums
- `$assist->roster->uses('package/name')` -- check if a package is installed

## Providing Both Guidelines and Skills

A package can provide both guidelines and skills simultaneously:

```
your-package/
  resources/
    boost/
      guidelines/
        core.md               # Always-applied rules
      skills/
        my-skill/
          SKILL.md            # On-demand domain knowledge
```

Boost discovers them independently. During `php artisan boost:install`, the package appears with labels indicating what it provides (e.g., "my-package (guidelines, skills)").

## Best Practices for Writing Guidelines

1. **Keep them short** -- guidelines are always loaded, so brevity matters
2. **Be specific** -- vague rules like "write good code" add noise
3. **Use imperative language** -- "Use X" instead of "You should consider using X"
4. **Focus on conventions** -- things that should be consistent across the project
5. **Avoid tutorials** -- guidelines state rules, not teach concepts (use skills for that)
6. **Use lists** -- bullet points are easier for AI agents to parse than prose

## Discovery Mechanism

Laravel Boost discovers guidelines automatically with no PHP code needed:

1. Boost reads the project's `composer.json` for all installed packages
2. For each package, it checks if `vendor/{package}/resources/boost/guidelines/` exists
3. It reads all `.md` and `.blade.php` files in that directory
4. During `php artisan boost:install`, users select which third-party packages to include
5. Selected guidelines are merged into the agent's configuration file

## Verification

After creating a new guideline, verify:

1. The file is at `resources/boost/guidelines/core.md` (for packages) or `.ai/guidelines/` (for projects)
2. The file does NOT have YAML frontmatter (guidelines are plain Markdown)
3. The content starts with a Markdown heading (`# Title`)
4. The rules are concise and actionable
5. Run `php artisan boost:install` or `php artisan boost:update` to test discovery
6. Check the agent's output file (`CLAUDE.md`, `AGENTS.md`) to confirm the guideline appears

## Common Pitfalls

- Do not add YAML frontmatter to guideline files -- only skills use frontmatter
- Do not write long, tutorial-style content -- guidelines should be rules, not documentation
- Do not duplicate rules already covered by Boost's built-in guidelines (Laravel style, testing, etc.)
- Do not use `SKILL.md` as the filename -- guidelines use `core.md` or `core.blade.php`
- Do not place guideline files inside `resources/boost/skills/` -- they will be treated as skills and will fail to parse due to missing frontmatter
- Do not forget to test discovery by running `php artisan boost:install` after adding guidelines
