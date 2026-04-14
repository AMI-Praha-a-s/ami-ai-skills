---
name: project-design
description: "Use this skill when doing any frontend work -- building or modifying UI components, pages, layouts, or styles. Contains the project's design tokens, color palette, typography, spacing, component patterns, and visual guidelines. Read this before creating or modifying any UI element to ensure visual consistency. Do NOT use for backend-only work with no UI impact."
---

# {Project Name} Design Guide

## Overview

{Brief description of the project's visual identity and design direction, established through brainstorming with the team. Include the product's purpose, target audience, and the core aesthetic intent.}

## Frontend Stack

- **Framework**: {e.g., Vue 3 via Inertia, Livewire + Alpine, Blade only}
- **CSS**: {e.g., Tailwind CSS v4, Bootstrap 5, custom SCSS}
- **Build Tool**: {e.g., Vite, Webpack via Laravel Mix}
- **Key Libraries**: {e.g., Headless UI, Heroicons, Motion}

## Design Tokens

### Colors

{Define the color palette with actual values. Include semantic meaning.}

| Role | Name | Value | Usage |
|------|------|-------|-------|
| Primary | {name} | {hex/rgb/tailwind class} | {where and when to use} |
| Secondary | {name} | {value} | {usage} |
| Accent | {name} | {value} | {usage} |
| Neutral | {name} | {value} | {usage} |
| Success | {name} | {value} | {success states, confirmations} |
| Warning | {name} | {value} | {warning states, caution} |
| Error | {name} | {value} | {error states, destructive actions} |
| Info | {name} | {value} | {informational states} |

### Typography

| Role | Font Family | Size | Weight | Line Height |
|------|-------------|------|--------|-------------|
| Display / Hero | {font} | {size} | {weight} | {lh} |
| Heading 1 | {font} | {size} | {weight} | {lh} |
| Heading 2 | {font} | {size} | {weight} | {lh} |
| Body | {font} | {size} | {weight} | {lh} |
| Small / Caption | {font} | {size} | {weight} | {lh} |
| Mono / Code | {font} | {size} | {weight} | {lh} |

### Spacing

- **Base unit**: {e.g., 4px / 0.25rem}
- **Scale**: {e.g., 4, 8, 12, 16, 24, 32, 48, 64, 96}
- **Component padding convention**: {e.g., use 16px (p-4) for cards, 12px (p-3) for buttons}
- **Section spacing convention**: {e.g., 64px (py-16) between page sections}

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Small | {value} | {inputs, badges} |
| Default | {value} | {cards, buttons} |
| Large | {value} | {modals, panels} |
| Full | 9999px | {avatars, pills} |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| Small | {value} | {dropdowns, tooltips} |
| Default | {value} | {cards, raised elements} |
| Large | {value} | {modals, floating panels} |

### Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| sm | {value} | {mobile landscape} |
| md | {value} | {tablet} |
| lg | {value} | {desktop} |
| xl | {value} | {wide desktop} |

## Component Patterns

{Document established patterns for common components. Include structure and class conventions, not full code listings. Focus on patterns that need to stay consistent.}

### Buttons

{Primary, secondary, ghost, destructive variants. Sizes. Icon placement conventions.}

### Forms

{Input styling, label placement, error message display, form layout approach.}

### Cards

{Standard card structure, header/body/footer conventions, hover states.}

### Navigation

{Primary nav pattern, mobile nav approach, breadcrumbs.}

### Modals & Dialogs

{Modal structure, overlay style, animation approach.}

### Tables & Lists

{Table styling, list patterns, empty states.}

## Layout Conventions

- **Max content width**: {e.g., 1280px / max-w-7xl}
- **Page structure**: {e.g., sidebar + main, top nav + content, dashboard layout}
- **Grid system**: {e.g., 12-column CSS grid, Tailwind grid classes}
- **Responsive strategy**: {e.g., mobile-first, specific breakpoint behaviors}

## Animation & Motion

- **Default transition duration**: {e.g., 150ms}
- **Easing function**: {e.g., ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)}
- **Page transitions**: {approach if applicable}
- **Hover / focus transitions**: {standard approach}
- **Loading states**: {skeleton, spinner, or shimmer pattern}
- **Animation philosophy**: {e.g., subtle and functional, expressive and playful}

## Accessibility

- **Target WCAG level**: {e.g., AA}
- **Focus styles**: {e.g., ring-2 ring-offset-2 ring-primary}
- **Color contrast**: {minimum ratios}
- **Screen reader conventions**: {sr-only usage, aria-label patterns}
- **Keyboard navigation**: {focus trap in modals, tab order expectations}

## Icons & Assets

- **Icon library**: {e.g., Heroicons outline 24px, Lucide}
- **Default icon size**: {e.g., 20px / w-5 h-5}
- **Image handling**: {lazy loading, aspect ratios, placeholder strategy}

## Theming

{If applicable -- dark mode approach, theme switching mechanism, CSS variable strategy, which tokens change between themes.}
