# Faza 7 — Sanity Studio: tvoj „wp-admin"

**Cilj faze:** napraviš Sanity projekat, definišeš šemu bloga (post, kategorija, bogat tekst), pokreneš Studio lokalno, napišeš prvi post i objaviš Studio na internet.

:::wp Velika razlika u odnosu na WordPress
U WordPress-u baza, admin i šabloni su jedan sistem. Sanity razdvaja tri stvari: **Content Lake** (baza u oblaku, Sanity je hostuje), **Studio** (admin, React aplikacija koju TI konfigurišeš kodom) i **frontend** (naš Next.js sajt koji čita podatke). Studio ne zna kako sajt izgleda; sajt ne zna kako Studio izgleda. Povezuje ih samo šema — oblik podataka.
:::

## Korak 1: Sanity nalog i projekat

1. Napravi nalog na sanity.io (prijava preko GitHub-a je najbrža).
2. U folderu `mk-portfolio` pokreni:

```bash
npm create sanity@latest -- --template clean --typescript --output-path studio --dataset production
```

CLI će te pitati za ime projekta (npr. „mk-portfolio") i napraviće projekat na tvom nalogu. Zapamti **Project ID** koji ispiše (npr. `a1b2c3d4`) — videćeš ga i na sanity.io/manage.

3. Generisane fajlove zameni našim verzijama, redom ispod.

:::zasto Besplatni plan je dovoljan
Sanity Free plan ne ističe i uključuje do 20 korisnika, 2 javna dataseta i do 10.000 dokumenata. Za blog sa par stotina članaka si daleko ispod granica. Dataset je **javan**, što znači da objavljeni postovi mogu da se čitaju bez tokena — upravo ono što želimo za javni blog.
:::

## Korak 2: konfiguracija Studija

@file studio/package.json

`sanity` je ceo Studio kao paket; `@sanity/vision` je GROQ igralište; `styled-components` je zavisnost Studio interfejsa.

@file studio/tsconfig.json

@file studio/.env.example

Kopiraj u `.env` i upiši Project ID. Samo promenljive sa prefiksom `SANITY_STUDIO_` stižu do Studija u browseru — isto pravilo kao `NEXT_PUBLIC_` u Next.js-u.

@file studio/sanity.config.ts

- `structureTool()` — interfejs sa listom dokumenata i editorom.
- `visionTool()` — kartica „Vision" u Studiju gde kucaš GROQ upite i odmah vidiš rezultat. Svaki upit iz faze 8 prvo isprobaj ovde.
- `schema: { types: schemaTypes }` — šta sve postoji u bazi.

@file studio/sanity.cli.ts

Podešavanja za komandnu liniju. `studioHost: 'mk-portfolio'` znači da `npm run deploy` objavljuje Studio na `https://mk-portfolio.sanity.studio` — besplatno, hostuje Sanity. Ako je ime zauzeto, CLI te pita za drugo.

## Korak 3: šema

@file studio/schemaTypes/index.ts

Spisak svih tipova koje Studio poznaje. Redosled u nizu je redosled u levom meniju Studija — zato je `project` prvi: projekte ćeš uređivati češće od kategorija.

:::redosled
`project` šemu pišemo u fazi 8a, kad sajt bude spreman da čita projekte iz Sanity-ja. Do tada izostavi taj import i element niza.
:::

### Kategorija

@file studio/schemaTypes/category.ts

- `defineType` i `defineField` — pomoćne funkcije koje daju TypeScript proveru i automatsko dopunjavanje u editoru. Same po sebi ne rade ništa osim što vrate objekat.
- `type: 'slug'` sa `options.source: 'title'` — dugme „Generate" pravi slug iz naslova, kao WordPress.
- `validation: (rule) => rule.required().max(40)` — Studio ne dozvoljava objavu bez naslova ili sa predugim naslovom.

### Post

@file studio/schemaTypes/post.ts

- `categories` je niz **referenci** na dokumente tipa `category` — kao WordPress taksonomija, ali eksplicitno. U GROQ-u ćemo pratiti te reference operatorom `->`.
- `mainImage` sa `hotspot: true` — urednik u Studiju označi „važan deo" slike; kad sajt traži isečak 16:9 ili kvadrat, Sanity CDN seče oko hotspot-a. Polje `alt` je **obavezno** — pristupačnost i SEO.
- `publishedAt` — post bez datuma se ne gradi na sajtu (filter u GROQ upitu). To ti je „draft za sajt", nezavisno od Sanity-jevog draft sistema.
- `preview` — kako dokument izgleda u listi Studija: naslov, datum ispod, slika levo.

:::zamka Implicitni any u preview.prepare — pronađeno pri proveri tipova
Prva verzija je imala `prepare: ({ title, date, media }) => ...` bez tipova. U strogom TypeScript-u parametri dobijaju tip iz konteksta — ali kad kontekst nije dovoljno precizan, to je „implicitni any" i build pada. Rešenje je eksplicitan tip: `({ title, date, media }: { title?: string; date?: string; media?: unknown })`. Ovo je i bolja dokumentacija: odmah vidiš šta `select` vraća.
:::

### Bogat tekst

@file studio/schemaTypes/blockContent.ts

Portable Text je bogat tekst sačuvan kao **JSON**, ne kao HTML. Ovde odlučuješ šta urednik sme: stilovi Normal/H2/H3/Quote, liste, bold/italic/code, linkovi, slike sa alt tekstom i blokovi koda sa jezikom.

:::zasto Zašto ne HTML?
U WordPress-u `post_content` je HTML. Urednik može da nalepi `<div style="color:red">` iz Word-a i pokvari dizajn; a kad sajt menja izgled, stari HTML ostaje zarobljen u bazi. Portable Text čuva **značenje** („ovo je naslov drugog nivoa"), a sajt odlučuje izgled. Isti sadržaj možeš sutra da prikažeš u mobilnoj aplikaciji ili newsletter-u.
:::

:::senior Ugovor između šeme i sajta
Svaki stil i tip koji dozvoliš ovde mora imati prikaz u `web/src/components/blog/PostBody.tsx` (faza 8). Ako dodaš blok „video" u šemu, a zaboraviš prikaz — post se prikaže bez videa i bez greške. Komentar na vrhu oba fajla podseća na to.
:::

## Korak 4: pokretanje i prvi sadržaj

```bash
cd studio
npm install
npm run dev          # http://localhost:3333
```

Prijavi se, napravi kategoriju „Migration", pa post: naslov, Generate za slug, excerpt, datum objave, kategorija, slika sa alt tekstom, malo teksta. Klikni **Publish**.

Otvori karticu **Vision** i probaj:

```
*[_type == "post"]{ title, "slug": slug.current, publishedAt }
```

:::testiraj
Vision vraća niz sa tvojim postom. Ako vraća `[]`, proveri da li si kliknuo Publish (draft dokumenti imaju ID koji počinje sa `drafts.` i ne vide se javno).
:::

## Korak 5: objava Studija (i reč o CORS-u)

Naš sajt čita Sanity samo **na serveru** — pri build-u i u razvojnom serveru (`npm run dev` izvršava Server Components u Node-u). Browser posetioca nikad ne zove Sanity API, pa CORS podešavanje nije potrebno. Ako jednog dana dodaš pretragu koja zove Sanity iz browsera, dodaćeš domen sajta u sanity.io/manage → API → CORS origins.

Objavi Studio:

```bash
npm run deploy       # → https://mk-portfolio.sanity.studio
```

Od sada blog uređuješ sa bilo kog računara — i sa telefona — bez pokretanja koda.

:::stack Admin panel u drugim stackovima
**WordPress:** wp-admin dolazi gotov, ti ga prilagođavaš (ACF, CPT). **Laravel:** admin praviš sam ili koristiš Filament / Nova — PHP klase opisuju forme i tabele, slično Sanity šemama. **MERN:** obično pišeš sopstveni React admin ili koristiš headless CMS (Payload je popularan jer je i sam Node + MongoDB/Postgres). **Gatsby:** nema svoj admin — uvek ide uz CMS (WordPress, Contentful, Sanity). Sanity je blizu Filament-a po filozofiji: admin opisan kodom, verzionisan u Git-u.
:::

:::commit
`feat(studio): add Sanity Studio v5 with post, category and portable text schemas`
:::
