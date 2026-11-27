# Ekosistem — odakle sve ovo dolazi

Pre nego što otvorimo prvi fajl, hajde da vidimo **zašto** web danas izgleda ovako. Svaka tehnologija u ovom projektu je odgovor na problem koji je neka prethodna stvorila. Kad znaš taj lanac, sledeća „nova stvar" (a biće ih) ti neće delovati kao magija — prepoznaćeš koji stari problem rešava.

Ne moraš ovo poglavlje da čitaš u jednom dahu. Vrati mu se kad ti nešto u kodu deluje „previše komplikovano" — skoro uvek postoji istorijski razlog.

## Četiri ere renderovanja

Cela istorija web razvoja može da se ispriča kroz jedno pitanje: **gde se pravi HTML?**

| Era | Gde nastaje HTML | Tipičan stack | Šta je rešila | Šta je pokvarila |
| --- | --- | --- | --- | --- |
| 1. Server (MPA) | na serveru, na svaki zahtev | PHP + MySQL, WordPress, Laravel, Rails | dinamičan sadržaj, CMS | svaki klik = nova strana; server radi za svaki zahtev |
| 2. Browser (SPA / CSR) | u browseru, iz JavaScript-a | jQuery → Backbone, Angular, React | aplikacije bez reload-a | prazan HTML, spor prvi prikaz, loš SEO |
| 3. Build (SSG / JAMstack) | jednom, pri build-u | Jekyll, Gatsby, Next.js (export), Hugo | brzina, cena, bezbednost | promena sadržaja = novi build |
| 4. Hibrid (RSC) | biraš po komponenti i po ruti | Next.js App Router, Remix/React Router, Astro | najbolje od sve tri | složenost: moraš da znaš gde se šta izvršava |

Tvoj portfolio je **era 3 izgrađena alatom iz ere 4**: Next.js App Router sa Server Components, ali sa `output: 'export'` — sve se izvrši pri build-u i rezultat su statički fajlovi. Kad ti jednog dana zatreba server (forma sa bazom, login, personalizacija), isti kod prelazi u eru 4 bez prepisivanja.

:::wp
WordPress je čista era 1. Svaki put kad neko otvori stranu, PHP pokrene `WP_Query`, sklopi HTML iz šablona i pošalje ga. Kad instaliraš WP Super Cache, ti ga zapravo pretvaraš u eru 3: HTML se napravi jednom i servira kao fajl. Next.js statički export je „keš ugrađen u arhitekturu".
:::

## Kratka hronologija (samo ono što ti treba)

:::istorija Server i PHP (1995–2010)
PHP nastaje 1995. kao skup skripti za ličnu stranu. WordPress izlazi 2003. i postaje najrašireniji CMS na svetu. Model je jednostavan i genijalan: baza + šabloni + server koji ih spaja na svaki zahtev. Taj model i danas pokreće ogroman deo weba — i tvoj CV je na njemu izgrađen.
:::

:::istorija JavaScript postaje ozbiljan (2005–2012)
2005. termin **AJAX** opisuje nešto što su Gmail i Google Maps već radili: strana dohvata podatke u pozadini, bez reload-a. 2006. izlazi **jQuery** — prvi put je manipulacija DOM-om ista u svim browserima. 2009. **Node.js** izvodi JavaScript iz browsera na server, a 2010. **npm** postaje centralni registar paketa (danas najveći na svetu). Iste godine stižu Backbone i AngularJS — prvi „frameworki za aplikacije u browseru". 2012. Microsoft objavljuje **TypeScript**.
:::

:::istorija React (2013) i deklarativni UI
Facebook otvara **React** 2013. godine. Velika ideja nije bila JSX, nego **deklarativnost**: ne pišeš „kad se klikne, nađi element i promeni mu klasu" (jQuery), nego „UI je funkcija stanja" — opišeš kako ekran izgleda za dato stanje, a React sam izračuna šta treba da se promeni u DOM-u. Sve što radiš u ovom projektu (`useState`, props, komponente) potiče iz te jedne ideje.
:::

