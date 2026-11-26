import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getAllProjects } from '@/lib/projects';
import { getAllPosts } from '@/sanity/api';

// Static export: generate sitemap.xml once at build time.
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, '');
  const posts = await getAllPosts();

  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/blog/`, changeFrequency: 'weekly', priority: 0.7 },
    ...getAllProjects().map((p) => ({
      url: `${base}/work/${p.slug}/`,
      changeFrequency: 'yearly' as const,
      priority: p.featured ? 0.8 : 0.5,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}/`,
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
