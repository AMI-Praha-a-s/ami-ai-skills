# Design Guide Creation Workflow

This reference details the interactive process for creating a project's design guide skill when none exists. The goal is to combine automated codebase analysis with collaborative brainstorming to produce a design guide grounded in the project's actual state and the team's intent.

## Step 1: Run the Analysis Script

Run the analyzer from the project root:

```bash
node {path-to-this-skill}/scripts/analyze-frontend.mjs
```

The script outputs JSON. Do not dump raw JSON to the user. Instead, summarize the findings conversationally:

- **Stack detected**: "Your project uses Vue 3 with Inertia, Tailwind CSS v4, and Vite."
- **Existing tokens**: "I found 12 CSS custom properties in `resources/css/app.css`, including `--primary`, `--secondary`, and several gray shades."
- **Component inventory**: "There are 23 Vue components in `resources/js/Components/` and 8 Blade components in `resources/views/components/`."
- **UI libraries**: "You have Headless UI and Heroicons installed."
- **Missing data**: "No existing design guide or theme configuration was found."

If the script is unavailable or fails, fall back to manually reading `package.json`, `tailwind.config.*`, and CSS files in `resources/css/`.

## Step 2: Present Findings and Propose Brainstorming

After summarizing the analysis, tell the user:

1. What you found (stack, existing tokens, component count)
2. What's missing (no design guide exists yet)
3. That you'd like to ask a few questions to establish the design direction before generating the guide

Keep this brief. Do not overwhelm the user with technical details -- they'll see everything in the generated guide.

## Step 3: Brainstorm Design Direction

Ask questions in **batches of 3-5** to avoid overwhelming the user. Adapt based on answers -- skip questions the codebase already answers. When the analysis already reveals an answer, state your finding and ask for confirmation rather than asking from scratch.

### Round 1: Identity and Direction

These are the most important questions. They shape everything else.

- "What's the product's purpose and who are the primary users?" (Skip if obvious from the project name or README.)
- "How would you describe the visual personality you're going for? For example: clean and professional, warm and approachable, bold and modern, minimal and focused, playful and colorful -- or something else entirely?"
- "Are there specific websites, apps, or brands whose visual style you admire or want to draw inspiration from?"

### Round 2: Colors and Typography

Adapt based on what the analysis found. If Tailwind config already defines a custom palette, present it and ask if it's current.

- "Do you have established brand colors? If so, what are they?" (If the analysis found custom colors, ask: "I found these colors in your config: {list}. Are these your current brand colors, or are they outdated?")
- "Do you prefer a light or dark default theme? Do you need dark mode support?"
- "Do you have font preferences, or should I suggest options based on the direction you described?"

### Round 3: Layout and Components

- "Is the interface primarily a dashboard/admin panel, a marketing/content site, a SaaS application, or something else?"
- "Do you prefer spacious layouts with generous whitespace, or denser information-rich layouts?"
- "Any strong preferences for how key UI elements should look? (e.g., rounded vs sharp corners, flat vs elevated cards, minimal vs detailed navigation)"

### Round 4: Motion and Accessibility (if relevant)

Only ask these if the project is complex enough to warrant it. For simple projects, use sensible defaults.

- "How should the interface feel in terms of motion -- subtle and fast, or more expressive with noticeable animations?"
- "Do you have specific accessibility requirements? (e.g., WCAG AA compliance, specific screen reader support needs)"

### Handling Short or Uncertain Answers

Users often say "I don't know" or give brief answers. This is fine:

- For "I don't know" or "you decide": Choose a sensible default based on the product type and stated direction. State what you chose and why. Mark the section in the guide with a note like "Default choice -- revisit if needed."
- For very brief answers (e.g., "modern"): Interpret based on context and your analysis. Present your interpretation: "I'll go with clean lines, a sans-serif font, generous spacing, and a blue-based palette -- does that match what you mean by 'modern'?"
- For "skip this": Use a reasonable default and move on. Don't push.

The goal is to gather enough direction to produce a useful guide, not to extract a comprehensive design brief. A partially-informed guide that exists is better than a perfect guide that never gets created.

## Step 4: Generate the Design Guide Skill

Use the template at `assets/design-skill-template.md` as the structural foundation. Populate it by combining:

1. **Analysis data**: Stack info, detected tokens, installed packages go into factual sections (Frontend Stack, existing color values, breakpoints)
2. **Brainstorming answers**: Visual direction, preferences, and choices go into subjective sections (Overview, color roles, typography choices, animation philosophy)
3. **Sensible defaults**: Fill remaining gaps with defaults appropriate for the detected stack and stated direction

### Population priority

| Template section | Primary source | Fallback |
|-----------------|---------------|----------|
| Overview | Brainstorming (identity + direction) | Infer from project name and stack |
| Frontend Stack | Analysis script | Manual file inspection |
| Colors | Analysis (existing tokens) + brainstorming (roles/intent) | Stack defaults |
| Typography | Brainstorming (preferences) | Stack-appropriate defaults |
| Spacing | Analysis (Tailwind config) | Tailwind defaults or 4px base |
| Border Radius / Shadows | Brainstorming (sharp vs rounded) | Moderate defaults |
| Breakpoints | Analysis (Tailwind config) | Tailwind defaults |
| Component Patterns | Analysis (existing components) + brainstorming (preferences) | Defer -- mark as "To be established" |
| Layout Conventions | Brainstorming (app type + density) | Standard for detected stack |
| Animation & Motion | Brainstorming (motion feel) | Subtle, 150ms transitions |
| Accessibility | Brainstorming (requirements) | WCAG AA default |
| Icons & Assets | Analysis (installed icon packages) | Heroicons if Tailwind, or defer |
| Theming | Brainstorming (dark mode answer) | No theming unless requested |

### Writing the content

- Replace all `{placeholder}` values with real data. Do not leave template placeholders in the output.
- Remove sections that are genuinely not applicable (e.g., Theming if the user said no dark mode and no theming needs).
- For sections where the answer is "to be determined", write a brief note: "Not yet established. Update this section when patterns emerge."
- Keep the generated guide focused and practical. A 150-line guide with real values is better than a 400-line guide with generic advice.

## Step 5: Write and Verify

1. Create the directory: `.ai/skills/project-design/`
2. Write the populated template to `.ai/skills/project-design/SKILL.md`
3. Verify:
   - File starts with valid YAML frontmatter containing `name: project-design` and a non-empty `description`
   - Body contains at least one Markdown heading
   - No `{placeholder}` values remain in the content
   - Color values are actual hex/rgb/Tailwind values, not descriptions
   - The overview reflects the brainstorming conversation, not generic filler
4. Tell the user the guide has been created and offer to refine any section

## Handling Edge Cases

### No frontend stack detected

If `package.json` has no frontend dependencies and no CSS files exist, the project may not have frontend assets yet. In this case:

- Ask the user what stack they plan to use
- Generate a starter guide with the planned stack and sensible defaults
- Mark more sections as "To be established" since there's nothing to extract

### Existing design artifacts found

If the analysis finds an existing design guide or similar document:

- Read the existing document
- Ask the user if they want to migrate its content into the new skill format
- Preserve existing decisions rather than re-brainstorming them

### User wants to skip brainstorming

If the user says "just generate something" or "use defaults":

- Use the analysis data as the primary source
- Apply sensible defaults for the detected stack
- Write a note in the Overview: "Generated from codebase analysis with default choices. Review and refine each section to match your design intent."
- Let the user know they can update any section later
