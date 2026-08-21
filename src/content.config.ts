import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema per CLAUDE.md. Bad frontmatter fails the build instead of rendering wrong.
// The glob loader uses frontmatter `slug` as the entry id when present, so
// routes should be generated from `entry.id`.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    // optional human-readable range, e.g. "November – December 2025"; shown on
    // the detail page in place of the formatted date. `date` stays the sort key.
    period: z.string().optional(),
    // one sentence, should contain a number where possible
    summary: z.string(),
    tags: z.array(z.string()),
    stack: z.array(z.string()),
    // GitHub URL; `repo: none` (course work with no public repo) normalizes to undefined
    repo: z
      .string()
      .url()
      .or(z.literal('none'))
      .transform((r) => (r === 'none' ? undefined : r))
      .optional(),
    // optional provenance, e.g. "ECE 206 — Digital Logic Design"; most projects won't have it
    course: z.string().optional(),
    // optional muted text shown where the source link would go, e.g.
    // "Source withheld under course policy." Rendered only when repo is absent.
    source_note: z.string().optional(),
    featured: z.boolean(),
    // sort order on landing page
    order: z.number(),
    status: z.string(),
    // draft entries must never be rendered or linked
    draft: z.boolean().default(false),
    metrics: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { projects };
