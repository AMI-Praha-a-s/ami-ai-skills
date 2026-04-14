---
name: design-guide
description: "Use this skill when doing any frontend work (building UI components, pages, layouts, styling) or when the user asks to create, update, review, or consult the project's design guide. Also activate when the user mentions design tokens, color palette, typography, spacing system, component patterns, or visual consistency. When activated, check if the project design skill exists at .ai/skills/project-design/SKILL.md -- if it does, read it and follow it; if it does not and the task involves frontend work, initiate the creation workflow. Do NOT use for backend-only work, API endpoints, database changes, or tasks with no frontend/UI impact."
compatibility: "Requires a Laravel project with frontend assets. Node.js must be available for the analysis script."
---

# Design Guide Management

This skill manages the project's design guide -- a companion skill at `.ai/skills/project-design/SKILL.md` that contains the actual design tokens, visual direction, and component patterns. This management skill provides the workflow for creating, consulting, and updating that design guide.

## Two-Skill Architecture

| Skill | Location | Purpose |
|-------|----------|---------|
| `design-guide` (this skill) | Shipped by package | **Process**: how to create, consult, and update the design guide |
| `project-design` (companion) | `.ai/skills/project-design/SKILL.md` | **Content**: the actual design tokens, colors, typography, patterns |

Both skills activate during frontend work. This skill tells you what to do. The companion skill tells you what the design is.

## Discovery

Before starting any frontend task, check whether the project design skill exists:

1. Look for `.ai/skills/project-design/SKILL.md`
2. If it exists: read it, then proceed to the **Consulting the Design Guide** section
3. If it does not exist: proceed to the **Creation Workflow** section

Do not silently skip this check. The design guide exists to ensure visual consistency across the project, and ignoring it leads to fragmented design.

## Frontend Stack Detection

Before creating a design guide or when working on frontend tasks, understand the project's stack. Common Laravel frontend configurations:

| Stack | Key Indicators |
|-------|---------------|
| Blade + Tailwind | `tailwindcss` in package.json, `.blade.php` templates, no JS framework |
| Livewire + Alpine | `livewire` directory in `app/`, `alpinejs` in package.json, `resources/views/livewire/` |
| Inertia + Vue | `@inertiajs/vue3` in package.json, `.vue` files in `resources/js/` |
| Inertia + React | `@inertiajs/react` in package.json, `.jsx`/`.tsx` files in `resources/js/` |
| Blade + Bootstrap | `bootstrap` in package.json, no Tailwind config |

Check these locations for stack clues:

- `package.json` -- dependencies reveal framework and CSS tools
- `tailwind.config.*` -- Tailwind configuration and custom theme
- `vite.config.*` or `webpack.mix.js` -- build tool setup
- `resources/css/` -- stylesheets and CSS custom properties
- `resources/js/` -- component files and framework structure
- `resources/views/` -- Blade and Livewire templates

## Creation Workflow

When no project design skill exists and the user is doing frontend work or explicitly asks to create a design guide, follow this process. For the full detailed workflow with question lists and synthesis guidance, read [references/creation-workflow.md](references/creation-workflow.md).

### Step 1: Analyze the Codebase

Run the analysis script to detect the stack and extract existing design tokens:

```bash
node {path-to-this-skill}/scripts/analyze-frontend.mjs
```

The script outputs JSON with stack detection, config file contents, CSS custom properties, component directory inventory, and installed packages. If the script is unavailable, manually read `package.json`, Tailwind config, and CSS files.

### Step 2: Summarize Findings

Present the analysis results conversationally to the user. Highlight:

- Detected stack and key libraries
- Existing design tokens (colors, spacing from config files)
- Component inventory (how many, where they live)
- What's missing (no design guide, incomplete tokens)

Do not dump raw JSON. Translate findings into plain language.

### Step 3: Brainstorm with the User

Engage the user in a focused brainstorming session to establish the design direction. Ask questions in batches of 3-5 to avoid overwhelming them. Key topics:

