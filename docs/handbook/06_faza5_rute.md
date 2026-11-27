# Faza 5 — Rute: stranica za svaku case studiju

**Cilj faze:** jedan fajl pravi stranu za svaki projekat (danas 18). Učiš dinamičke rute, `generateStaticParams`, asinhrone `params` u Next.js 16, metapodatke po strani i 404.

## Ruta = folder

U App Router-u URL je struktura foldera u `src/app`:

| Fajl | URL |
| --- | --- |
| `app/page.tsx` | `/` |
| `app/blog/page.tsx` | `/blog/` |
| `app/work/[slug]/page.tsx` | `/work/zignify/`, `/work/idsa/`, … |
| `app/blog/[slug]/page.tsx` | `/blog/<slug>/` |
| `app/sitemap.ts` | `/sitemap.xml` |

Uglaste zagrade `[slug]` znače **dinamički segment**: deo URL-a postaje parametar.

:::wp
`[slug]` je tvoj `%postname%` iz Permalink podešavanja, a `page.tsx` u tom folderu je `single-project.php`. Razlika: WordPress traži post po slug-u pri svakom zahtevu; Next.js pri build-u **unapred** napravi stranu za svaki slug.
:::

## work/[slug]/page.tsx

@file web/src/app/work/[slug]/page.tsx

**`type Props = { params: Promise<{ slug: string }> }` (18).** U Next.js 16 `params` je **Promise** i mora se sačekati: `const { slug } = await params;`. Ovo je bila izmena koja je razbila mnogo projekata pri nadogradnji sa verzije 14 — sinhroni pristup (`params.slug`) više ne radi.

**`generateStaticParams` (23–26).** Pri build-u Next.js pozove ovu funkciju, dobije listu `[{ slug: 'zignify' }, { slug: 'idsa' }, ...]` i za svaki element napravi HTML fajl. Sa `output: 'export'` ova funkcija je **obavezna** za svaku dinamičku rutu — server ne postoji da bi stranu napravio kasnije. Funkcija je `async` jer projekti dolaze iz repozitorijuma (`getProjects()`), koji ih čita iz Sanity-ja (faza 8a). Kad dodaš projekat u Studio, sledeći build sam napravi njegovu stranu.

**`dynamicParams = false` (21).** „Samo slug-ovi iz liste postoje." Bilo koji drugi URL ide na 404.

**`generateMetadata` (28–38).** Isti `metadata` kao u layoutu, ali izračunat po strani: naslov „IDSA — case study", opis iz `summary`, kanonski URL. Next.js spaja ovo sa podrazumevanim vrednostima iz layout-a.

**Lokalna komponenta `Section` (40–48).** Šest blokova case studije (Overview, Challenge, Approach…) imaju isti raspored: oznaka levo, sadržaj desno. Umesto da to kopiramo šest puta, pravimo malu komponentu u istom fajlu. Ne izvozi se — koristi je samo ova strana. Komponentu izdvajaš u poseban fajl tek kad je zatreba još neko.

**Učitavanje i `notFound()` (51–56).** Strana jednom učita listu (`all`), pa iz nje nađe projekat, sledeći projekat i redni broj — sve tri čiste funkcije dobijaju istu listu kao argument. `notFound()` prekida render i prikazuje `app/not-found.tsx`. Posle ove linije TypeScript zna da `project` nije `undefined` (jer `notFound` vraća tip `never` — „ova funkcija se nikad ne vraća"), pa ne moramo da pišemo `project!` ili dodatne provere.

**`{project.client ?? <ToConfirm />}`** — ako je `client` `null`, prikaži oznaku. Čitav sistem iskrenosti staje u ovaj jedan operator.

**Prazne sekcije.** Ako je u Studiju ostao prazan „Approach" ili „What I delivered", strana ne prikazuje praznu listu nego oznaku „to be written / to be confirmed" — isti princip iskrenosti, primenjen na sadržaj koji dolazi iz CMS-a.

**`project.outcome && (...)`** — „Verified outcomes" prikazuje samo potvrđene ishode iz CV-a (npr. „Search rankings preserved through the migration" za Swan), a ispod uvek stoji napomena da se brojke objavljuju tek kad se potvrde.

:::stack Dinamičke rute u drugim stackovima
**Gatsby:** u `gatsby-node.js` pišeš `createPages`, uradiš GraphQL upit za sve projekte i za svaki pozoveš `createPage({ path, component, context })`. **Laravel:** `Route::get('/work/{project:slug}', ...)` — „route model binding" sam nađe model ili vrati 404. **Express (MERN):** `app.get('/api/projects/:slug')` vraća JSON, a React Router na klijentu ima `<Route path="/work/:slug">`. **Astro:** `src/pages/work/[slug].astro` + `getStaticPaths()` — skoro identično Next-u.
:::

:::zamka Prazna lista u statičkom exportu
Sa `output: 'export'`, ako `generateStaticParams` vrati **prazan niz**, build pada sa greškom da strani nedostaje `generateStaticParams()`. Kod projekata to nije problem (ako je Sanity prazan, repozitorijum vraća 18 lokalnih), ali kod bloga jeste — pre prvog objavljenog posta lista je prazna. Rešenje vidiš u fazi 8.
:::

:::senior Case study kao prava strana, ne modal
U prototipu su se case studije otvarale u panelu preko početne strane. Izgledalo je efektno, ali Google ih nije video kao zasebne strane, nisi mogao da pošalješ link klijentu, a dugme Nazad nije radilo kako treba. Prava ruta (`/work/idsa/`) rešava sve to — i dalje može imati efektnu tranziciju, ali je prvo dokument.
:::

## 404 strana

@file web/src/app/not-found.tsx

Next.js je koristi za `notFound()` i za sve nepostojeće URL-ove. U statičkom exportu se snima kao `out/404.html`, a Cloudflare je servira za nepoznate adrese zahvaljujući `not_found_handling: "404-page"` u `wrangler.jsonc` (faza 10b).

:::testiraj
1. `npm run dev`, otvori `localhost:3000/work/idsa/` — vidiš case studiju IDSA.
2. Klikni „Next: Lumina Lumière Institute →" — prelaz bez punog učitavanja.
3. Otvori `/work/ne-postoji/` — 404 strana.
4. Na case studiji MC Adventure, „Engagement" i „Period" prikazuju „To be confirmed".
:::

:::commit
`feat(work): add statically generated case study pages with per-page metadata`
:::
