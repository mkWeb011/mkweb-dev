import { defineField, defineType } from 'sanity';

/** A blog category — like a WordPress category, but you design the fields. */
export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
  ],
});
