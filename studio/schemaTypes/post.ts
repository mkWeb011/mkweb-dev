import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Blog post. Field names here are exactly what GROQ queries read
 * in web/src/sanity/queries.ts — rename one side, rename the other.
 */
export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'URL part: /blog/<slug>/. Click "Generate" after writing the title.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences. Used on cards and as the meta description.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Posts without a date are drafts for the website (not built).',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for screen readers and search engines.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', date: 'publishedAt', media: 'mainImage' },
    prepare: ({ title, date, media }) => ({
      title,
      subtitle: date ? new Date(date).toLocaleDateString('en-GB') : 'Not published',
      media,
    }),
  },
});
