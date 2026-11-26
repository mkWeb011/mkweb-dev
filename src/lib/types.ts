/**
 * Domain types for the whole site.
 * Rule: components never invent their own shapes for content —
 * everything a component renders is described here first.
 */

export const PROJECT_TAGS = [
  'WordPress',
  'WooCommerce',
  'Webflow',
  'Next.js',
  'Migration',
  'Automation',
  'SEO',
  'Custom code',
] as const;

/** Union type derived from the array: 'WordPress' | 'WooCommerce' | ... */
export type ProjectTag = (typeof PROJECT_TAGS)[number];

export interface ApproachStep {
  title: string;
  description: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Hue (0–360) for the generated placeholder visual. */
  hue: number;
  /** Two-letter mark shown in the placeholder visual. */
  mark: string;
  featured: boolean;
  tags: ProjectTag[];
  summary: string;
  /** null = not confirmed yet → UI shows a "to confirm" marker. */
  client: string | null;
  engagement: string | null;
  period: string | null;
  role: string;
  overview: string;
  challenge: string | null;
  approach: ApproachStep[];
  delivered: string[];
  stack: string[] | null;
  /** Verified, documented outcomes only. Never invented metrics. */
  outcome: string[] | null;
  links: ProjectLink[];
}

export interface Job {
  years: string;
  dates: string;
  company: string;
  role: string;
  kind: string;
  highlights: string[];
}

export interface CapabilityItem {
  label: string;
  /** Where this skill was proven (project or role) — or 'Core' / 'Growing'. */
  proof: string;
}

export interface CapabilityGroup {
  title: string;
  /** Optional italic serif part of the title. */
  accent?: string;
  status: 'proven' | 'growing';
  items: CapabilityItem[];
}

export interface Credential {
  title: string;
  meta: string;
}

/** A blog topic that is planned but not written yet. */
export interface PlannedPost {
  title: string;
  mark: string;
  hue: number;
  related: string;
  topics: string[];
  excerpt: string;
}

/** A published post as returned by our GROQ query (see sanity/queries.ts). */
export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  categories: string[] | null;
  mainImage: SanityImage | null;
  /** Portable Text — an array of blocks. Only loaded on the post page. */
  body?: PortableTextBlock[];
}

/** Minimal shape of an image field coming from Sanity. */
export interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
}

/** Portable Text block — kept loose on purpose; the renderer validates it. */
export interface PortableTextBlock {
  _type: string;
  _key: string;
  [key: string]: unknown;
}
