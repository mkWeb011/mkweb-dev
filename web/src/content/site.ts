/**
 * Site-wide settings. One place to change contact details, the Meet link
 * and SEO defaults — like WordPress "Settings → General", but in code.
 */
export const site = {
  name: 'Marko Kostić',
  role: 'Independent Web Engineer',
  location: 'Belgrade, Serbia — Remote, CET',
  timeZone: 'Europe/Belgrade',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mkweb-dev.com',
  description:
    'Independent web engineer in Belgrade. 9+ years building WordPress and Webflow sites, headless CMS on Next.js, and the CI/CD and hosting behind them — for agencies and clients in the US, EU, UK, Canada and the UAE.',

  /** Your permanent Google Meet link (Calendar → event → copy Meet link). */
  meetUrl: 'https://meet.google.com/',
  available: true,
  currently: 'IT Consultant at Zignify',

  /**
   * Where the "Start a project" form POSTs: the Cloudflare Worker in
   * web/worker/index.ts. Every other URL is served as a static file.
   * Locally: `npm run build && npx wrangler dev` (plain `next dev` has no Worker).
   */
  inquiryEndpoint: '/api/inquiry',

  email: 'mk011web@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mkweb/',
  github: '',

  nav: [
    { href: '/#work', label: 'Work' },
    { href: '/#capabilities', label: 'Capabilities' },
    { href: '/#about', label: 'About' },
    { href: '/#experience', label: 'Experience' },
    { href: '/blog/', label: 'Writing' },
    { href: '/#contact', label: 'Contact' },
  ],

  menu: [
    { href: '/#top', label: 'Home' },
    { href: '/#work', label: 'Selected', accent: 'work' },
    { href: '/#archive', label: 'Index' },
    { href: '/#capabilities', label: 'Capabilities' },
    { href: '/#about', label: 'About' },
    { href: '/#experience', label: 'Experience' },
    { href: '/blog/', label: '', accent: 'Writing' },
    { href: '/#start', label: 'Start a', accent: 'project' },
    { href: '/#contact', label: 'Contact' },
  ],
} as const;

export type Site = typeof site;
