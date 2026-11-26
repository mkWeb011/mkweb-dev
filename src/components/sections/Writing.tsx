import Link from 'next/link';
import { plannedPosts } from '@/content/posts';
import { getProjectBySlug } from '@/lib/projects';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/blog/PostCard';
import { SectionHead } from '@/components/ui/SectionHead';

/**
 * Home-page blog teaser. Receives published posts from the page
 * (fetched at build time). No posts yet → planned topics, clearly labelled.
 */
export function Writing({ posts }: { posts: Post[] }) {
  const live = posts.length > 0;

  return (
    <section className="blog" id="writing" aria-labelledby="blog-h">
      <SectionHead
        index="07 / Writing"
        title="Notes from the"
        accent="build"
        aside="Blog · powered by Sanity"
        id="blog-h"
      />
      <div className="posts">
        {live
          ? posts.map((post, i) => <PostCard key={post._id} kind="post" post={post} index={i} />)
          : plannedPosts.map((post, i) => (
              <PostCard
                key={post.title}
                kind="planned"
                post={post}
                index={i}
                relatedName={getProjectBySlug(post.related)?.name}
              />
            ))}
      </div>
      <p className="blog-note mono">
        <span>
          {live ? 'Latest articles' : 'First articles in preparation — topics below are planned, not yet published.'}
        </span>
        {live && <Link href="/blog/">All articles →</Link>}
      </p>
    </section>
  );
}