:::istorija Problem SPA i povratak serveru (2014–2016)
Čiste React aplikacije su slale prazan `<div id="root">` i gomilu JavaScript-a. Google je teško indeksirao takve strane, a korisnici na sporim telefonima su gledali beli ekran. Rešenje: renderuj React **na serveru** u HTML, pa ga u browseru „oživi" (hidratacija). To je radilo, ali podešavanje je bilo noćna mora. 2016. kompanija Zeit (danas **Vercel**) objavljuje **Next.js**: React sa server renderovanjem i rutiranjem preko foldera, bez ručnog podešavanja.
:::

:::istorija JAMstack, Netlify i Gatsby (2014–2020)
Netlify (osnovan 2014) popularizuje termin **JAMstack**: JavaScript, API-ji i Markup — sajt se izgradi unapred i servira sa CDN-a, a dinamični delovi idu preko API-ja. **Gatsby** (2015) postaje zvezda ovog talasa: React + GraphQL sloj nad svim izvorima podataka (WordPress, Markdown, CMS-ovi). Ti si upravo tako radio headless WordPress u hello:here. Netlify je 2023. kupio Gatsby Inc, a razvoj Gatsby-ja je od tada praktično u režimu održavanja.
:::

:::istorija Headless CMS (2013–danas)
Klasičan CMS (WordPress) i čuva sadržaj i pravi HTML. **Headless CMS** radi samo prvo: sadržaj čuva i daje ga preko API-ja, a prikaz prepušta tvom frontendu. Contentful (2013) je otvorio tržište, Sanity se pojavio 2017. sa idejom „sadržaj kao podaci" (strukturisani JSON, Portable Text, GROQ). WordPress je dobio REST API u jezgru krajem 2016. — tada je postao i on „headless-capable", što si koristio sa Gatsby-jem.
:::

:::istorija Next.js sazreva (2020–2025)
Next 9.3 (2020) donosi `getStaticProps`/`getStaticPaths` — Next postaje i odličan statički generator i polako preuzima Gatsby-jevu publiku. Krajem 2020. React tim predstavlja **React Server Components**: komponente koje se izvršavaju samo na serveru i ne šalju JavaScript. Next 13 (2022) uvodi **App Router** izgrađen na RSC-u (stabilan od 13.4, 2023). React 19 (decembar 2024) ih zvanično stabilizuje. Next 15 (2024) i 16 (2025) donose Turbopack kao podrazumevani bundler, asinhrone `params`, `proxy.ts` umesto `middleware.ts` i uklanjanje `next lint` — sve to ćeš videti u kodu.
:::

:::istorija Animacija na webu
**GSAP** (GreenSock) potiče iz Flash ere — TweenLite je bio standard za ActionScript animacije pre nego što je prešao na JavaScript. 2024. Webflow je kupio GreenSock, a 2025. ceo GSAP, uključujući nekada plaćene pluginove kao SplitText, postao je besplatan za sve. **Three.js** (2010) je učinio WebGL upotrebljivim bez pisanja sirovog OpenGL-a. **Lenis** (2022, darkroom.engineering) je postao standard za „smooth scroll" na Awwwards sajtovima jer, za razliku od starijih biblioteka, ne lomi native skrol, sticky elemente ni pristupačnost.
:::

## Mapa današnjeg ekosistema

Kad čuješ novo ime, smesti ga u jednu od ovih kutija:

| Sloj | Šta radi | Ovaj projekat | Alternative koje ćeš sretati |
| --- | --- | --- | --- |
| Jezik | tipovi nad JavaScript-om | TypeScript | čist JS, JSDoc tipovi |
| UI biblioteka | komponente i stanje | React 19 | Vue, Svelte, Solid, Angular |
| Meta-framework | rute, renderovanje, build | Next.js 16 | Remix / React Router 7, Astro, Nuxt (Vue), SvelteKit, Gatsby |
| Bundler | spaja i optimizuje fajlove | Turbopack (u Next-u) | Vite, webpack, esbuild, Rollup |
| Stilovi | izgled | CSS tokeni + CSS Modules | Tailwind, Sass, CSS-in-JS (styled-components) |
| Animacija | pokret | GSAP, Lenis, Three.js | Motion (Framer Motion), CSS animacije, anime.js |
| Sadržaj | gde žive tekstovi | Sanity (+ TS fallback) | Contentful, Storyblok, Payload, Strapi, headless WordPress, Webflow CMS |
| Forme | prijem upita | Cloudflare Worker + Resend | Netlify Forms, Formspree, sopstveni API (Express, Laravel), server action |
| Hosting | gde sajt živi | Cloudflare (Workers, statički fajlovi) | Netlify, Vercel, Render, Railway, VPS + Coolify |
| CI/CD | provera i objava | GitHub Actions + Cloudflare Workers Builds | Netlify build, GitLab CI, Bitbucket Pipelines, DeployBot |

