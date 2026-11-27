# Faza 3 — Sadržaj kao podaci i statičke sekcije

**Cilj faze:** tvoj CV postaje tipizirani sadržaj, a početna strana se sklapa od Server Components koje taj sadržaj primaju kroz props. Na kraju faze početna strana prikazuje sve sekcije — bez ijedne linije klijentskog JavaScript-a.

## Sadržaj u TypeScript-u

### projects.ts — 18 case studija

Fajl ima oko 660 linija, ali je to 18 puta isti oblik. Evo prvog projekta u celosti:

@code web/src/content/projects.ts | 1 | 76

I jednog sa nepotvrđenim podacima — primeti `null` vrednosti:

@code web/src/content/projects.ts | 538 | 568

:::zasto Zašto prvo u kodu, pa tek onda u Sanity-ju?
U prvom izdanju projekti su živeli samo ovde. U drugom ih prebacujemo u Sanity (faza 8a), a ovaj fajl ostaje kao **seme i rezerva**: iz njega se generiše uvoz u Sanity, i on se koristi kad Sanity nije podešen (lokalni razvoj, CI). Redosled je namerno takav: prvo naučiš oblik podataka u TypeScript-u, gde ti kompajler pomaže, pa ga tek onda preneseš u CMS. Isto bi uradio sa klijentom — model sadržaja se dogovori pre nego što se otvori admin.
:::

:::zamka Izmišljene metrike
Svaka rečenica u ovom fajlu potiče iz tvog CV-a ili javnog opisa klijenta. „Povećali smo konverziju 40%" bez dokaza je laž koju iskusni klijent prepozna — i ruši poverenje u sve ostalo. Test `content.test.ts` (ispod) pada ako se u tekstu projekta pojavi procenat, da te natera da ga proveriš pre objave.
:::

### experience.ts, capabilities.ts, posts.ts

@file web/src/content/experience.ts

@file web/src/content/capabilities.ts