**Identity**: Product purpose, target audience, desired visual personality (clean, bold, warm, minimal, etc.), design inspirations.

**Color and typography**: Brand colors (or confirm extracted ones), light/dark preference, font preferences.

**Layout and components**: Application type (dashboard, SaaS, marketing), density preference (spacious vs information-rich), corner/elevation preferences.

**Motion and accessibility**: Animation philosophy, WCAG requirements.

Adapt questions based on what the analysis already revealed. If the codebase answers a question, state the finding and ask for confirmation instead of asking from scratch. See [references/creation-workflow.md](references/creation-workflow.md) for the full question list and guidance on handling uncertain answers.

### Step 4: Generate the Design Guide Skill

Use the template at [assets/design-skill-template.md](assets/design-skill-template.md) as the structural foundation. Populate it by combining:

- **Analysis data** for factual sections (stack, existing tokens, breakpoints)
- **Brainstorming answers** for subjective sections (visual direction, color roles, typography choices)
- **Sensible defaults** for gaps, appropriate to the detected stack and stated direction

Replace all template placeholders with real values. Remove sections that don't apply. For undetermined sections, write "Not yet established. Update this section when patterns emerge." Keep the guide focused -- a practical 150-line guide with real values beats a bloated 400-line guide with generic advice.

### Step 5: Write and Verify

1. Create `.ai/skills/project-design/` directory
2. Write the populated guide to `.ai/skills/project-design/SKILL.md`
3. Verify:
   - Frontmatter contains `name: project-design` and non-empty `description`
   - Body has at least one heading
   - No template placeholders remain (`{...}` patterns)
   - Color values are actual hex/rgb/Tailwind class values
   - Overview reflects the brainstorming conversation
4. Inform the user the guide has been created and offer to refine any section

**CRITICAL**: Write the generated skill to `.ai/skills/project-design/SKILL.md` only. Never write to `.claude/skills/`, `.cursor/skills/`, `.agents/skills/`, or any directory outside `.ai/`.

## Consulting the Design Guide

When the project design skill exists at `.ai/skills/project-design/SKILL.md`, follow these rules during frontend work:

### Before Starting Work

1. Read `.ai/skills/project-design/SKILL.md` if you have not already in this session
2. Identify which design tokens and patterns are relevant to the current task
3. Note any component patterns that apply

### While Working

- **Use established tokens.** Never hardcode colors, font sizes, spacing, or other values that the design guide defines as tokens. Use the guide's values or the corresponding Tailwind classes / CSS variables.
- **Follow component patterns.** If the guide documents a pattern for the component type you're building (buttons, cards, forms, etc.), follow it. Consistency matters more than novelty.
- **Respect the layout conventions.** Use the guide's max width, grid system, and responsive strategy.
- **Match the animation philosophy.** If the guide says "subtle and functional", don't add elaborate animations. If it says "expressive", don't strip motion.
- **Check accessibility requirements.** Apply the guide's focus styles, contrast requirements, and ARIA patterns.

### Handling Conflicts

When a user's specific request conflicts with the design guide:

- **One-off exception**: Follow the user's request. The guide documents the default, not an absolute rule. Do not update the guide for single exceptions.
- **Recurring deviation**: If the user consistently asks for something that contradicts the guide (e.g., always wants rounded corners when the guide says sharp), suggest updating the guide to reflect the actual preference.
- **User explicitly overrides**: If the user says "ignore the guide for this" or "I know the guide says X but do Y", follow their instruction without argument.

### When the Guide Doesn't Cover Something

If you encounter a design decision the guide doesn't address:

1. Make a reasonable choice consistent with the guide's overall direction and existing patterns
2. Tell the user what you chose and why
3. Suggest adding it to the guide if it's likely to recur

## Updating the Design Guide

The design guide is a living document. Update it when the project's design evolves.

### When to Update

