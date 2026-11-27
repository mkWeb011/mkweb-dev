# Faza 8a — Projekti u Sanity-ju: novi projekat bez diranja koda

**Cilj faze:** projekti prelaze iz `content/projects.ts` u Sanity. Novi projekat dodaješ u Studiju (i sa telefona), klikneš Publish, i za dva minuta postoji na sajtu — sa svojom stranom, u listi, u sitemap-u. Lokalni fajl ostaje kao seme za uvoz i rezerva kad Sanity nije podešen.

:::zasto Zašto tek sada, a ne od početka?
Blog je bio „vežba" za Sanity: naučio si šemu, GROQ, klijenta i webhook na sadržaju koji ne može ništa da pokvari. Projekti su srce portfolija — prebacuješ ih kad već znaš alat. Isti redosled preporuči klijentu: prvo jedan jednostavan tip sadržaja u CMS-u, pa tek onda ključni.
:::

## Tok podataka posle migracije

```
 Studio ── Publish ──► Content Lake ──► webhook ──► Cloudflare build
                                                       │
  getProjects()  (lib/project-repository.ts)  ◄────────┘
     ├─ getSanityProjects()   GROQ: PROJECTS_QUERY  → unknown[]
     ├─ normalizeProject()    provera i popravka oblika → Project | null
     └─ ništa validno?        → content/projects.ts (18 lokalnih)
            │
            ├─ app/page.tsx            SelectedWork, ProjectIndex, Writing
            ├─ app/work/[slug]/        jedna strana po projektu
            ├─ app/blog/page.tsx       imena povezanih case studija
            └─ app/sitemap.ts          URL za svaki projekat
```

## Šema projekta

@file studio/schemaTypes/project.ts

Šema je **ogledalo tipa `Project`** iz `lib/types.ts`. Svako polje ovde ima par tamo. Prođimo kroz ono što je novo u odnosu na šemu posta.

**Grupe (tabovi).** `groups: [card, case, visual]` i `group: 'card'` na poljima dele formu na tri kartice: šta treba listi (ime, slug, redosled, tagovi, sažetak), šta treba strani case studije, i vizual. Dvadeset polja jedno ispod drugog na telefonu je zid; tri kartice su tri kratka ekrana.

**`order` umesto drag-and-drop-a.** Redosled je broj, sa preporukom „ostavljaj razmake (10, 20, 30)". Kad dodaš projekat između drugog i trećeg, daš mu 25 — ne moraš da prenumerišeš ostale. Postoji i plugin za prevlačenje (`@sanity/orderable-document-list`), ali dodaje zavisnost i polje koje ne vidiš; broj je dosadan, providan i radi zauvek.

**Tagovi kao lista sa opcijama.** `options: { list: TAGS..., layout: 'grid' }` pretvara niz stringova u kvadratiće za štikliranje. Urednik ne može da otkuca „Wordpress" sa malim p — a sajt filtrira po tačnom stringu. Lista je kopija `PROJECT_TAGS` iz web dela, uz komentar da ih treba držati usklađenim (Studio i sajt su odvojeni paketi i ne dele kod).

**Validacija kao uređivačka politika.** `summary` mora imati 20–240 znakova (dovoljno za karticu i meta description), `approach` i `delivered` bar jednu stavku, link mora biti `https`/`http` URL, slika mora imati alt tekst. Polje `outcome` ima opis „Only documented, verifiable results. No invented numbers." — pravilo iskrenosti sada stoji tamo gde se sadržaj piše, ne samo u testu.

**`cover` je opcion.** Prazno → sajt crta generisani vizual (hue + monogram). Kad dodaš screenshot, `ProjectVisual` ga koristi sam (faza 2).

**`preview.prepare`** prikazuje u listi Studija „20 · ★ featured" ispod imena — vidiš redosled i izdvojene projekte bez otvaranja dokumenta.

:::wp
Ovo je tačno ono što bi u WordPress-u bio custom post type „project" sa ACF field group-om podeljenim u tabove. Razlike: šema je kod (verzionisan u Git-u, pregledan u PR-u), polje „order" je ono što je `menu_order` u WP-u, a lista tagova je ACF Checkbox polje.
:::

:::stack Model sadržaja u drugim stackovima
**Laravel:** migracija (`$table->string('slug')->unique(); $table->json('approach');`) + Eloquent model sa `$casts = ['approach' => 'array']` + Filament resurs za admin formu. **MERN:** Mongoose šema `new Schema({ slug: { type: String, unique: true }, approach: [{ title: String, description: String }] })`; admin praviš sam ili koristiš Payload CMS. **Gatsby:** šemu ne pišeš — `gatsby-source-sanity` je izvede iz Sanity-ja u GraphQL. U sva tri slučaja moraš da odlučiš isto: koja polja, koja obavezna, koja ponovljiva.
:::

