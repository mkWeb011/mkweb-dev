import { capabilities } from '@/content/capabilities';
import { credentials, jobs } from '@/content/experience';
import { getFeaturedProjects } from '@/lib/projects';
import { getProjects } from '@/lib/project-repository';
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
import { StartProject } from '@/components/sections/StartProject';
import { Contact } from '@/components/sections/Contact';
import { SiteMotion } from '@/components/motion/SiteMotion';

/**
 * Home page — an async Server Component.
 * It runs at build time (static export): `await` here = data fetched once,
 * baked into HTML. Visitors never wait for Sanity.
 */
export default async function HomePage() {
  // Both requests start at once; await waits for the slower one.
  const [posts, projects] = await Promise.all([getLatestPosts(6), getProjects()]);

  return (
    <>
      <Hero />
      <Statement />
      <SelectedWork projects={getFeaturedProjects(projects)} />
      <ProjectIndex projects={projects} />
      <Capabilities groups={capabilities} />
      <About credentials={credentials} />
      <Experience jobs={jobs} />
      <Lab />
      <Writing posts={posts} projects={projects} />
      <StartProject />
      <Contact />
      <SiteMotion />
    </>
  );
}