- **New component pattern established.** When you build a component type not yet in the guide and the user approves the approach, add it.
- **New tokens introduced.** When the user approves a new color, font, or spacing value, add it to the tokens section.
- **User explicitly requests changes.** "Change the primary color", "update the guide to use rounded corners", etc.
- **Recurring deviations.** When the user repeatedly asks for something that contradicts the guide, suggest formalizing the change.

### When NOT to Update

- **One-off exceptions.** A single departure from the guide is not a reason to change it.
- **Experimental work.** Prototypes and experiments should not immediately alter the canonical guide.
- **Without user awareness.** Never silently update the design guide. Always tell the user what you're changing and why.

### How to Update

1. Read the current `.ai/skills/project-design/SKILL.md`
2. Make targeted edits -- change only the relevant sections
3. Preserve the file's structure and formatting
4. Do not rewrite sections that weren't affected by the change
5. Verify the file still has valid frontmatter after editing
6. Tell the user what was updated

### Suggesting Updates

When you notice a potential update, suggest it explicitly:

> "I notice we've been using `rounded-xl` for all new cards, but the design guide specifies `rounded-lg`. Want me to update the guide to reflect `rounded-xl` as the standard?"

Let the user decide. Do not auto-update.

## Gotchas

- Tailwind config may extend a preset or use `@import` directives in v4. Check both the config file and any imported preset for the full set of available tokens.
- CSS custom properties defined in `app.css` or a theme file may override or supplement Tailwind's utility classes. Check both sources when documenting tokens.
- Livewire components can have styling that loads differently from standard Blade or SPA components. Note any Livewire-specific styling patterns in the guide.
- The generated `project-design` skill must have valid YAML frontmatter or AI agents won't discover it. Always verify the frontmatter after creation or updates.
- If the project uses a component library (Headless UI, Radix, PrimeVue, etc.), the design guide should document how the library's components are styled, not replicate the library's own documentation.
- Tailwind v4 uses CSS-based configuration (`@theme` in CSS files) rather than a JavaScript config file. The analysis script checks the JS config; for v4 projects, also read `resources/css/app.css` or the main CSS entry point for `@theme` blocks.

## Verification

### After Creating a Design Guide

1. `.ai/skills/project-design/SKILL.md` exists
2. File was NOT created in `.claude/`, `.cursor/`, `.agents/`, or other non-`.ai/` directory
3. Frontmatter contains `name: project-design` and non-empty `description`
4. Body contains at least one Markdown heading
5. No template placeholder values remain (`{...}` patterns)
6. Color values are actual hex/rgb/Tailwind values, not descriptions like "a nice blue"
7. Typography values reference actual fonts available in the project
8. The overview reflects the brainstorming conversation, not generic filler
9. Stack information matches the actual project

### After Updating a Design Guide

1. Frontmatter is still valid (not corrupted by the edit)
2. Only the intended sections were changed
3. No empty sections or orphaned headings left behind
4. Updated values are consistent with surrounding content (e.g., a new color fits the established palette)
5. The user was informed of the change

## Common Pitfalls

- Do not generate a design guide from generic LLM knowledge. Always analyze the actual codebase first, then brainstorm with the user. A guide disconnected from the real project is worse than no guide.
- Do not update the design guide without the user's awareness. Always communicate changes.
- Do not ignore the design guide during frontend work because it's "faster" to just pick values. Consistency is the entire point.
- Do not create the `project-design` skill in `.claude/skills/`, `.cursor/skills/`, `.agents/skills/`, or any directory other than `.ai/skills/`. Those directories contain autogenerated content managed by external tools.
- Do not leave template placeholders in the generated guide. Every `{placeholder}` must be replaced with a real value or the section must be removed.
- Do not duplicate the design guide's content in this skill. This skill provides workflow; the `project-design` skill provides design content. Keep them separate.
- Do not invent new design tokens without checking the existing guide. If a token is needed but missing, add it to the guide rather than hardcoding a one-off value.