## Normalizacija: granica između CMS-a i koda

`PROJECTS_QUERY` (faza 8) vraća ono što je urednik upisao — a urednik može da ostavi polje prazno, da obriše sliku a ostavi alt, ili da sačuva dokument bez slug-a. Zato `getSanityProjects()` vraća `unknown[]`, a ne `Project[]`. Pre nego što podaci uđu u komponente, prolaze kroz `normalizeProject`:

@code web/src/lib/projects.ts | 9 | 71

Blok po blok:

- **Type guard `isRecord`.** Povratni tip `v is Record<string, unknown>` znači: „ako vratim `true`, TypeScript posle toga sme da tretira `v` kao objekat". Bez toga ne bi smeo ni da pročita `raw.slug`.
- **`str` i `strList`** — mali alati koji pretvaraju „bilo šta" u `string | null`, odnosno u niz stringova. Prazan string i string od razmaka postaju `null` — za UI „prazno" znači „nema", pa se prikaže oznaka „to be confirmed".
- **`isTag`** — predikat koji sužava `string` na `ProjectTag`. Tag koji ne postoji u `PROJECT_TAGS` (stara vrednost, greška u kucanju) tiho ispada, umesto da napravi prazno dugme u filteru.
- **Minimum je slug + ime.** Bez njih nema URL-a ni naslova, pa funkcija vraća `null`, a repozitorijum taj dokument preskače.
- **`flatMap` za čišćenje nizova.** `flatMap((step) => title && description ? [{ title, description }] : [])` — vrati niz od jednog elementa da ga zadržiš, prazan niz da ga izbaciš. To je `filter` i `map` u jednom prolazu, i TypeScript zna tačan tip rezultata.
- **`initials`** — kad urednik ne upiše monogram, pravi ga iz imena: „Social Hype" → „SH", „Zignify" → „Zi".

:::zasto Ručna provera ili Zod?
Biblioteka **Zod** (`z.object({ slug: z.string(), ... })`) radi ovo deklarativno i odlična je za veće šeme ili API-je. Ovde smo pisali ručno iz dva razloga: jedan tip i četrdeset linija ne opravdavaju novu zavisnost, a ručna verzija **popravlja** (podrazumevani hue, inicijali, izbacivanje loših stavki) umesto da samo odbije. Kad budeš pravio MERN API koji prima podatke od korisnika, Zod je pravi izbor — isti oblik validiraš i na serveru i u formi.
:::

:::zamka „Tipizovano" ne znači „provereno"
`client.fetch<Project[]>(query)` bi se kompajliralo bez greške — ali generički parametar je samo **obećanje** koje daješ kompajleru, ne provera. Ako Sanity vrati `stack: null` ili `tags: ["Wordpress"]`, TypeScript to ne bi video, a komponenta bi pukla tek u browseru. Pravilo: podatke sa mreže, iz baze ili od korisnika tipiziraš kao `unknown` i proveriš ih na granici.
:::

## Repozitorijum projekata

@file web/src/lib/project-repository.ts

- **Jedno mesto koje zna izvor.** Strane zovu `getProjects()` i ne znaju da li lista dolazi iz Sanity-ja ili iz fajla. Pravilo izbora je jednostavno i zapisano na vrhu: ako Sanity ima bar jedan validan projekat, on je izvor; inače lokalni fajl. Nema mešanja dva izvora, jer bi to dovelo do duplikata i nejasnog redosleda.
- **Memoizacija obećanja.** `cached ??= loadProjects()` — operator `??=` dodeljuje samo ako je promenljiva `null`/`undefined`. Pamti se **Promise**, ne rezultat: ako početna strana, 18 case strana i sitemap pozovu `getProjects()` gotovo istovremeno, svi čekaju isti jedan zahtev ka Sanity-ju umesto da pošalju dvadeset.
- **`resetProjectsCache`** postoji samo za testove — da svaki test krene od čistog stanja.
- **Samo na serveru.** Fajl uvozi Sanity klijent. Kad bi ga uvezla klijentska komponenta, klijent bi završio u JavaScript paketu u browseru. Zato su pomoćne funkcije (`findProject`, `countByTag`…) u posebnom, čistom fajlu `lib/projects.ts`.

:::ispod Kako Next.js deli posao pri build-u
`next build` renderuje strane u više radnih procesa paralelno. Memoizacija na nivou modula važi **unutar jednog procesa**, pa u praksi možeš videti nekoliko zahteva ka Sanity-ju umesto jednog — i dalje daleko manje od jednog po strani. React ima i funkciju `cache()` za istu namenu po zahtevu; za statički export, memoizovano obećanje je najjednostavnije i radi i u testovima van Next-a.
:::

