import type { NextConfig } from 'next';

/**
 * Static export: `next build` writes plain HTML/CSS/JS to `out/`.
 * No Node server at runtime → free hosting anywhere (Netlify, Cloudflare Pages).
 * Trade-off: no ISR, no API routes, no proxy.ts. Content updates = rebuild
 * (triggered by a Sanity webhook → Netlify build hook).
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // /work/zignify/ → out/work/zignify/index.html
  reactStrictMode: true,
  images: {
    // The Next image optimizer needs a server. Sanity's CDN already resizes
    // and converts images, so we build URLs with @sanity/image-url instead.
    unoptimized: true,
  },
};

export default nextConfig;
