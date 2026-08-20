# ehsan-ib.github.io

Personal portfolio. Astro, static output, deployed to GitHub Pages via Actions.

Read `CLAUDE.md` for the full spec before changing anything.

## Adding a project

Drop a markdown file in `src/content/projects/`. Frontmatter is validated by the
Zod schema in `src/content.config.ts` — bad frontmatter fails the build. Set
`draft: true` to keep an entry off the site.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to ./dist
npm run preview  # preview the build
```
