import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/format';
import { getPostBySlug, getPostSlugs, PLACEHOLDER_SLUG } from '@/sanity/api';
import { urlFor } from '@/sanity/image';
import { PostBody } from '@/components/blog/PostBody';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/** Runs at build time: one static HTML page per published post. */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  // Static export fails on an empty list — see PLACEHOLDER_SLUG in sanity/api.ts.
  return (slugs.length ? slugs : [PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) return { title: 'Writing — coming soon', robots: { index: false } };
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const image = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  if (slug === PLACEHOLDER_SLUG) {
    return (
      <article className="post-page">
        <p className="mono muted">Writing</p>
        <h1>First articles are on the way.</h1>
        <p className="post-lead">
          Planned topics are listed on the <Link href="/blog/">blog page</Link>.
        </p>
      </article>
    );
  }

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="post-page">
      <Link className="pill" href="/blog/">
        ← All writing
      </Link>
      <p className="mono muted post-meta-line">
        <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
        {post.categories?.length ? ` · ${post.categories.join(' · ')}` : ''}
      </p>
      <h1>{post.title}</h1>
      {post.excerpt && <p className="post-lead">{post.excerpt}</p>}
      {post.mainImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="post-hero"
          src={urlFor(post.mainImage).width(1600).height(900).url()}
          alt={post.mainImage.alt ?? ''}
          width={1600}
          height={900}
        />
      )}
      {post.body && <PostBody value={post.body} />}
    </article>
  );
}
