import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Rich text for posts (Portable Text). Every option allowed here must have
 * a renderer in web/src/components/blog/PostBody.tsx — and nothing else
 * can appear in the content. That is the contract between editor and site.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) => rule.uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required() }),
      ],
    }),
    defineArrayMember({
      name: 'code',
      title: 'Code block',
      type: 'object',
      fields: [
        defineField({
          name: 'language',
          type: 'string',
          options: { list: ['php', 'javascript', 'typescript', 'tsx', 'css', 'bash', 'json', 'groq'] },
        }),
        defineField({ name: 'code', type: 'text', rows: 10 }),
      ],
      preview: {
        select: { language: 'language', code: 'code' },
        prepare: ({ language, code }: { language?: string; code?: string }) => ({
          title: `Code (${language ?? 'text'})`,
          subtitle: (code ?? '').slice(0, 60),
        }),
      },
    }),
  ],
});
