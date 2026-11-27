# Faza 9 — SEO i AEO: sitemap, robots, strukturisani podaci

**Cilj faze:** sajt je potpuno čitljiv za Google i AI pretraživače. Ovo je deo koji već radiš klijentima — ovde vidiš kako izgleda u Next.js-u.

## Šta je već urađeno u prethodnim fazama

| SEO element | Gde | Faza |
| --- | --- | --- |
| `<title>` šablon, opis, Open Graph | `app/layout.tsx` → `metadata` | 2 |
| JSON-LD `Person` | `app/layout.tsx` | 2 |
| Kanonski URL po strani | `generateMetadata` u case studijama i postovima | 5, 8 |
| OG slika za postove | `app/blog/[slug]/page.tsx` | 8 |
| Ceo sadržaj u HTML-u (ne JS) | statički export + Server Components | 0 |
| `noindex` za placeholder stranu | `app/blog/[slug]/page.tsx` | 8 |
| `noindex` za `/thanks/` | `app/thanks/page.tsx` | 8b |
| `knowsAbout` prati pozicioniranje (Headless CMS, Sanity, CI/CD, Programmatic SEO) | `app/layout.tsx` | 2 |
| Semantički HTML, `lang="en"`, alt tekstovi | sve komponente | — |

## sitemap.ts

@file web/src/app/sitemap.ts

Fajl `app/sitemap.ts` Next.js pretvara u `/sitemap.xml`. Funkcija vraća niz objekata, a Next pravi XML.

- `export const dynamic = 'force-static'` — sa statičkim exportom, ruta mora biti eksplicitno statička.
- Funkcija je `async` jer čeka postove i projekte (`Promise.all`) — svaki novi post i projekat iz Studija automatski ulazi u sitemap pri sledećem build-u.
- `priority` je viši za istaknute case studije (0.8) nego za ostale (0.5). Google tvrdi da ignoriše ovo polje, ali ne škodi i dokumentuje tvoju nameru.
- `as const` uz `'yearly'` — bez toga bi TypeScript video običan `string`, a tip traži jednu od tačno određenih vrednosti.

## robots.ts

@file web/src/app/robots.ts

Postaje `/robots.txt` sa linkom ka sitemap-u.

:::senior Proveri izlaz, ne izvor
Posle `npm run build` otvori `out/sitemap.xml` i `out/robots.txt` i pročitaj ih. Proveri da su URL-ovi apsolutni, sa pravim domenom (`NEXT_PUBLIC_SITE_URL`) i sa kosom crtom na kraju (zbog `trailingSlash: true`). Najčešća SEO greška posle lansiranja je sitemap sa `localhost` adresama.
:::

## AEO/GEO — vidljivost u AI odgovorima

Ovo radiš za Lumina Lumière Institute, pa ukratko kako je primenjeno ovde:

- **Jasan, činjeničan tekst** — case studije imaju strukturu Context → Challenge → Approach → Delivered → Outcomes. AI modeli lako izvlače takve delove.
- **Strukturisani podaci** — `Person` sa `jobTitle`, `address`, `knowsAbout`, `sameAs` (LinkedIn).
- **Bez izmišljenih tvrdnji** — modeli sve češće upoređuju izvore; nepotvrđene brojke štete kredibilitetu.
- **Statički HTML** — crawler-i AI servisa često ne izvršavaju JavaScript. Kod nas je sav sadržaj u HTML-u.

## Sledeći nivo: programmatic SEO na Next.js-u

Programmatic SEO znači: **jedan šablon + baza strukturisanih podataka = mnogo stranica** za specifične pretrage. Za tebe bi obrasci bili „Next.js website for dental clinics" (usluga × industrija), „Wix to WordPress migration" (CMS → CMS) ili „Sanity vs Contentful" (poređenja). Long-tail pretrage imaju malu konkurenciju i jasnu nameru — onaj ko traži „Webflow to Next.js migration" je skoro gotov klijent.

Sve što ti treba već znaš iz ovog projekta:

```
studio/schemaTypes/industry.ts    dokument po industriji: problemi, proces, FAQ, povezan case study
sanity/queries.ts                 INDUSTRIES_QUERY
app/services/[service]/[industry]/page.tsx
  generateStaticParams()          sve kombinacije usluga × industrija koje IMAJU podatke
  generateMetadata()              jedinstven title i description po strani
  JSON-LD                         Service + FAQPage
app/sitemap.ts                    iste kombinacije, iz istih podataka
```

- **Dva dinamička segmenta** (`[service]/[industry]`) — `generateStaticParams` vraća parove `{ service, industry }`.
- **Interno linkovanje**: „hub" strana (`/services/next-js/`) linkuje na sve industrije; svaka strana linkuje na srodne i na case studije.
- **Osvežavanje**: statički export + webhook je dovoljan za stotine i nekoliko hiljada strana. Za desetine hiljada prelaziš na hosting sa serverom i ISR-om (`export const revalidate = 86400`), da se ne gradi sve odjednom.

:::zamka Scaled content abuse
Google ima pravilo protiv masovno pravljenih stranica „čija je glavna svrha manipulacija rangiranjem, a ne pomoć korisniku" — bez obzira da li ih je pisao čovek ili AI, a primenjuje ga sve strože. Šablon u kom se menja samo ime industrije je upravo to. Pravilo za tvoje strane: stranica ide uživo **samo ako ima dovoljno jedinstvenih podataka** (konkretni problemi te industrije, primer, FAQ). U kodu: `normalizeIndustry` vraća `null` za siromašne dokumente, pa za njih strana i ne nastaje — isti obrazac kao `normalizeProject`. Kreni sa 20–50 strana, prati Search Console, pa skaliraj.
:::

:::stack Programmatic SEO u drugim stackovima
**WordPress:** CPT + ACF + šablon, ili pluginovi (WP All Import iz CSV-a) — radi, ali hiljade strana usporavaju admin i bazu. **Laravel:** ruta `/{service}/{industry}` + Blade + keš (`Cache::remember`) ili statički generator (Jigsaw). **Astro:** odličan za ovo — `getStaticPaths` kao Next, a šalje nula JS-a po defaultu. **Webflow:** CMS kolekcije imaju limit stavki po planu, pa se za veliki broj strana kombinuje sa Next.js-om preko Webflow Data API-ja.
:::

:::testiraj Posle deploy-a
1. Google Search Console → dodaj domen → pošalji `https://tvojdomen/sitemap.xml`.
2. Rich Results Test (search.google.com/test/rich-results) → unesi početnu → mora prepoznati `Person`.
3. Podeli link case studije na LinkedIn-u (Post Inspector) → proveri naslov i opis.
4. Lighthouse u Chrome DevTools → SEO 100, Accessibility ≥ 95.
:::

:::commit
`feat(seo): add sitemap, robots and structured data`
:::
