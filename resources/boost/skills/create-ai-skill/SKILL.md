---
name: create-ai-skill
description: "Use this skill when the user asks you to create, add, write, or scaffold a new AI skill for Laravel Boost. This includes requests like: 'create a new Boost skill', 'add an AI skill', 'write a SKILL.md', 'scaffold a skill for my package', or 'make a new skill that teaches AI about X'. Do NOT use this skill for creating guidelines (use the create-ai-guideline skill instead). Do NOT use this skill when merely querying or listing existing skills."
license: MIT
metadata:
  author: ami-praha
---

# Creating Laravel Boost AI Skills

## What Are Skills?

Skills are on-demand domain-specific knowledge files that AI coding agents (Claude Code, Cursor, Copilot, etc.) load when working on a relevant task. Unlike guidelines which are always applied, skills are activated only when the AI determines the task matches the skill's description.

Skills are discovered by Laravel Boost and installed into the agent's skill directory (e.g., `.claude/skills/`, `.cursor/skills/`) when the user runs `php artisan boost:install`.

## Skill Locations

Skills can live in three places:

1. **Third-party package skills** (most common for packages):
   ```
   vendor/{package-name}/resources/boost/skills/{skill-name}/SKILL.md
   ```

2. **User-created skills** (project-specific):
   ```
   .ai/skills/{skill-name}/SKILL.md
   ```

3. **Built-in Boost skills** (only for first-party Laravel packages):
   ```
   vendor/laravel/boost/.ai/{package}/skill/{skill-name}/SKILL.md
   ```

For a Composer package that provides skills, always use path #1.

## Directory Structure

Each skill is a directory containing a `SKILL.md` file and optional supporting files:

```
resources/
  boost/
    skills/
      my-skill-name/
        SKILL.md              # Required: the main skill file
        rules/                # Optional: subdirectory for detailed rule files
          topic-one.md
          topic-two.md
```

## SKILL.md Format

Every SKILL.md must start with YAML frontmatter containing at minimum `name` and `description`:

```markdown
---
name: my-skill-name
description: "Detailed trigger description. Explain WHEN to activate this skill, WHAT it covers, and when NOT to use it. This is used by the AI agent to decide whether to load the skill."
license: MIT
metadata:
  author: your-name-or-org
---

# Skill Title

## Documentation

For comprehensive documentation, use `search-docs` to search the [Official Docs](https://example.com/docs).

## Basic Usage

Show practical code examples with fenced code blocks:

` ` `php
// Example code here
$example = new Example();
$example->doSomething();
` ` `

## Feature Sections

Add sections for each major feature or concept the skill covers.
Use code examples liberally -- they are the most valuable part.

## Verification

1. Check that X is properly configured
2. Verify Y works as expected
3. Run tests to confirm behavior

## Common Pitfalls

- Do not do X because Y
- Remember to always Z when doing W
- Avoid Q -- use R instead
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Kebab-case identifier for the skill. Must not be empty. |
| `description` | Yes | Trigger description for the AI. Must not be empty. Explain when to activate, what it covers, and when NOT to use it. |
| `license` | No | License identifier (e.g., `MIT`). |
| `metadata` | No | Additional metadata. Commonly includes `author`. |

### Writing a Good Description

The `description` field is critical -- it determines when the AI loads the skill. Good descriptions:

- State explicitly when to activate: "Use this skill when the user asks to..."
- List covered topics: "This covers X, Y, and Z"
- State exclusions: "Do NOT use this for..."
- Are detailed enough to avoid false matches

Example of a good description:
```yaml
description: "Use this skill when building or modifying API endpoints in Laravel. This covers resource controllers, API resources, JSON responses, rate limiting, authentication, and versioning. Do NOT use this for frontend/Blade views or Livewire components."
```

## Using Rules Subdirectories

For complex skills with many topics, use a `rules/` subdirectory to keep the main SKILL.md focused:

```
my-complex-skill/
  SKILL.md           # Table of contents + overview
  rules/
    topic-one.md     # Detailed rules for topic one
    topic-two.md     # Detailed rules for topic two
```

The SKILL.md should reference rule files and instruct the AI to read them:

```markdown
## How to Apply

When working on a relevant task, use a sub-agent to read the specific
rule files from the `rules/` directory next to this file:

- `rules/topic-one.md` -- Covers X and Y
- `rules/topic-two.md` -- Covers Z and W
```

Rule files are plain Markdown with no frontmatter. They typically use paired "Incorrect/Correct" code blocks:

```markdown
# Topic One

## Practice Name

Incorrect:

` ` `php
// Bad pattern
$results = DB::table('users')->get();
foreach ($results as $result) { ... }
` ` `

Correct:

` ` `php
// Good pattern
$results = DB::table('users')->where('active', true)->cursor();
foreach ($results as $result) { ... }
` ` `
```

## Blade Templates (Advanced)

Skills can use `.blade.php` instead of `.md` for dynamic content. Blade skills have access to a `$assist` variable of type `GuidelineAssist`:

```php
@php /** @var \Laravel\Boost\Install\GuidelineAssist $assist */ @endphp
```

Available helpers:
- `{{ $assist->artisanCommand('make:model') }}` -- correct artisan command
- `{{ $assist->composerCommand('require') }}` -- correct composer command
- `@boostsnippet("Title", "php")` / `@endboostsnippet` -- code blocks
- `@if($assist->roster->uses('livewire/livewire'))` -- conditional content

Use Blade when content varies based on the project's detected stack. Use plain `.md` when content is static.

## Discovery Mechanism

Laravel Boost discovers skills automatically with no PHP code or ServiceProvider needed:

1. Boost reads the project's `composer.json` to find all installed packages
2. For each package, it checks if `vendor/{package}/resources/boost/skills/` exists
3. It scans subdirectories for `SKILL.blade.php` or `SKILL.md` files (in that order)
4. During `php artisan boost:install`, users select which third-party packages to include
5. Selected skills are copied to the agent's skill directory

## Verification

After creating a new skill, verify:

1. The SKILL.md is at `resources/boost/skills/{skill-name}/SKILL.md`
2. The frontmatter contains non-empty `name` and `description`
3. The `name` in frontmatter matches the directory name
4. The file contains practical code examples
5. The description clearly states when to activate and when NOT to
6. If using `rules/`, each rule file exists and contains valid Markdown

## Common Pitfalls

- Do not put SKILL.md directly in `resources/boost/skills/` -- it must be inside a named subdirectory
- Do not omit the `description` frontmatter -- the skill will fail to parse without it
- Do not write vague descriptions like "general coding help" -- this causes the skill to activate too often
- Do not forget to include code examples -- skills without examples are significantly less useful
- Do not use frontmatter in rule files inside `rules/` -- only the main SKILL.md has frontmatter
- Do not name the file `skill.md` (lowercase) -- it must be `SKILL.md` or `SKILL.blade.php`
