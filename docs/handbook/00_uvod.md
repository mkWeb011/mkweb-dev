# Uvod — kako da koristiš ovaj priručnik

Marko, ovaj priručnik je pisan kao da sedimo zajedno za stolom. Ja kucam, ti pitaš „zašto baš tako?" i ja odgovaram. Na kraju imaš četiri stvari: portfolio koji radi u produkciji, projekte i blog koje uređuješ kroz Sanity, formu preko koje te klijenti sami kontaktiraju, i — najvažnije — razumevanje React-a i Next.js-a dovoljno duboko da sledeći projekat napraviš sam.

Ne učimo React „iz udžbenika", pa onda Next.js, pa onda Sanity. Učimo ih **uporedo**, na tvom pravom sajtu. Svaki koncept se pojavi tačno onda kada ti zatreba — `useState` kada pravimo filter projekata, `useEffect` kada header treba da reaguje na skrol, dinamičke rute kada pravimo stranice za case studije.

## Šta pravimo

Prototip koji smo napravili u četu (jedan HTML fajl) prebacujemo u pravi, održiv projekat:

- **Sajt**: Next.js 16 sa App Router-om, React 19, TypeScript. Statički export — rezultat je folder sa čistim HTML/CSS/JS fajlovima koji se hostuju besplatno.
- **18 case studija** iz tvog CV-a, svaka na svom URL-u: `/work/zignify/`, `/work/idsa/` … Nove projekte dodaješ u Sanity Studiju, bez diranja koda.
- **Blog** čiji sadržaj pišeš u Sanity Studiju (tvoj „wp-admin"), a sajt ga povlači pri build-u.
- **„Start a project" formu** u četiri koraka (usluga, obim, budžet, kontakt) koja upite šalje na tvoj email preko Cloudflare Worker-a — za klijente koji nisu spremni za poziv.
- **Pozicioniranje**: WordPress i Webflow, headless CMS na Next.js-u, CI/CD i hosting — sa „dokazom" uz svaku veštinu.
- **Animacije**: GSAP (ScrollTrigger, SplitText), Lenis smooth scroll, Three.js sfera u hero sekciji.
- **Deploy**: GitHub → Cloudflare, sopstveni domen, automatski rebuild kad objaviš post — besplatno, bez limita poseta.

@image docs/screenshot-home.png | 16

:::zasto Zašto Next.js, a ne Gatsby?
Tražio si Gatsby, i to je razumna želja — radio si headless WordPress sa Gatsby-jem u hello:here. Ali kao mentor moram da ti kažem ono što bih rekao i klijentu: Gatsby je 2026. u režimu održavanja. Poslednja verzija (5.16.1) izašla je u februaru, stižu samo kritične zakrpe, a plugin za Sanity se retko ažurira. Next.js je React framework u aktivnom razvoju, najtraženiji na tržištu, i sve što znaš iz Gatsby-ja (React komponente, statičko generisanje, GraphQL/GROQ upiti pri build-u) prenosi se direktno. Izabrao si Next.js — dobar izbor za karijeru.
:::

## Kako je priručnik organizovan

Ovo je **drugo izdanje**. Prvo je pokrivalo sajt i blog; ovo dodaje istorijat ekosistema, projekte u Sanity-ju, formu za upite, plavu paletu i portret, poređenje hostinga i paralele sa drugim stackovima.

Lekcije idu **redom kucanja**: tačno onim redom kojim bi gradio projekat od praznog foldera. Svaka faza se završava radnim stanjem koje možeš da pokreneš i commit-uješ.

Svaki fajl je prikazan **ceo**, sa brojevima linija, a ispod njega je objašnjenje blok po blok. Ispod fajlova iz `web/src` stoji automatski generisana linija **„Zavisi od / Koriste ga"** — tako uvek vidiš gde fajl stoji u grafu projekta. Tri velika fajla sa podacima i stilovima (`projects.ts`, `globals.css` i stilovi forme) prikazana su kao izvodi, jer bi celi zauzeli desetine strana istog obrasca.

Obojene kutije imaju stalno značenje:

:::zasto
Arhitektonska odluka i razlog za nju. Ako razumeš „zašto", „kako" ćeš sam izvesti.
:::

:::wp
Isti koncept u WordPress svetu koji već odlično znaš. Ovo je tvoj most.
:::

:::zamka
Greška koju svi prave bar jednom. Mnoge od njih su se stvarno desile dok sam testirao ovaj projekat.
:::

:::ispod
Šta se dešava ispod haube — za radoznale. Možeš preskočiti pri prvom čitanju.
:::

:::senior
Navika koja razlikuje seniora od mediora.
:::

:::redosled
Fajl koristi nešto što pravimo kasnije. Iskucaj ga sad, proradiće kad stignemo tamo.
:::

:::testiraj
Kako da proveriš da radi — pre nego što kreneš dalje.
:::

:::commit
Tačna Conventional Commit poruka za ovaj korak.
:::

:::stack
Kako se isti zadatak radi u Laravel-u, MERN-u (Express + MongoDB + React), Gatsby-ju ili Astro-u.
:::

:::istorija
Odakle tehnologija dolazi i koji problem je rešila. Kontekst koji pomaže da zapamtiš „zašto".
:::

## Alati i nalozi

| Šta | Zašto | Cena |
| --- | --- | --- |
| Node.js 22 LTS | Next.js 16 traži Node ≥ 20.9 | besplatno |
| VS Code + ESLint, Prettier ekstenzije | editor, greške dok kucaš | besplatno |
| Git + GitHub nalog | verzije koda, CI, okidač za deploy | besplatno |
| Sanity nalog (sanity.io) | CMS za blog, Free plan | besplatno |
| Cloudflare nalog | hosting statičkog sajta, DNS, email routing, Worker za formu | besplatno |
| Resend nalog | slanje upita iz forme na tvoj email | besplatno (3.000 mesečno) |
| Domen | tvoja adresa | jedini obavezan trošak |
| Email na domenu | `hello@tvojdomen` | $0 preko Cloudflare Email Routing-a |

:::zamka Vercel Hobby i komercijalna upotreba
Vercel je kompanija iza Next.js-a i njihov hosting je odličan — ali besplatni Hobby plan je samo za lične, nekomercijalne projekte. Portfolio kojim tražiš klijente je granični slučaj. Prvo izdanje je zato koristilo Netlify, a drugo Cloudflare, čiji je besplatni plan za statičke fajlove i komercijalan i bez limita poseta (faza 10). Pošto pravimo statički export, prelazak sa jednog na drugi nije tražio nijednu promenu u kodu sajta — samo konfiguraciju.
:::

## Mapa projekta

```
mk-portfolio/
├── web/                         Next.js sajt
│   ├── src/
│   │   ├── app/                 RUTE: svaki folder = deo URL-a
│   │   │   ├── layout.tsx       omotač svake strane (<html>, header, footer)
│   │   │   ├── page.tsx         početna /
│   │   │   ├── work/[slug]/     /work/zignify/, /work/idsa/ ...
│   │   │   ├── blog/            /blog/ i /blog/[slug]/
│   │   │   ├── thanks/          /thanks/ (forma bez JavaScript-a)
│   │   │   ├── sitemap.ts       /sitemap.xml
│   │   │   └── robots.ts        /robots.txt
│   │   ├── components/          React komponente (layout, sections, ui, motion, blog)
│   │   ├── content/             podaci u TypeScript-u (iskustvo, pitanja forme, rezervni projekti)
│   │   ├── lib/                 čiste funkcije, tipovi i repozitorijum projekata
│   │   ├── hooks/               sopstveni React hookovi
│   │   ├── sanity/              klijent, GROQ upiti, slike
│   │   └── styles/tokens.css    dizajn tokeni (boje, fontovi, razmaci)
│   ├── public/                  slike i _headers (keš i bezbednosna zaglavlja)
│   ├── worker/                  Cloudflare Worker: prijem forme i slanje email-a
│   ├── wrangler.jsonc           kako Cloudflare servira sajt i pokreće Worker
│   ├── scripts/                 jednokratne skripte (migracija projekata u Sanity)
│   └── tests/                   unit testovi (node:test)
├── studio/                      Sanity Studio — „admin panel" za projekte i blog
├── .github/workflows/ci.yml     CI: tipovi, lint, testovi, build
└── docs/CLOUDFLARE.md           uputstvo za hosting korak po korak
```

## Životni ciklus: gde se šta izvršava

Ovo je najvažnija slika u celom priručniku. Ako je razumeš, razumeš Next.js.

```
 BUILD (tvoj računar ili Cloudflare, jednom po deploy-u)
 ───────────────────────────────────────────────────
  next build
    ├─ poziva page.tsx, work/[slug]/page.tsx, blog/... (Server Components)
    │    └─ await getProjects(), getLatestPosts() ──► Sanity API (GROQ) ──► JSON
    ├─ React pretvara komponente u HTML
    └─ piše out/index.html, out/work/idsa/index.html, ... + JS za interaktivne delove

 BROWSER (posetilac, svaki put)
 ───────────────────────────────────────────────────
  1. dobije gotov HTML  → vidi sadržaj odmah (brzo, odlično za SEO)
  2. učita JS samo za Client Components ('use client')
  3. HIDRATACIJA: React „oživi" postojeći HTML (dugmad, meni, filteri)
  4. useEffect kod se pokreće: GSAP, Lenis, Three.js
  5. forma „Start a project" šalje upit ──► Worker /api/inquiry ──► Resend ──► tvoj email
```

:::wp
U WordPress-u se PHP izvršava na **svaki zahtev**: posetilac traži stranu, server pokrene `WP_Query`, sklopi HTML i pošalje ga. Ovde se „PHP deo" (Server Components) izvršava **jednom, pri build-u**. Posetilac dobija unapred sklopljen HTML — kao da je ceo sajt keširan WP Super Cache-om, ali bez servera iza. Zato je brz i besplatan za hosting. Cena: kad promeniš sadržaj, sajt se mora ponovo izgraditi (to automatizujemo u fazi 10).
:::

## React mentalni model — prevod sa WordPress-a

| WordPress | React / Next.js | Napomena |
| --- | --- | --- |
| šablon (`single.php`, `template-parts/`) | komponenta (funkcija koja vraća JSX) | komponenta = šablon + logika, u jednom fajlu |
| `get_template_part('card', null, $args)` | `<Card title="..." />` | `$args` su **props** |
| The Loop (`while have_posts()`) | `posts.map(post => <PostCard .../>)` | svaki element liste dobija `key` |
| `if ( $x ) : ... endif;` u šablonu | `{x && <Tag/>}` ili `{x ? <A/> : <B/>}` | JSX je izraz, ne naredba |
| `wp_enqueue_script` za interaktivnost | `'use client'` komponenta | JS ide samo za te delove |
| `add_action('wp_footer', ...)` + jQuery | `useEffect(() => {...}, [])` | kod posle prikaza, sa čišćenjem |
| `$_GET` filter u URL-u, reload strane | `useState` + ponovni render | bez reload-a |
| custom post type + ACF | Sanity šema (`defineType`) | CMS bez šablona; sajt odlučuje prikaz |
| `WP_Query` | GROQ upit | jezik upita, ne PHP objekat |
| permalink `/%postname%/` | folder `app/blog/[slug]/` | ruta = struktura foldera |
| `wp_head()` / Yoast | `export const metadata` | SEO po strani, u kodu |
| `functions.php` | `lib/`, `hooks/`, `content/` | razbijeno po odgovornosti |

## Rečnik

- **Komponenta** — funkcija koja prima `props` i vraća JSX. Ime počinje velikim slovom.
- **JSX** — HTML-oliki zapis unutar JavaScript-a; prevodi se u pozive funkcija.
- **Props** — ulazni parametri komponente (samo za čitanje).
- **State** — memorija komponente koja, kad se promeni, izaziva ponovni render.
- **Render** — React poziva tvoju funkciju da sazna kako UI treba da izgleda.
- **Hook** — funkcija `use...` koja daje komponenti mogućnosti (state, efekte, kontekst).
- **Server Component** — komponenta koja se izvršava samo na serveru/pri build-u; ne šalje JS u browser.
- **Client Component** — fajl sa `'use client'`; renderuje se i na serveru (HTML) i u browseru (interaktivnost).
- **Hidratacija** — React u browseru preuzima HTML koji je napravio server i kači event-e.
- **Statički export** — `output: 'export'`: ceo sajt kao fajlovi, bez Node servera.
- **GROQ** — Sanity-jev jezik upita.
- **Portable Text** — Sanity-jev format za bogat tekst (JSON umesto HTML-a).

## Principi kojih se držimo

| Princip | Kako izgleda u ovom projektu |
| --- | --- |
| Jedna odgovornost | `lib/format.ts` samo formatira; `sanity/api.ts` samo dohvata podatke |
| Podaci odvojeni od prikaza | sadržaj u Sanity-ju i `content/`, komponente ga primaju kroz props |
| Najmanje JS-a u browseru | sekcije su Server Components; samo meni, filteri i animacije su klijentske |
| Graciozna degradacija | bez Sanity-ja → lokalni projekti i planirane teme; bez GSAP-a → statičan sajt; bez JS-a → forma i dalje radi; reduced motion → bez animacija |
| Iskrenost kao feature | ništa izmišljeno: nepotvrđeno = vidljiva oznaka „To be confirmed" |
| Sve proverljivo | tipovi (TypeScript), testovi (node:test), CI na svaki push |
