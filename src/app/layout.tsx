import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import '@/styles/tokens.css';
import './globals.css';

/*
 * next/font downloads the fonts at BUILD time and serves them from our own
 * domain: no request to Google from the visitor's browser (faster, GDPR-
 * friendly) and no layout shift (size-adjusted fallback fonts).
 * `variable` exposes each font as a CSS custom property.
 */
const sans = Inter_Tight({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono', display: 'swap' });

/** Default <head> metadata for every page; pages can override any field. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#131313',
  colorScheme: 'dark',
};

/** Structured data: tells search and AI engines who this site is about. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  image: `${site.url}/images/marko-kostic.webp`,
  email: `mailto:${site.email}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Belgrade', addressCountry: 'RS' },
  sameAs: [site.linkedin, site.github].filter(Boolean),
  knowsAbout: ['WordPress', 'WooCommerce', 'Webflow', 'Next.js', 'Headless CMS', 'Sanity', 'CI/CD', 'Technical SEO', 'Programmatic SEO', 'Website migrations'],
};

/*
 * Runs before first paint. Hides the hero text only while motion libraries
 * boot (removed by SiteMotion, or after 4 s as a safety net). Without it
 * the text would flash visible → hidden → animated in.
 */
const motionGuard = `(function(d){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-pending');setTimeout(function(){d.classList.remove('motion-pending')},4000)}}catch(e){}})(document.documentElement)`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script adds a class to <html>
    // before React hydrates — expected, so we silence that one warning.
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGuard }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
