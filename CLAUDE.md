# CLAUDE.md

Instructions for Claude Code working in this repo.

## What this is

Ehsan's personal portfolio site. Audience is hiring managers and engineers in
computer architecture, ML systems, and low-level performance work. The projects
are the point; everything else is packaging.

## Stack

- **Astro**, static output, no SSR
- Markdown content collections for projects
- Plain CSS or Tailwind — pick one and stay with it
- **No React unless something genuinely needs interactivity.** Nothing currently does.
- Deployed to **GitHub Pages** via GitHub Actions

## Deploy facts

- Repo is named `Ehsan-Ib.github.io`, so the site serves from the **root**:
  `https://ehsan-ib.github.io`
- Because it's root, **do not set a `base` path** in `astro.config.mjs`
- Pages source must be set to "GitHub Actions", not a branch
- A custom domain may be added later. Don't hardcode absolute URLs anywhere —
  use relative paths so the migration is a DNS change and nothing else.

## Site structure

Four page types. Resist adding more.

```
/                    Landing — who I am, 3 featured projects
/projects            Index of all projects
/projects/[slug]     Project detail (the actual content)
/about               Background, what I'm looking for
/contact             Email (obfuscated, never mailto/plain), GitHub, LinkedIn
```

No blog. No tag archive pages. No search.

## Content schema

Projects live in `src/content/projects/*.md`. Frontmatter:

```yaml
title: string
slug: string
date: date
summary: string          # one sentence, should contain a number where possible
tags: string[]
stack: string[]
repo: string             # GitHub URL
featured: boolean
order: number            # sort order on landing page
status: string
draft: boolean           # optional, defaults false
metrics:                 # optional
  - label: string
    value: string
```

Define this as a Zod schema in `src/content.config.ts` (Astro 5 content-layer
location) so bad frontmatter fails the build instead of rendering wrong. The
glob loader uses frontmatter `slug` as the entry id, so routes come from
`entry.id`. `repo: none` is valid and normalizes to undefined.

The project index and landing page must filter out `draft: true`.

## Current projects

Live:
1. `ternary-llm-kernel` — flagship, lead with it everywhere. Featured.
2. `cuda-flash-attention` — real writeup landed 2026-08-20 (from Ehsan's own
   file). Featured. Completion date in frontmatter is still a TODO placeholder.
3. `punc-lc3-processor` — featured.
4. `health-fitness-tracker` — not featured (Ehsan's call, 2026-08-20).

## Hard rules on content

- **Never invent or fill in a metric, benchmark number, or spec.** If a value is
  missing, leave the TODO and say so. Fabricated numbers on a portfolio are
  worse than absent ones, and this site's whole credibility rests on its
  numbers being real.
- Don't remove the honest-scoping sections (the "what this doesn't prove"
  parts). They are deliberate and they are the strongest thing on the site.
- Don't inflate claims. "1.24× faster on M4 Pro for these shapes" never becomes
  "faster than Microsoft's kernel."

## Design direction

<!-- TODO: replace this block with 2–3 sites whose look you want. Until then: -->

Decided (2026-08-20, with Ehsan):
- **Plain CSS**, not Tailwind. Tokens live in `src/styles/global.css`.
- **JetBrains Mono** for headings/code, **Inter** for body (self-hosted via
  @fontsource, no external font requests).
- Dark theme: bg `#111113`, text `#e6e6e6`, one accent — burnt orange
  `#d9722c` — used sparingly.

Restraint. This is a systems portfolio; the content is dense and technical, and
the design's job is to get out of its way.

**Do:**
- One good typeface, generously sized. Monospace for headings is fine and fits.
- Real whitespace. Narrow measure (~65ch) for body text.
- One accent colour, used sparingly.
- Let the technical content be the visual interest.

**Do not** — these read as generated and are the default failure mode:
- Gradient hero sections
- Purple/blue gradient accents
- Glassmorphism, frosted cards, heavy shadows
- An emoji or icon beside every heading
- Animated counters, typewriter effects, scroll-triggered fades
- Vague marketing copy ("passionate about pushing boundaries")

## Things that actually break

The project markdown contains **tables, fenced code blocks, and images**. These
are not decorative — they carry the content. Verify all three render correctly
before considering any page done.

- **Tables** are the main risk. Some have six columns. Unstyled `<table>` looks
  broken, and on mobile it overflows. Handle overflow deliberately.
- **Code blocks** need a syntax theme and horizontal scroll, not wrapping.
- The **roofline plot** in the BitNet project should render inline on the page.
  It's the best image on the site.
- **Mobile matters** — links get opened on phones. Test the BitNet page at
  375px width specifically.

## Build order

Build `/projects/ternary-llm-kernel` **first**, with its real content in place.
It's the longest and most complex page — tables, code, image, metrics block. If
the layout survives that page, every other page is easy. Don't start with the
landing page.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build to ./dist
npm run preview  # preview the build
```

## Still needed from Ehsan

These are blockers Claude Code cannot resolve alone — ask rather than invent:

- One-line self-description for the landing page
- About page copy
- Contact method (and how obfuscated the email should be)
- Whether a resume PDF gets linked
- Design reference sites
