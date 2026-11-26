import { capabilities } from '@/content/capabilities';
import { credentials, jobs } from '@/content/experience';
import { getAllProjects, getFeaturedProjects } from '@/lib/projects';
import { getLatestPosts } from '@/sanity/api';
import { Hero } from '@/components/sections/Hero';
import { Statement } from '@/components/sections/Statement';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { ProjectIndex } from '@/components/sections/ProjectIndex';
import { Capabilities } from '@/components/sections/Capabilities';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Lab } from '@/components/sections/Lab';
import { Writing } from '@/components/sections/Writing';
import { Contact } from '@/components/sections/Contact';
import { SiteMotion } from '@/components/motion/SiteMotion';

/**
 * Home page — an async Server Component.
 * It runs at build time (static export): `await` here = data fetched once,
 * baked into HTML. Visitors never wait for Sanity.
 */
export default async function HomePage() {
  const posts = await getLatestPosts(6);

  return (
    <>
      <Hero />
      <Statement />
      <SelectedWork projects={getFeaturedProjects()} />
      <ProjectIndex projects={getAllProjects()} />
      <Capabilities groups={capabilities} />
      <About credentials={credentials} />
      <Experience jobs={jobs} />
      <Lab />
      <Writing posts={posts} />
      <Contact />
      <SiteMotion />
    </>
  );
}
