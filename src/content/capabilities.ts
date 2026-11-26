import type { CapabilityGroup } from '@/lib/types';

/**
 * Skills grouped by what they let a client achieve.
 * `proof` points to where the skill was actually used — honesty as a feature.
 * Move an item from the `growing` group to a proven one once a case study backs it.
 */
export const capabilities: CapabilityGroup[] = [
  {
    title: 'Build',
    status: 'proven',
    items: [
      { label: 'Custom WordPress themes & templates', proof: 'Core' },
      { label: 'Custom Gutenberg blocks', proof: 'Intelsat' },
      { label: 'Elementor Pro, Bricks, Divi', proof: 'Core' },
      { label: 'WooCommerce — themes, features, booking', proof: 'MC Adventure' },
      { label: 'ACF content architecture', proof: 'IDSA' },
      { label: 'Custom plugins & add-ons', proof: 'Osenity' },
    ],
  },
  {
    title: 'Headless',
    status: 'proven',
    items: [
      { label: 'Next.js, React, Gatsby', proof: 'Lumina' },
      { label: 'Headless WordPress & APIs', proof: 'hello:here' },
      { label: 'Sanity — schemas, GROQ, Portable Text', proof: 'This site' },
      { label: 'Static & server rendering, metadata, sitemaps', proof: 'This site' },
      { label: 'TypeScript', proof: 'This site' },
    ],
  },
  {
    title: 'Frontend',
    status: 'proven',
    items: [
      { label: 'Figma to WordPress & Webflow', proof: 'Social Hype' },
      { label: 'Webflow — CMS, Interactions', proof: 'Kudanil' },
      { label: 'GSAP, Three.js & site motion', proof: 'Core' },
      { label: 'HTML, SCSS, Tailwind, JS (ES6+)', proof: 'Core' },
    ],
  },
  {
    title: 'Migrate',
    status: 'proven',
    items: [
      { label: 'Drupal → WordPress', proof: 'IDSA' },
      { label: 'Wix → WordPress', proof: 'Swan' },
      { label: 'SEO migration & 301 redirects', proof: 'Swan' },
      { label: 'Payment gateway integrations', proof: 'Osenity' },
    ],
  },
  {
    title: 'Grow',
    status: 'proven',
    items: [
      { label: 'Technical SEO & Core Web Vitals', proof: 'Core' },
      { label: 'AEO / GEO — AI search visibility', proof: 'Lumina' },
      { label: 'Programmatic SEO & schema', proof: 'Zignify' },
      { label: 'GA4, GTM, Meta Pixel, Search Console', proof: 'Social Hype' },
      { label: 'Google Ads, Meta Ads, Semrush', proof: 'CV' },
    ],
  },
  {
    title: 'Automate',
    status: 'proven',
    items: [
      { label: 'AI content engine — ClickUp → WordPress', proof: 'Zignify' },
      { label: 'HubSpot & GoHighLevel', proof: 'Swan' },
      { label: 'Klaviyo email flows', proof: 'Zignify' },
      { label: 'MailerLite automations', proof: 'Lumina' },
    ],
  },
  {
    title: 'DevOps',
    status: 'proven',
    items: [
      { label: 'CI/CD — GitHub Actions, preview deploys', proof: 'This site' },
      { label: 'Git, Vercel, Netlify, DeployBot', proof: 'newtarget' },
      { label: 'Hosting — Ubuntu / Linux, Nginx, Apache', proof: 'Core' },
      { label: 'Domains, DNS, CDN, SSL', proof: 'Core' },
      { label: 'Email — SPF, DKIM, DMARC', proof: 'Core' },
      { label: 'Security hardening & backups', proof: 'Core' },
    ],
  },
  {
    title: '',
    accent: 'Next',
    status: 'growing',
    items: [
      { label: 'Full-stack JS — Node.js, Express, MongoDB', proof: 'Growing' },
      { label: 'Webflow + Next.js — DevLink, Webflow Cloud', proof: 'Growing' },
      { label: 'Programmatic SEO at scale on Next.js', proof: 'Growing' },
      { label: 'Application architecture & APIs', proof: 'Growing' },
    ],
  },
];
