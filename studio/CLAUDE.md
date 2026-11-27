# studio/ — Sanity Studio

- Šeme u `schemaTypes/`; svaka nova šema mora u `schemaTypes/index.ts`.
- Polja šeme `project` su ugovor sa `web/src/sanity/queries.ts` (PROJECTS_QUERY) i tipom `Project` u `web/src/lib/types.ts` — menjaj sva tri zajedno.
- Lista tagova u `project.ts` mora odgovarati `PROJECT_TAGS` u `web/src/lib/types.ts`.
- Lokalno: `npm run dev` (http://localhost:3333); objava: `npx sanity deploy`.
