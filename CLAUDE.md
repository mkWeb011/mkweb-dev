# mkweb-dev — portfolio Marka Kostića

Lični portfolio nezavisnog web inženjera (WordPress, Webflow, headless CMS na Next.js-u, CI/CD i hosting).
Live: https://mkweb-dev.com · Hosting: Cloudflare Workers (statički fajlovi + Worker za formu) · Domen: Namecheap, DNS: Cloudflare · CMS: Sanity · Email: Resend

## Ko sam ja i kako radimo zajedno

Ja (Marko) učim React i Next.js kroz ovaj projekat. Dolazim iz WordPress/PHP sveta, sledeće učim Laravel i MERN.
Kad postavim pitanje, ponašaj se kao senior mentor — detaljna pravila su u `.claude/rules/mentor.md`.

- Odgovaraj na **srpskom (latinica)**. Kod, imena fajlova, commit poruke i komentari u kodu ostaju na **engleskom**.
- Pre nego što bilo šta menjaš, objasni šta ćeš uraditi i zašto. Za veće izmene prvo predloži plan i sačekaj „ok".

## Gde smo stali

Na početku rada pročitaj `docs/STATUS.md`: urađeno, otvoreni koraci i odluke koje važe (npr. `noindex` do lansiranja). Kad završimo veći korak, predloži izmenu tog fajla.

## Struktura

```
web/                    Next.js 16 sajt (App Router, React 19, TypeScript strict)
  wrangler.jsonc        Cloudflare: out/ kao statički fajlovi, Worker samo za /api/*
  worker/index.ts       POST /api/inquiry → validacija → email preko Resend-a
  src/app/              rute: /, /work/[slug]/, /blog/, /blog/[slug]/, /thanks/, sitemap, robots
  src/components/       layout/ · sections/ · ui/ · motion/ (GSAP, Lenis, Three.js) · blog/
  src/content/          podaci u TS-u: site, experience, capabilities, inquiry, projects (rezerva)
  src/lib/              čiste funkcije + tipovi; project-repository.ts (jedini izvor projekata)
  src/sanity/           klijent, GROQ upiti, api.ts (jedini ulaz za Sanity podatke)
  public/_headers       keš i bezbednosna zaglavlja (Cloudflare)
  tests/                node:test unit testovi
studio/                 Sanity Studio v5 (šeme: project, post, category, blockContent)
docs/handbook/          mentor priručnik po fazama (izvor PDF-a) — vidi tabelu ispod
docs/CLOUDFLARE.md      hosting korak po korak
```

## Komande (iz `web/`)

| Komanda | Šta radi |
| --- | --- |
| `npm run dev` | razvojni server, http://localhost:3000 |
| `npm run build` | statički export u `web/out/` |
| `npm run typecheck` / `npm run lint` | provere |
| `npm test` | unit testovi — moraju proći pre svakog commit-a |
| `npm run seed:projects` | izvoz lokalnih projekata za Sanity uvoz |
| `npm run cf:dev` | build + ceo sajt sa Worker-om lokalno (wrangler, http://localhost:8787) |

Studio (iz `studio/`): `npm run dev` (http://localhost:3333), `npx sanity deploy`.

## Priručnik — gde je šta objašnjeno

Kad objašnjavaš fajl ili koncept, prvo pogledaj odgovarajuću lekciju i drži se njenih objašnjenja i terminologije. Ne učitavaj sve lekcije odjednom — samo onu koja treba.

| Tema | Lekcija |
| --- | --- |
| istorijat, ekosistem, načini renderovanja | `docs/handbook/00a_ekosistem.md` |
| setup, package.json, tsconfig, next.config | `docs/handbook/01_faza0_setup.md` |
| tipovi, site.ts, format.ts | `docs/handbook/02_faza1_tipovi.md` |
| tokeni, globals.css, layout, prve komponente | `docs/handbook/03_faza2_react_osnove.md` |
| sekcije početne, lib/projects.ts, testovi | `docs/handbook/04_faza3_sadrzaj_sekcije.md` |
| state, efekti, meni, filter projekata | `docs/handbook/05_faza4_interaktivnost.md` |
| dinamičke rute /work/[slug]/ | `docs/handbook/06_faza5_rute.md` |
| GSAP, Lenis, Three.js, motion sistem | `docs/handbook/07_faza6_motion.md` |
| Sanity Studio i šeme | `docs/handbook/08_faza7_sanity_studio.md` |
| Next ↔ Sanity, GROQ, blog | `docs/handbook/09_faza8_next_sanity.md` |
| projekti u Sanity-ju, repozitorijum, uvoz | `docs/handbook/09a_projekti_sanity.md` |
| forma „Start a project" (UI, validacija) | `docs/handbook/09b_forma.md` |
| SEO, metadata, sitemap, programmatic SEO | `docs/handbook/10_faza9_seo.md` |
| hosting izbor, CI, domen, webhook | `docs/handbook/11_faza10_deploy.md` |
| Cloudflare, wrangler, Worker za formu | `docs/handbook/11a_cloudflare.md` |
| commit plan, trikovi, sledeći koraci | `docs/handbook/12_zavrsno.md` |

## Pravila projekta (ne kršiti)

- **Iskrenost sadržaja:** bez izmišljenih metrika, procenata, klijenata i testimonijala. Nepoznato → „to be confirmed" (`ToConfirm`).
- **Statički export:** nema Next API ruta, `proxy.ts`, ISR ni server actions. Serverski kod ide isključivo u `web/worker/` i samo pod `/api/*`.
- **Podaci odvojeni od prikaza:** sadržaj u `content/` ili Sanity-ju; komponente ga primaju kroz props.
- **Server vs klijent:** `'use client'` samo gde treba (stanje, efekti, browser API). Sanity klijent nikad u klijentskoj komponenti.
- **Pristupačnost i reduced motion** su obavezni za svaku novu interakciju i animaciju.
- **Forma:** pitanja samo u `content/inquiry.ts`; browser i Worker dele validaciju iz `lib/inquiry.ts`. Tajne (`RESEND_API_KEY`) nikad u kod ni u `wrangler.jsonc`.
- **Commit poruke:** Conventional Commits (`feat(scope): ...`, `fix: ...`, `chore: ...`).
