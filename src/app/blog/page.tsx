import type { Metadata } from 'next';
import { plannedPosts } from '@/content/posts';
import { getProjectBySlug } from '@/lib/projects';
import { getAllPosts } from '@/sanity/api';
import { PostCard } from '@/components/blog/PostCard';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes from real builds: WordPress, WooCommerce, Webflow, migrations, technical SEO and automation.',
  alternates: { canonical: '/blog/' },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const live = posts.length > 0;

  return (
    <section className="blog blog-page" aria-labelledby="blog-title">
      <p className="mono muted">Writing</p>
      <h1 id="blog-title">
        Notes from the <span className="serif">build</span>
      </h1>
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
      {!live && (
        <p className="blog-note mono">First articles in preparation — topics above are planned, not yet published.</p>
      )}
    </section>
  );
}
