import Link from 'next/link';
import type { CSSProperties } from 'react';
import { formatDate } from '@/lib/format';
import type { PlannedPost, Post } from '@/lib/types';
import { urlFor } from '@/sanity/image';

/** Decorative wave lines, deterministic per index (same output on server and client). */
function WaveArt({ seed, hue }: { seed: number; hue: number }) {
  const lines = Array.from({ length: 14 }, (_, k) => {
    const y = 20 + k * 14;
    const a = 18 + ((seed * 7 + k * 5) % 26);
    return (
      <path
        key={k}
        d={`M0 ${y} C 120 ${y - a}, 240 ${y + a}, 400 ${y}`}
        fill="none"
        stroke={`hsl(${hue} 30% 70% / ${(0.08 + k * 0.012).toFixed(3)})`}
        strokeWidth="1"
      />
    );
  });
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true">
      {lines}
    </svg>
  );
}

/**
 * A discriminated union: the card renders EITHER a published post OR a
 * planned topic. The `kind` field tells TypeScript which one it has.
 */
type CardProps =
  | { kind: 'post'; post: Post; index: number }
  | { kind: 'planned'; post: PlannedPost; index: number; relatedName?: string };

const HUES = [30, 200, 150, 330, 45, 220];

export function PostCard(props: CardProps) {
  const { index } = props;

  if (props.kind === 'planned') {
    const { post, relatedName } = props;
    return (
      <article className="post">
        <div className="post-vis" style={{ '--h': post.hue } as CSSProperties}>
          <WaveArt seed={index} hue={post.hue} />
          <span className="pmark" aria-hidden="true">
            {post.mark}
          </span>
        </div>
        <div className="post-meta mono">
          <span className="badge">Planned</span>
          <span>{post.topics.join(' · ')}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        {relatedName && (
          <Link className="rel mono" href={`/work/${post.related}/`}>
            Related case — {relatedName} <span aria-hidden="true">→</span>
          </Link>
        )}
      </article>
    );
  }

  // Published post from Sanity
  const { post } = props;
  const hue = HUES[index % HUES.length] ?? 30;
  return (
    <article className="post">
      <Link href={`/blog/${post.slug}/`} className="post-vis" style={{ '--h': hue } as CSSProperties}>
        {post.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export: Sanity CDN does the optimisation
          <img
            src={urlFor(post.mainImage).width(900).height(560).url()}
            alt={post.mainImage.alt ?? ''}
            width={900}
            height={560}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            <WaveArt seed={index} hue={hue} />
            <span className="pmark" aria-hidden="true">
              {post.title.slice(0, 2)}
            </span>
          </>
        )}
      </Link>
      <div className="post-meta mono">
        <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
        <span>{(post.categories ?? []).join(' · ')}</span>
      </div>
      <h3>
        <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
      </h3>
      {post.excerpt && <p>{post.excerpt}</p>}
    </article>
  );
}