U `capabilities.ts` polje `proof` kaže **gde** je veština dokazana („Drupal → WordPress" → IDSA). To nije samo lepo: posetilac može da klikne taj projekat i proveri. Iskrenost kao feature.

Osam grupa prate tvoje pozicioniranje: Build (WordPress), Headless, Frontend, Migrate, Grow, Automate, DevOps i Next. Dokaz „This site" znači da je veština dokazana **upravo ovim projektom** — sajt je napravljen sa Next.js-om, Sanity-jem i CI pipeline-om, i kod je javan. Grupa „Next" sa statusom `growing` (Node/Express/MongoDB, Webflow + Next.js, programmatic SEO) je ono što aktivno učiš: kad završiš prvi takav projekat, stavku prebaciš u odgovarajuću „proven" grupu i upišeš projekat kao dokaz.

@file web/src/content/posts.ts

Planirane teme bloga. Prikazujemo ih sa oznakom **Planned** dok u Sanity-ju ne objaviš prve postove — tada ih sajt automatski zameni pravim člancima (faza 8).

## lib/projects.ts — čiste funkcije nad listom projekata

Fajl ima dva dela. Prvi (normalizacija podataka iz Sanity-ja) objašnjavamo u fazi 8a; ovde gledamo vrh i drugi deo — pomoćne funkcije koje koriste strane i komponente:

@code web/src/lib/projects.ts | 1 | 8

@code web/src/lib/projects.ts | 72 | 117

Ovo je tvoj `WP_Query` za projekte, samo kao obične funkcije — i sve primaju **listu kao argument**:

- `getFeaturedProjects(list)` — `filter` vraća novi niz sa elementima za koje je uslov tačan (PHP: `array_filter`).
- `findProject(list, slug)` — `find` vraća prvi element ili `undefined`. Zato je povratni tip `Project | undefined`, i stranica mora da obradi slučaj „nema ga" (404).
- `getNextProject` — `(index + 1) % list.length` je modulo: posle poslednjeg projekta ide prvi. A `?? project` je tu zbog `noUncheckedIndexedAccess`: `list[i]` je tipa `Project | undefined`, pa TypeScript traži rezervnu vrednost.
- `countByTag` — prolazi kroz sve tagove i broji projekte; tagovi sa nula projekata se izostavljaju (nema smisla dugme „Custom code (0)").
- `type TagFilter = ProjectTag | 'All'` — proširujemo postojeći tip jednom dodatnom vrednošću.

:::zasto Zašto lista kao argument, a ne uvezeni niz?
U prvom izdanju funkcije su same uvozile `projects` iz `content/`. Čim su projekti prešli u Sanity, to više nije moglo: podaci stižu **asinhrono**, pri build-u, a funkcija ne može da „zna" za njih unapred. Rešenje je obrnuti zavisnost: strana učita listu (`await getProjects()`) i preda je funkcijama. Bonus: fajl više ne uvozi ni Sanity klijent ni 660 linija sadržaja, pa je bezbedan za **klijentske** komponente — `ProjectIndex` ga koristi u browseru, a u JavaScript paket ne ulazi ništa suvišno.
:::

:::senior Čiste funkcije su najjeftiniji kod
Isti obrazac kao `now` u `timeIn`: sve što funkcija koristi, dobija kroz parametre. Kod koji se lako testira je skoro uvek i kod koji je lako menjati — upravo smo promenili izvor podataka, a nijedna od ovih funkcija se nije promenila iznutra.
:::

## Testovi sadržaja

@file web/tests/projects.test.ts

@file web/tests/content.test.ts

`projects.test.ts` testira funkcije, a `content.test.ts` testira **pravila sadržaja**: da planirani postovi pokazuju na postojeće case studije, da je iskustvo hronološki poređano, da nema izmišljenih procenata. Ovakvi testovi hvataju greške koje nijedan tip ne vidi — npr. kad promeniš slug `idsa` u `idsa-migration`, a zaboraviš planirani post koji pokazuje na njega.

:::testiraj
```bash
npm test     # 37 testova, svi prolaze (sa fazama 8a i 8b)
```
:::

## Sekcije početne strane — Server Components

Sve sekcije u ovoj fazi su **Server Components**: nemaju `'use client'`, nemaju state, ne šalju JS u browser. Dobijaju podatke kroz props i vraćaju HTML.

### Hero

@file web/src/components/sections/Hero.tsx

- `CORE` je konstanta van komponente — pravi se jednom, ne pri svakom renderu. Lista prati pozicioniranje: WordPress, Webflow, Next.js, Headless CMS, CI/CD & hosting, Technical SEO. Uvodna rečenica i ova lista su prvo što klijent pročita — zato su kratki i konkretni, bez „passionate developer" fraza.
- `{CORE.map((item) => <li key={item}>{item}</li>)}` — The Loop u React-u. `key={item}` je u redu jer su vrednosti jedinstvene.
- `<HeroCanvas />` je **Client Component** ugnežđen u Server Component. Ovo je ključna ideja: server prikaže sav tekst, a JavaScript se šalje samo za „ostrvo" sa Three.js sferom.
- `<Link href="/#work">` — Next-ov `Link` umesto `<a>`: između strana sajta navigira bez ponovnog učitavanja i unapred dohvata sledeću stranu.

:::redosled
`HeroCanvas` pravimo u fazi 6. Do tada obriši red `<HeroCanvas />` (i import) ili napravi privremeni fajl koji vraća `null`.
:::

### Statement

@file web/src/components/sections/Statement.tsx

`&apos;` i `&amp;` — u JSX tekstu apostrof i ampersand pišemo kao HTML entitete (ESLint pravilo `react/no-unescaped-entities` to traži, da se izbegne zabuna sa navodnicima).

:::zamka Selektor koji je pogodio pogrešan element — desilo se u prototipu
U prvoj verziji prototipa stil za veliku izjavu je bio `.statement p { font-size: 72px }`. Problem: u sekciji su **dva** paragrafa — izjava i mali potpis ispod nje. Potpis je dobio 72 px i razbio raspored. Rešenje je bilo gađati `#statement` (samo veliki paragraf). Pouka: selektor po tipu elementa unutar sekcije je krhak; ciljaj ono što stvarno misliš.
:::

### Capabilities

@file web/src/components/sections/Capabilities.tsx

- `key={group.title + (group.accent ?? '')}` — poslednja grupa nema `title` (samo `accent: 'Next'`), pa ključ sklapamo iz oba polja da ostane jedinstven.
- `` className={`cap${group.status === 'growing' ? ' growing' : ''}`} `` — ternarni operator u template stringu za uslovnu klasu.
- `data-caps-pin` i `data-caps-track` — oznake za horizontalni skrol (faza 6). Komponenta ostaje čisto statična; na mobilnom i bez JS-a je obična vertikalna lista kartica.

### About i Experience

@file web/src/components/sections/About.tsx

`FACTS` je niz parova `[string, string][]` — **tuple** tip: svaki element je niz od tačno dva stringa. Destrukturiramo ga u `.map(([term, value]) => ...)`.

@image web/public/images/marko-kostic.webp | 5

**Portret i `next/image`.** `<Image width={720} height={900} sizes="...">` radi tri stvari: rezerviše prostor (nema skoka sadržaja), dodaje `loading="lazy"` i `decoding="async"`, i ispisuje `sizes` da browser zna koliko je slika široka na ekranu. Pošto je export statički (`images.unoptimized`), Next ne pravi više veličina — zato je fajl unapred pripremljen: WebP, 720×900 (dvostruko od kolone od 360 px, za retina ekrane), već obojen u paletu sajta. `data-reveal="portrait"` je oznaka za animaciju otkrivanja iz faze 6.

@file web/src/components/sections/Experience.tsx

- `` aside={`2017 — Present · ${jobs.length} roles`} `` — prop može biti bilo koji izraz; broj uloga se računa iz podataka, pa se nikad ne „raziđe" sa sadržajem.
- `key={job.company + job.dates}` — ime firme samo po sebi ne bi bilo dovoljno jedinstveno (ista firma, dva perioda).

### Lab, Contact, Footer

@file web/src/components/sections/Lab.tsx

@file web/src/components/sections/Contact.tsx

Sekcija je sada `09 / Contact`, jer je ispred nje forma „Start a project" (faza 8b). Pored Google Meet dugmeta stoji link „Or describe your project →" ka formi: posetilac koji nije spreman za poziv dobija drugi, mirniji put.

@file web/src/components/layout/Footer.tsx

U `Footer`-u, `new Date().getFullYear()` se izvršava **pri build-u**. Godina je „zamrznuta" u HTML-u do sledećeg deploy-a — što je u redu, jer svaki deploy ponovo gradi sajt. Da je ovo Client Component, ista linija bi se izvršila i u browseru, a razlika između servera i klijenta bi izazvala grešku hidratacije (više o tome u fazi 4).

:::redosled
`Lab` koristi `SignalWave`, a `Contact` koristi `Magnetic` — oba su animacione komponente iz faze 6. Do tada privremeno ukloni `<SignalWave />`, a `<Magnetic>` zameni samim `<a>` elementom unutar njega.
:::

## Sklapanje početne strane

@file web/src/app/page.tsx

Ovo je ceo `index.php` tvog sajta:

- `export default async function HomePage()` — **async komponenta**. Moguće je samo u Server Components: React sačeka podatke pri build-u i tek onda pravi HTML. Posetilac nikad ne čeka Sanity.
- `const [posts, projects] = await Promise.all([...])` — oba zahteva krenu u istom trenutku. **Destrukturiranje niza** (`[posts, projects]`) uzima rezultate redom kojim su obećanja navedena.
- Strana **ne zna** odakle podaci dolaze — samo poziva funkcije (`getProjects()`, `getLatestPosts()`) i prosleđuje rezultat sekcijama. Kad su projekti prešli u Sanity, ova strana se promenila za jedan red.
- `projects` se učitava **jednom** i deli: `SelectedWork` dobija izdvojene, `ProjectIndex` sve, `Writing` ih koristi za nazive povezanih case studija.
- `<SiteMotion />` na kraju ne prikazuje ništa — to je „režiser animacija" (faza 6).

:::redosled
`SelectedWork`, `ProjectIndex` (faza 4), `Writing` (faza 8), `StartProject` (faza 8b), `SiteMotion` (faza 6) i repozitorijum `getProjects` (faza 8a) još ne postoje. Za sada uvezi `projects` direktno iz `@/content/projects` i izostavi sekcije koje nedostaju; vraćaš ih kako nastaju.
:::

:::wp
Uporedi sa `front-page.php` koji poziva `get_template_part('sections/hero')`, `get_template_part('sections/work', null, ['projects' => $featured])`... Isti princip: strana sklapa sekcije i prosleđuje podatke. Razlika je što su ovde „template parts" funkcije sa tipiziranim parametrima.
:::

:::testiraj
`npm run dev` → na početnoj strani vidiš Hero, Statement, Capabilities, About, Experience, Lab, Contact. U DevTools → Network filtriraj „JS": stranu prati samo Next-ov runtime, nema JS-a za same sekcije.
:::

:::commit
`feat(content): add CV content as typed data and static home sections`
:::
