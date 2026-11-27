import type { Credential, Job } from '@/lib/types';

/** Work history, newest first. Source: CV (2026). */
export const jobs: Job[] = [
  {
    years: '2025—Now',
    dates: 'May 2025 – Present',
    company: 'Zignify',
    role: 'IT Consultant — Web Development, Automation & SEO',
    kind: 'Contract · Germany, remote',
    highlights: [
      'Own the web stack end to end: domains, DNS, server administration and security, plus full-stack WordPress',
      'Built a content engine that turns ClickUp tasks into AI-generated, SEO-ready articles published to WordPress automatically',
      'AI-assisted automations and programmatic SEO page systems backed by indexing, schema and Core Web Vitals work',
      'GoHighLevel (CRM, funnels, workflows) and Klaviyo (email flows, segmentation)',
    ],
  },
  {
    years: '2025—26',
    dates: 'Mar 2025 – Sep 2026',
    company: 'Social Hype',
    role: 'IT Consultant — Lead Web Developer',
    kind: 'Contract (completed) · Toronto & Dubai, remote',
    highlights: [
      'Led all web development for the agency and its Canadian and UAE clients — scoping, build, launch, structured handover',
      'WordPress (Elementor, WooCommerce) and Webflow builds from Figma — CMS, Interactions, SEO',
      'Owned performance, technical SEO and tracking: Core Web Vitals, schema, GA4, GTM, Meta Pixel',
      'Hosting, DNS, SSL and deployments; technical point of contact for clients and marketing',
    ],
  },
  {
    years: '2023—26',
    dates: '2023 – 2026',
    company: 'Independent',
    role: 'Freelance Full-Stack Web Developer',
    kind: 'Part-time / contract · Serbia & USA clients',
    highlights: [
      'Lumina Lumière Institute — Next.js course and membership platform, Vercel, MailerLite, GA4, SEO and AEO/GEO',
      'Osenity — custom WooCommerce bookstore, import add-on, filtering, Balkan payment gateway; mentored a junior developer',
      'Swan Learning Center — Wix to WordPress migration, HubSpot and GoHighLevel, 301 redirect plan, rankings preserved',
      'Santos Digital — front-end rebuild of the agency website and maintenance',
    ],
  },
  {
    years: '2024—25',
    dates: 'Mar 2024 – Feb 2025',
    company: 'Smart Web Serbia',
    role: 'Lead WordPress & WooCommerce Developer',
    kind: 'Full-time · Belgrade',
    highlights: [
      'Led WordPress and WooCommerce development for client e-commerce stores, from custom features to launch',
      'Maintained and optimised stores: updates, performance, security and backups',
      'E-commerce administration — products, orders, payments, shipping — and web/IT support for clients',
    ],
  },
  {
    years: '2023—24',
    dates: 'Aug 2023 – Sep 2024',
    company: 'hello:here',
    role: 'Full-Stack WordPress Developer',
    kind: 'Contract · Palma, Spain, remote',
    highlights: [
      'Custom WordPress themes, reusable Elementor templates and custom Gutenberg blocks',
      'WordPress as a headless CMS with Gatsby/React front ends and third-party APIs',
      'WooCommerce features and a custom payment gateway integration',
      'Deployment and DevOps on Ubuntu; set up the blog and coordinated content writers',
    ],
  },
  {
    years: '2022—23',
    dates: 'Jun 2022 – Sep 2023',
    company: 'Bullshark Studio',
    role: 'Full-Stack WordPress Developer',
    kind: 'Part-time · Birkirkara, Malta, remote',
    highlights: [
      'Custom WordPress themes and Gutenberg blocks for agency clients',
      'Web apps with WordPress as a headless CMS and React; third-party API integrations',
      'Security updates and Ubuntu server maintenance',
    ],
  },
  {
    years: '2020—23',
    dates: 'Jan 2020 – Jun 2023',
    company: 'newtarget, inc.',
    role: 'Web Developer & DevOps Engineer',
    kind: 'Full-time · Washington, DC, remote',
    highlights: [
      'Custom WordPress themes, templates and plugins for association and enterprise clients',
      'Large Drupal to WordPress migrations — including IDSA',
      'DevOps: CI/CD pipelines, deployments and security updates',
    ],
  },
  {
    years: '2017—19',
    dates: 'Aug 2017 – Dec 2019',
    company: 'IZZZY',
    role: 'Full-Stack Developer & UI/UX Designer',
    kind: 'Full-time · Belgrade',
    highlights: [
      'Designed and built a full-stack networking web app (NFT/blockchain) in Next.js',
      'Discord and Telegram bot integrations; technical documentation and project scope',
      'UI/UX design; represented the product at community meetups',
    ],
  },
];

export const credentials: Credential[] = [
  { title: 'Certified Web Professional — Site Designer (CWP)', meta: 'LINK group · 2019 · ID 021277' },
  { title: 'Certified Developer for Microsoft Web Technologies', meta: 'LINK group · 2017 · ID 018400' },
  { title: 'Web Development Program', meta: 'ITAcademy, LINK group · Belgrade' },
  { title: 'High School of Computer Construction', meta: 'Belgrade · 2007 — 2011' },
];
