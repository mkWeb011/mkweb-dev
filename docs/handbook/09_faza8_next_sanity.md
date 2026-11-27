# Faza 8 — Povezivanje Next.js-a i Sanity-ja: blog

**Cilj faze:** sajt pri build-u povlači objavljene postove iz Sanity-ja, prikazuje ih na početnoj i na `/blog/`, i pravi stranu za svaki post. Bez Sanity podešavanja sajt se i dalje gradi i prikazuje planirane teme.

## Tok podataka

```
 Studio (urednik) ── Publish ──► Content Lake (Sanity oblak)
                                        │
            next build  ──── GROQ upit ─┘ (sanity/api.ts → client.ts)
                │
                ├─ app/page.tsx         → <Writing posts={...} />
                ├─ app/blog/page.tsx    → lista svih postova
                └─ app/blog/[slug]/     → strana po postu (generateStaticParams)
```

Organizacija u `src/sanity/`: svaki fajl ima jedan posao. `env.ts` čita podešavanja, `client.ts` pravi klijenta, `queries.ts` sadrži upite, `image.ts` pravi URL-ove slika, `api.ts` je jedini ulaz za strane.

## env.ts i client.ts

@file web/src/sanity/env.ts

- `apiVersion` je **datum**. Sanity zamrzne ponašanje API-ja na taj dan — ako sutra promene nešto nekompatibilno, tvoj sajt nastavlja da radi kao danas. Kad želiš nove mogućnosti, svesno pomeriš datum.
- `isSanityConfigured` proverava da li Project ID ima ispravan oblik (mala slova, brojevi, crtice). Prazna vrednost ili greška u kucanju → `false` → sajt koristi lokalne podatke umesto da pukne.

@file web/src/sanity/client.ts

- Klijent je ili pravi objekat ili `null`. Tip `SanityClient | null` tera svaki kod koji ga koristi da proveri `null` — i to radi samo `api.ts`.
- `useCdn: true` — čitanje ide preko Sanity-jevog keša na ivici mreže: brže i štedi kvotu besplatnog plana. Keš može da kasni par sekundi za objavom — za build koji ionako kreće posle objave, nebitno.
- `perspective: 'published'` — vidimo samo objavljeno, nikad draftove.

:::zamka Token u frontendu
Za javni dataset token nije potreban. Ako jednog dana dodaš token (privatni dataset, draftovi), on ide u promenljivu **bez** `NEXT_PUBLIC_` i koristi se samo na serveru. Token sa pravom pisanja u browser bundle-u znači da svako može da obriše tvoj blog.
:::

## GROQ upiti

@file web/src/sanity/queries.ts

GROQ se čita kao pipeline, sleva nadesno — komentar na vrhu fajla to rastavlja. Prevod na SQL i WP_Query:

| GROQ | SQL | WP_Query |
| --- | --- | --- |
| `*[_type == "post"]` | `SELECT * FROM post` | `'post_type' => 'post'` |
| `&& defined(publishedAt)` | `WHERE published_at IS NOT NULL` | `'post_status' => 'publish'` |
| `\| order(publishedAt desc)` | `ORDER BY published_at DESC` | `'orderby' => 'date'` |
| `[0...$limit]` | `LIMIT :limit` | `'posts_per_page' => 6` |
| `{ title, "slug": slug.current }` | `SELECT title, slug AS ...` | `'fields' => ...` |
| `categories[]->title` | `JOIN category ...` | `get_the_terms()` |

- `POST_CARD` je zajednička **projekcija** za liste — bez `body`, da odgovor bude mali. Samo `POST_BY_SLUG_QUERY` dodaje `body`.
- `[0]` na kraju upita za jedan post — vraća objekat umesto niza (ili `null` ako nema rezultata).
- `$slug`, `$limit` — **parametri**. Vrednosti se šalju odvojeno od upita i Sanity ih bezbedno ubacuje. Nikad ne lepi korisnički unos u string upita — isti princip kao `$wpdb->prepare()`.
- `/* groq */` komentar ispred stringa — VS Code ekstenzija „Sanity.io" po njemu boji sintaksu.
- `PROJECTS_QUERY` na dnu fajla pripada fazi 8a. Zanimljiv je `coalesce(order, 9999)`: projekat bez upisanog redosleda ide na kraj umesto na početak, jer bi prazan `order` inače bio „najmanji".

:::stack Upiti u drugim stackovima
**Laravel:** `Post::whereNotNull('published_at')->latest('published_at')->take(6)->get(['title','slug'])` — Eloquent je PHP verzija istog pipeline-a. **MERN:** `Post.find({ publishedAt: { $ne: null } }).sort({ publishedAt: -1 }).limit(6).select('title slug')` u Mongoose-u. **Gatsby:** GraphQL `allSanityPost(sort: {publishedAt: DESC}, limit: 6) { nodes { title slug { current } } }`. Četiri sintakse, isti koraci: filter, sortiraj, ograniči, izaberi polja.
:::

## image.ts — slike preko Sanity CDN-a

@file web/src/sanity/image.ts

`urlFor(slika).width(900).height(560).url()` pravi URL kao `https://cdn.sanity.io/images/<projekat>/production/<id>.jpg?w=900&h=560&auto=format&fit=max`. CDN seče sliku poštujući hotspot, smanjuje je i šalje WebP/AVIF browserima koji ih podržavaju. To je razlog zašto nam ne treba Next-ov optimizator slika.

