# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/), versions: [SemVer](https://semver.org/).

## [1.4.0] — 2026-11

### Changed
- **Hosting moved from Netlify to Cloudflare Workers** (static assets). Static requests are free and unlimited, so blog and SEO traffic no longer count against a monthly credit budget.
- "Start a project" form now posts to `POST /api/inquiry`, a Cloudflare Worker that validates with the same code as the browser and emails the brief via Resend (`Reply-To` = client). No-JS posts get a 303 redirect to `/thanks/`.
- Default site URL is `https://mkweb-dev.com`.

### Added
- `web/wrangler.jsonc`, `web/worker/index.ts`, `public/_headers` (cache + security headers).
- `parseInquiry()`: server-side whitelist parsing of form data.
- Tests for the Worker (routing, validation, honeypot, provider failure, redirect) — 48 tests.
- `docs/CLOUDFLARE.md`: migration guide (Serbian).

### Removed
- `netlify.toml`, `public/__forms.html` and Netlify Forms attributes.

## [1.3.0] — 2026-11

### Added
- **Projects in Sanity**: `project` schema (card / case study / visual tabs, `order`, `featured`, optional `cover` image).
- `lib/project-repository.ts`: loads projects from Sanity, falls back to `content/projects.ts`, memoised per build.
- `normalizeProject()` turns half-filled CMS documents into valid `Project` objects.
- `scripts/export-projects.ts` + `studio` `import:projects`: one-command migration of the 18 existing case studies.
- **"Start a project"** multi-step brief (`StartProject.tsx`): 4 steps, accessible validation and focus management, progressive enhancement (works without JavaScript), Netlify Forms with honeypot, mailto fallback on failure.
- `public/__forms.html` skeleton and `/thanks/` page.
- Tests: normalisation, seed export, inquiry validation/encoding, skeleton ↔ config sync (37 tests).

### Changed
- `lib/projects.ts` is now pure and client-safe; helpers take the list as an argument.
- Menu and contact link to the new section; Contact is now section 09.
- CI matrix: Node 22 and 24 (Node 20 reached end of life).

### Fixed
- The last "Next" click could submit the form: React reused the clicked `type="button"` element as `type="submit"`. Distinct `key`s now force a new element.

## [1.2.0] — 2026-11

### Changed
- Positioning: hero intro, core-area list, meta description and JSON-LD `knowsAbout` now cover headless CMS on Next.js, CI/CD and hosting.
- Capabilities regrouped into eight cards: Build, Headless, Frontend, Migrate, Grow, Automate, DevOps and Next (actively advancing: Node.js/Express/MongoDB, Webflow + Next.js via DevLink and Webflow Cloud, programmatic SEO on Next.js).

## [1.1.0] — 2026-11

### Added
- Portrait in the About section (`public/images/marko-kostic.webp`, 720×900, duotone-graded to the palette) with mask reveal, zoom-out and scroll parallax.
- `image` in the JSON-LD `Person` schema.
- Blue accent family in `tokens.css` (`--blue`, `--blue-2`, `--blue-3`, `--cyan`, `--navy`, gradients), Webflow-inspired.

### Changed
- Ambient blue glows behind the site and the hero; menu overlay background.
- Gradient text for italic accent words in headings.
- Primary CTA, availability pill, menu button and active filter use blue.
- Hero point sphere mixes from light to blue by depth (`uColorB`).

## [1.0.0] — 2026-11

### Added
- Next.js 16 site with static export: home, `/work/[slug]` case studies, `/blog`, `/blog/[slug]`.
- 18 case studies from the CV as typed local content.
- Project index with platform filters.
- Fullscreen menu with focus trap, Escape to close and Belgrade local time.
- Motion system: GSAP (ScrollTrigger, SplitText), Lenis smooth scroll, Three.js hero point field, `prefers-reduced-motion` support.
- Sanity Studio v5 with `post`, `category` and `blockContent` schemas.
- Blog fed from Sanity at build time, with a planned-topics fallback.
- SEO: metadata, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD `Person`.
- CI (GitHub Actions) and Netlify configuration.
