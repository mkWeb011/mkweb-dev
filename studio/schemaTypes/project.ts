import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Case study / project. Mirrors the `Project` type in web/src/lib/types.ts.
 * Field names are the contract with web/src/sanity/queries.ts (PROJECTS_QUERY):
 * rename one side, rename the other.
 *
 * Fields are grouped into tabs so the editor stays calm on a phone.
 */

/** Keep in sync with PROJECT_TAGS in web/src/lib/types.ts. */
const TAGS = ['WordPress', 'WooCommerce', 'Webflow', 'Next.js', 'Migration', 'Automation', 'SEO', 'Custom code'];

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'card', title: 'Card', default: true },
    { name: 'case', title: 'Case study' },
    { name: 'visual', title: 'Visual' },
  ],
  fields: [
    // ---- Card: what the home page list needs ------------------------------
    defineField({
      name: 'name',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'card',
      description: 'URL part: /work/<slug>/. Click "Generate" after writing the name. Do not change after launch.',
      options: { source: 'name', maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      group: 'card',
      description: 'Position in lists. 1 = first. Leave gaps (10, 20, 30) so you can slot projects in later.',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'card',
      description: 'Show in "Selected case studies" on the home page (keep 5–8 featured).',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: TAGS.map((t) => ({ title: t, value: t })), layout: 'grid' },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      group: 'card',
      description: 'One or two sentences. Also used as the meta description.',
      validation: (rule) => rule.required().min(20).max(240),
    }),

    // ---- Case study --------------------------------------------------------
    defineField({ name: 'client', type: 'string', group: 'case', description: 'Leave empty → "to confirm".' }),
    defineField({ name: 'engagement', type: 'string', group: 'case' }),
    defineField({ name: 'period', type: 'string', group: 'case', description: 'e.g. "May 2025 — Present".' }),
    defineField({ name: 'role', title: 'My role', type: 'string', group: 'case', validation: (r) => r.required() }),
    defineField({
      name: 'overview',
      type: 'text',
      rows: 5,
      group: 'case',
      validation: (rule) => rule.required().min(20),
    }),
    defineField({ name: 'challenge', type: 'text', rows: 5, group: 'case' }),
    defineField({
      name: 'approach',
      type: 'array',
      group: 'case',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'delivered',
      title: 'What I delivered',
      type: 'array',
      group: 'case',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: 'stack', type: 'array', group: 'case', of: [defineArrayMember({ type: 'string' })] }),
    defineField({
      name: 'outcome',
      title: 'Verified outcomes',
      type: 'array',
      group: 'case',
      description: 'Only documented, verifiable results. No invented numbers.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'links',
      type: 'array',
      group: 'case',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'link',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (r) => r.required().uri({ scheme: ['https', 'http'] }),
            }),
          ],
        }),
      ],
    }),

    // ---- Visual ------------------------------------------------------------
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      group: 'visual',
      description: 'Screenshot, 16:10, at least 1600px wide. Empty → the generated visual is used.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'hue',
      type: 'number',
      group: 'visual',
      description: 'Colour of the generated visual, 0–360 (210 = blue, 150 = green).',
      initialValue: 210,
      validation: (rule) => rule.min(0).max(360),
    }),
    defineField({
      name: 'mark',
      type: 'string',
      group: 'visual',
      description: 'Two letters in the generated visual. Empty → initials of the name.',
      validation: (rule) => rule.max(3),
    }),
  ],
  orderings: [{ title: 'Site order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', order: 'order', featured: 'featured', media: 'cover' },
    prepare: ({ title, order, featured, media }: { title?: string; order?: number; featured?: boolean; media?: unknown }) => ({
      title,
      subtitle: `${order ?? '–'}${featured ? ' · ★ featured' : ''}`,
      media,
    }),
  },
});