:::zamka Stari tutorijali i @sanity/image-url v2
Verzija 2 je promenila izvoz: umesto `import imageUrlBuilder from '@sanity/image-url'` sada je `import { createImageUrlBuilder } from '@sanity/image-url'`. Većina tutorijala na internetu koristi stari oblik i daje grešku „is not a function". Kad kopiraš kod sa interneta, proveri verziju paketa u `package.json`.
:::

## api.ts — jedini ulaz za podatke

@file web/src/sanity/api.ts

**`safeFetch` (generička funkcija).** `<T>` je **generički tip**: funkcija radi sa bilo kojim tipom rezultata, a pozivalac kaže koji (`safeFetch<Post[]>`). Ako klijent ne postoji ili mreža pukne — vrati rezervnu vrednost i upiši upozorenje u log build-a. Build nikad ne pada zbog bloga.

**`getSanityProjects` vraća `unknown[]`.** Namerno. Urednik u Studiju može da ostavi polja prazna, pa ne smemo da tvrdimo da je odgovor već `Project[]`. Proveru i popravku oblika radi `normalizeProject` u fazi 8a. Ovo je granica između „spoljnog sveta" i našeg koda — na granici ne veruješ tipu, nego proveriš.

**`PLACEHOLDER_SLUG`.** Ovde rešavamo zamku iz faze 5: sa statičkim exportom, dinamička ruta ne sme imati praznu listu parametara. Pre prvog posta pravimo jednu stranu `/blog/coming-soon/` sa `noindex`, da Google ne bi indeksirao praznu stranu.

:::wp
`api.ts` je kao tvoja klasa `PostRepository` u temi: šabloni pozivaju `get_latest_posts(6)`, a ne pišu `new WP_Query(...)` svuda. Kad promeniš izvor podataka, menjaš jedan fajl.
:::

@file web/tests/sanity.test.ts

Test briše `NEXT_PUBLIC_SANITY_PROJECT_ID` i proverava da sve funkcije vraćaju prazne rezultate umesto greške. Upravo zato CI (faza 10) može da izgradi sajt bez ikakvih tajni.

## Komponente za blog

### PostCard — diskriminisana unija

@file web/src/components/blog/PostCard.tsx

**`type CardProps = | { kind: 'post'; ... } | { kind: 'planned'; ... }`** — jedan od najkorisnijih TypeScript obrazaca. Kartica prima ili objavljeni post ili planiranu temu, a polje `kind` govori koje. Unutar `if (props.kind === 'planned') { ... }` TypeScript **zna** da je `post` tipa `PlannedPost`; posle toga zna da je `Post`. Nema kastovanja, nema `any`.

**`WaveArt`** — dekorativni talasi, deterministički po indeksu (isti ulaz → isti crtež na serveru i klijentu, pa nema problema sa hidratacijom).

**`<img>` umesto `next/image`** — uz `eslint-disable` komentar koji objašnjava zašto: optimizaciju radi Sanity CDN. `width`/`height` atributi rezervišu prostor pre učitavanja (nema poskakivanja sadržaja — CLS), a `loading="lazy"` odlaže slike ispod ekrana.

### PostBody — Portable Text u HTML

@file web/src/components/blog/PostBody.tsx

`PortableText` prolazi kroz JSON blokove i za svaki traži komponentu u objektu `components`. Ti odlučuješ kako izgleda H2, link, slika, blok koda. Za linkove proveravamo `typeof value?.href === 'string'` — vrednost dolazi iz baze, ne veruj joj na reč. Spoljni linkovi dobijaju `target="_blank"` i `rel`.

### Writing — sekcija na početnoj

@file web/src/components/sections/Writing.tsx

`const live = posts.length > 0` — jedna promenljiva odlučuje: pravi postovi ili planirane teme. Kad objaviš prvi post i sajt se ponovo izgradi, sekcija se sama prebaci.

Sekcija prima i `projects` kroz props, da bi planirana tema prikazala ime povezane case studije (`findProject(projects, post.related)`). Ne uvozi projekte sama — strana ih je već učitala i prosleđuje dalje. Tako komponenta ne zna da li projekti dolaze iz Sanity-ja ili iz fajla.

## Strane bloga

@file web/src/app/blog/page.tsx

@file web/src/app/blog/[slug]/page.tsx

- `generateStaticParams` je **async** — pri build-u čeka Sanity za listu slug-ova.
- `generateMetadata` pravi Open Graph sliku 1200×630 iz glavne slike posta: kad link podeliš na LinkedIn-u, dobija lepu karticu.
- Strana proverava `PLACEHOLDER_SLUG` pre nego što zove Sanity.
- `Promise.all([getAllPosts(), getProjects()])` na `/blog/` pokreće oba zahteva **istovremeno**. Sa dva uzastopna `await`-a čekao bi zbir oba vremena; ovako čeka samo duži.

:::testiraj Bez i sa Sanity-jem
1. Bez `.env.local`: `npm run build` prolazi; `out/blog/index.html` prikazuje 6 planiranih tema; postoji `out/blog/coming-soon/index.html`.
2. Upiši Project ID u `.env.local`, pokreni ponovo `npm run build`: početna i `/blog/` prikazuju tvoj post, a postoji `out/blog/<slug>/index.html`.

Oba scenarija sam proverio renderovanjem pravih strana (sa simuliranim Sanity odgovorom za drugi): početna, 18 case studija, blog, strana posta sa naslovom, H2 i blokom koda, sitemap sa 20, odnosno 22 adrese.
:::

:::commit
`feat(blog): fetch posts from Sanity at build time with portable text and fallback`
:::
