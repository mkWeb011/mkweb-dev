import type { InquiryStep } from '@/lib/inquiry';

/**
 * The "Start a project" questionnaire — content only, no logic.
 * Change wording, options or budget brackets here; the form in the browser
 * AND the Cloudflare Worker that receives it (worker/index.ts) read from
 * this file, so client and server validation can never drift apart.
 */
export const INQUIRY_FORM_NAME = 'project-inquiry';

export const inquirySteps: InquiryStep[] = [
  {
    id: 'scope',
    label: 'Scope',
    title: 'What are we',
    accent: 'building?',
    fields: [
      {
        name: 'services',
        kind: 'multi',
        label: 'What do you need?',
        hint: 'Pick everything that applies.',
        required: true,
        options: [
          { value: 'New website', note: 'From brief or Figma to launch' },
          { value: 'Redesign', note: 'Keep content, rebuild the experience' },
          { value: 'Migration', note: 'Wix, Drupal, WordPress, Webflow…' },
          { value: 'Headless / Next.js', note: 'CMS behind a fast frontend' },
          { value: 'Web app', note: 'Node, Express, MongoDB, React' },
          { value: 'E-commerce', note: 'WooCommerce or headless' },
          { value: 'SEO & performance', note: 'Core Web Vitals, technical SEO' },
          { value: 'Hosting & care', note: 'CI/CD, servers, updates, backups' },
        ],
      },
    ],
  },
  {
    id: 'shape',
    label: 'Shape',
    title: 'The',
    accent: 'shape of it',
    fields: [
      {
        name: 'platform',
        kind: 'single',
        label: 'Platform or CMS',
        required: true,
        options: [
          { value: 'WordPress' },
          { value: 'Webflow' },
          { value: 'Headless CMS + Next.js' },
          { value: 'Custom app' },
          { value: 'Not sure — recommend one' },
        ],
      },
      {
        name: 'pages',
        kind: 'single',
        label: 'Roughly how many pages?',
        required: true,
        options: [{ value: '1–5' }, { value: '6–15' }, { value: '16–40' }, { value: '40+' }, { value: 'Not sure' }],
      },
      {
        name: 'extras',
        kind: 'multi',
        label: 'Also needed',
        options: [
          { value: 'Multilingual' },
          { value: 'Booking or payments' },
          { value: 'CRM & email integrations' },
          { value: 'Animation & 3D' },
          { value: 'Content migration' },
          { value: 'Programmatic SEO pages' },
        ],
      },
      { name: 'currentSite', kind: 'url', label: 'Current website', autoComplete: 'url' },
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    title: 'Budget &',
    accent: 'timing',
    fields: [
      {
        name: 'budget',
        kind: 'single',
        label: 'Budget range',
        hint: 'A range helps me suggest the right scope — not a commitment.',
        required: true,
        // Brackets are yours to tune — they shape who contacts you.
        options: [
          { value: 'Under €3k' },
          { value: '€3k–8k' },
          { value: '€8k–15k' },
          { value: '€15k+' },
          { value: 'Not sure yet' },
        ],
      },
      {
        name: 'timeline',
        kind: 'single',
        label: 'Ideal start',
        required: true,
        options: [{ value: 'As soon as possible' }, { value: 'In 1–3 months' }, { value: 'In 3+ months' }, { value: 'Flexible' }],
      },
    ],
  },
  {
    id: 'you',
    label: 'You',
    title: 'About',
    accent: 'you',
    fields: [
      { name: 'name', kind: 'text', label: 'Your name', required: true, autoComplete: 'name' },
      { name: 'email', kind: 'email', label: 'Email', required: true, autoComplete: 'email' },
      { name: 'company', kind: 'text', label: 'Company', autoComplete: 'organization' },
      {
        name: 'message',
        kind: 'textarea',
        label: 'Tell me about the project',
        hint: 'Goals, audience, what exists today, sites you like.',
        required: true,
      },
    ],
  },
];