:::senior Paket `server-only`
U projektima sa serverom, na vrh ovakvog fajla stavi `import 'server-only'`. Ako ga ikad uveze klijentska komponenta, build pada sa jasnom porukom. Ovde ga nismo dodali jer smo granicu rešili strukturom fajlova, ali je dobra navika čim u fajlu postoji tajna (token, ključ).
:::

## Migracija: 18 projekata jednom komandom

Ne prekucavaš 18 case studija ručno. Skripta pretvara lokalni fajl u format koji Sanity CLI uvozi:

@file web/scripts/export-projects.ts

- **NDJSON** (newline-delimited JSON) — jedan dokument po liniji. Format koji `sanity dataset import` čita, a lako se generiše i čita liniju po liniju čak i kad ima milion dokumenata.
- **Fiksni `_id`: `project-<slug>`.** Uvoz je zato **idempotentan**: pokreneš ga dvaput — dobiješ iste dokumente, ne duplikate. Bez fiksnog ID-ja svaki uvoz bi napravio 18 novih projekata.
- **`slug: { _type: 'slug', current }`** — Sanity čuva slug kao objekat. GROQ ga u upitu „spljošti" nazad (`"slug": slug.current`), pa ga `normalizeProject` vidi kao običan string.
- **`_key` u nizovima.** Sanity zahteva jedinstven ključ na svakom objektu u nizu (zbog istovremenog uređivanja: dva urednika menjaju različite korake istog niza). Generišemo stabilne ključeve `step0`, `link1`…
- **`order: (index + 1) * 10`** — razmaci od deset, kao što šema preporučuje.
- **`undefined` umesto `null`.** `JSON.stringify` izostavlja polja čija je vrednost `undefined`. Prazna opciona polja zato uopšte ne postoje u dokumentu — tačno kao kad urednik nikad nije dirao polje.
- **„Pokreni samo ako sam pozvan direktno."** Poslednji blok upoređuje putanju pokrenutog fajla sa `import.meta.url`. Test uvozi funkciju `toSanityDocument` bez pisanja fajla na disk — ista ideja kao Python-ov `if __name__ == '__main__'`.

```bash
cd web && npm run seed:projects           # → studio/seed/projects.ndjson
cd ../studio && npm run import:projects   # → 18 projekata u datasetu production
```

Skripta `import:projects` je u `studio/package.json` (prikazan u fazi 7): `sanity dataset import seed/projects.ndjson production --replace`. `--replace` znači „ako dokument sa tim `_id` postoji, zameni ga" — zato je bezbedno pokrenuti uvoz ponovo posle izmene lokalnog fajla. Folder `studio/seed/` je u `.gitignore`: generiše se, ne čuva.

:::zamka Uvoz preko izmena iz Studija
Kad jednom počneš da uređuješ projekte u Studiju, **Studio je izvor istine**. Ponovni uvoz sa `--replace` bi pregazio te izmene starim tekstom iz fajla. Pravilo: migracija se pokreće jednom; posle toga, `content/projects.ts` je samo rezerva za lokalni razvoj i CI.
:::

## Testovi

Testovi za ovu fazu su u `projects.test.ts` i `sanity.test.ts` (prikazani u fazama 3 i 8):

- dokument bez slug-a ili imena se odbacuje; prazna polja dobijaju bezbedne podrazumevane vrednosti; nepostojeći tag ispada;
- nekompletni koraci i linkovi se izbacuju;
- svih 18 lokalnih projekata prolazi kroz `normalizeProject` bez gubitka podataka („round trip");
- izvoz pravi stabilan `_id`, slug objekat i `_key` na svakom elementu, a Sanity oblik se normalizuje nazad u isti projekat;
- bez Sanity podešavanja repozitorijum vraća lokalnu listu, a drugi poziv vraća **isto** memoizovano obećanje.

Pored unit testova, renderovao sam sve strane sa simuliranim Sanity odgovorom od tri dokumenta: potpun projekat sa slikom, „poluprazan" projekat i dokument bez slug-a. Rezultat: dve case strane (treći je preskočen), slika sa Sanity CDN-a sa alt tekstom iz Studija, i „to be confirmed/written" oznake na praznim sekcijama poluprazne strane.

:::testiraj Dodaj projekat sa telefona
1. Otvori `mk-portfolio.sanity.studio` na telefonu → Project → Create.
2. Card: ime, Generate slug, `order` 25, tag, sažetak. Case study: uloga, overview, jedan korak, jedna isporuka. Publish.
3. Webhook pokreće Cloudflare build (faza 10); posle ~2 minuta projekat je u indeksu, ima stranu `/work/<slug>/` i stoji u `sitemap.xml`.
:::

:::commit
`feat(projects): move case studies to Sanity with normalised repository and seed import`
:::
