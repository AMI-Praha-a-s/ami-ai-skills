# AMI AI Skills

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ami-praha-a-s/ami-ai-skills.svg?style=flat-square)](https://packagist.org/packages/ami-praha-a-s/ami-ai-skills)
[![Tests](https://img.shields.io/github/actions/workflow/status/ami-praha-a-s/ami-ai-skills/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ami-praha-a-s/ami-ai-skills/actions/workflows/run-tests.yml)

A collection of AI skills for [Laravel Boost](https://github.com/laravel/boost). When installed in a Laravel project alongside Boost, these skills are automatically discovered and made available to AI coding agents (Claude Code, Cursor, Copilot, etc.).

## Included Skills

| Skill | Description |
|-------|-------------|
| `create-ai-skill` | Teaches AI agents how to create new Laravel Boost AI skills with correct directory structure, frontmatter, and content patterns. |
| `create-ai-guideline` | Teaches AI agents how to create new Laravel Boost AI guidelines with correct format, discovery mechanism, and best practices. |
| `design-guide` | Manages the project's design guide -- creates it via codebase analysis and collaborative brainstorming if missing, consults it during frontend work, and keeps it updated as the design evolves. |

## Installation

```bash
composer require ami-praha-a-s/ami-ai-skills --dev
```

Then run Boost install (or update) to discover and activate the skills:

```bash
php artisan boost:install
```

When prompted, select `ami-praha-a-s/ami-ai-skills` from the third-party packages list.

## How It Works

Laravel Boost uses convention-based discovery. This package places skill files at:

```
resources/boost/skills/{skill-name}/SKILL.md
```

Boost scans all installed Composer packages for this directory structure and makes any discovered skills available during `boost:install` or `boost:update`. No ServiceProvider or PHP registration code is needed.

## Adding New Skills

To add a new skill to this package:

1. Create a directory under `resources/boost/skills/` with a kebab-case name
2. Add a `SKILL.md` file with YAML frontmatter (`name` and `description` required)
3. Write the skill content in Markdown
4. Run `composer test` to validate the skill format

```
resources/boost/skills/my-new-skill/
  SKILL.md
```

The automated tests verify that all skills have valid frontmatter and correct structure.

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
