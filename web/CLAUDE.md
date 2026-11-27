# web/ — Next.js sajt

- Next.js 16 App Router, `output: 'export'`, `trailingSlash: true`. `params` u stranama je Promise (`await params`).
- Hosting: Cloudflare (`wrangler.jsonc`). `worker/index.ts` radi samo za `/api/*`; sve ostalo su statički fajlovi iz `out/`.
- Server Components po defaultu; klijentske komponente su u `components/motion/`, `ProjectIndex`, `Menu`, `StartProject`.
- Projekti: uvek kroz `getProjects()` iz `src/lib/project-repository.ts` (Sanity → rezerva `content/projects.ts`). Pomoćne funkcije iz `src/lib/projects.ts` primaju listu kao argument.
- Sanity podaci: samo kroz `src/sanity/api.ts`. Podatke iz CMS-a tretiraj kao `unknown` i normalizuj (`normalizeProject`).
- Stilovi: tokeni u `src/styles/tokens.css`, sekcije u `src/app/globals.css`, složene komponente u `*.module.css`.
- Posle izmene: `npm run typecheck && npm run lint && npm test`.