## Isti problem, različiti stackovi

Kroz priručnik ćeš videti ružičaste kutije **DRUGI STACKOVI**. One pokazuju kako se isti zadatak rešava u stackovima koje već znaš ili ćeš uskoro učiti. Evo kompletne mape na jednom mestu:

| Zadatak | Next.js (ovde) | WordPress | Laravel | MERN (Express + React) | Gatsby |
| --- | --- | --- | --- | --- | --- |
| Ruta | folder `app/work/[slug]/` | permalink + `single-project.php` | `Route::get('/work/{slug}')` | `app.get('/work/:slug')` + React Router | `createPages` u `gatsby-node.js` |
| Šablon | komponenta (`.tsx`) | PHP šablon | Blade (`.blade.php`) | React komponenta | React komponenta |
| Podaci | `async` Server Component | `WP_Query` | Eloquent model | Mongoose model | GraphQL `pageQuery` |
| Model sadržaja | TS tip + Sanity šema | CPT + ACF | migracija + model | Mongoose šema | GraphQL tipovi iz izvora |
| Validacija forme | čista TS funkcija + UI | `sanitize_*` + `wp_verify_nonce` | Form Request (`rules()`) | Joi / Zod middleware | kao React |
| SEO meta | `export const metadata` | Yoast / `wp_head` | paket ili Blade sekcija | react-helmet / ručno | Gatsby Head API |
| Keš / brzina | statički export | page cache plugin | `Cache::remember`, Octane | Redis, CDN | statički build |

:::senior Uči obrasce, ne alate
Primeti da se kolone razlikuju u sintaksi, a ne u ideji. Ruta, šablon, model, validacija, keš — to su obrasci. Alati se menjaju svakih par godina (Gatsby je pre pet godina bio „budućnost"), obrasci ostaju decenijama. Kad ti klijent kaže „imamo Nuxt", ti već znaš 80% — samo tražiš gde je u Nuxt-u ruta, gde šablon, gde podaci.
:::

## Načini renderovanja — rečnik koji će te pratiti

| Skraćenica | Ime | Kada se pravi HTML | Kada ga koristiš |
| --- | --- | --- | --- |
| SSG | Static Site Generation | pri build-u | portfolio, blog, marketing sajt (ovde) |
| SSR | Server-Side Rendering | na svaki zahtev | personalizovano, uvek sveže (korpa, dashboard) |
| ISR | Incremental Static Regeneration | pri build-u, pa periodično u pozadini | velike kataloge, programmatic SEO sa hiljadama strana |
| CSR | Client-Side Rendering | u browseru | delovi iza logina, interaktivni alati |
| RSC | React Server Components | na serveru/build-u, po komponenti | osnova App Router-a: server radi teški posao, browser dobija samo interaktivne delove |
| PPR | Partial Prerendering | statička ljuska + dinamične „rupe" | Next-ov eksperimentalni hibrid za mešane strane |

:::zasto Zašto smo izabrali SSG za tvoj sajt
Sadržaj se menja nekoliko puta mesečno, posetilac ništa ne personalizuje, a cilj je maksimalna brzina i nula troškova. SSG daje sve to. ISR i SSR bi zahtevali server (i plaćeni hosting kad saobraćaj poraste) za korist koju tvoj sajt ne bi osetio. Senior ne bira „najmoćniju" opciju, nego **najjednostavniju koja rešava problem**.
:::

## Hosting — kratko, pa detaljno u fazi 10

Gde će sajt živeti zavisi od toga **kako se izvršava**. Statički fajlovi mogu bilo gde i skoro uvek besplatno. Čim imaš serverski kod (SSR, API rute), plaćaš procesorsko vreme ili ceo server. Zato je statički export ujedno i najjeftinija arhitektura: tvoj sajt košta samo domen. Detaljno poređenje Netlify-ja, Vercel-a, Cloudflare-a, Render-a, Railway-a i sopstvenog VPS-a sa Coolify-jem čeka te u fazi 10.
