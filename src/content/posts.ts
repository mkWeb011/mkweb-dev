import type { PlannedPost } from '@/lib/types';

/** Planned blog topics — shown (labelled "Planned") until Sanity has real posts. */
export const plannedPosts: PlannedPost[] = [
  {
    title: 'Drupal to WordPress without losing structure',
    mark: 'Dr→Wp',
    hue: 205,
    related: 'idsa',
    topics: ['Migration', 'ACF'],
    excerpt:
      'Why the content model comes before the move — and how ACF keeps 100+ migrated pages consistent and editable.',
  },
  {
    title: 'An SEO-safe Wix to WordPress migration',
    mark: '301',
    hue: 200,
    related: 'swan-learning-center',
    topics: ['Migration', 'SEO'],
    excerpt:
      'Redirect maps, form tracking and the checks that keep rankings intact when a small business changes platform.',
  },
  {
    title: 'From ClickUp task to published post',
    mark: 'Ai',
    hue: 150,
    related: 'zignify',
    topics: ['Automation', 'WordPress'],
    excerpt:
      'Designing a content engine that turns a task into an SEO-ready article — and where humans still need to stay in the loop.',
  },
  {
    title: 'Building a booking system on WooCommerce from scratch',
    mark: 'Wc',
    hue: 24,
    related: 'mc-adventure',
    topics: ['WooCommerce', 'PHP'],
    excerpt:
      "When a booking plugin isn't the right fit, and what it takes to sell experiences through a normal store checkout.",
  },
  {
    title: 'AEO and GEO: being citable by AI search',
    mark: 'Geo',
    hue: 40,
    related: 'lumina-lumiere',
    topics: ['SEO', 'AI search'],
    excerpt:
      'What changes when answers come from AI engines instead of ten blue links — structure, schema and clarity.',
  },
  {
    title: 'Figma to Webflow handovers clients can run',
    mark: 'Wf',
    hue: 330,
    related: 'social-hype',
    topics: ['Webflow', 'Process'],
    excerpt: 'CMS collections, naming and documentation that let a client edit their site without breaking it.',
  },
];
