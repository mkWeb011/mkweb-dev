import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock, SanityImage } from '@/lib/types';
import { urlFor } from '@/sanity/image';

/**
 * Renders Sanity's Portable Text (rich text stored as JSON, not HTML).
 * We decide how each block type becomes HTML — editors cannot inject
 * arbitrary markup, and the design stays consistent.
 * Think of it as `the_content()` with your own, strict filter.
 */
const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="pt-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="pt-h3">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="pt-quote">{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === 'string' ? value.href : '#';
      const external = href.startsWith('http');
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      );
    },
    code: ({ children }) => <code className="pt-code">{children}</code>,
  },
  types: {
    image: ({ value }: { value: SanityImage }) => (
      <figure className="pt-figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlFor(value).width(1400).url()} alt={value.alt ?? ''} loading="lazy" />
        {value.alt && <figcaption className="mono muted">{value.alt}</figcaption>}
      </figure>
    ),
    code: ({ value }: { value: { code?: string; language?: string } }) => (
      <pre className="pt-pre" data-language={value.language}>
        <code>{value.code}</code>
      </pre>
    ),
  },
};

export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="pt">
      <PortableText value={value} components={components} />
    </div>
  );
}
