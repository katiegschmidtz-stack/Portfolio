// Tells Astro where the case studies live and what details each one needs.
// Every Markdown file in src/content/case-studies becomes its own page.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    // One or two sentences shown on cards and at the top of the page.
    summary: z.string(),
    role: z.string(),
    timeframe: z.string(),
    tags: z.array(z.string()).default([]),
    // Set to true to show this case study in the big "Featured" slot on the home page.
    featured: z.boolean().default(false),
    // Lower numbers appear first.
    order: z.number().default(100),
    // Hide a case study from the site while you're still writing it.
    draft: z.boolean().default(false),
  }),
});

export const collections = { caseStudies };
