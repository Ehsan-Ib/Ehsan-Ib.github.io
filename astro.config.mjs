// @ts-check
import { defineConfig } from 'astro/config';

// Repo is Ehsan-Ib.github.io → served from the root. No `base` path (see CLAUDE.md).
// If a custom domain is added later, `site` is the only line that changes.
export default defineConfig({
  site: 'https://ehsan-ib.github.io',
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
    },
  },
});
