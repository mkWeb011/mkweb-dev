# Faza 2 — React osnove kroz layout i prve komponente

**Cilj faze:** razumeš šta je komponenta, JSX, props i `children`; postavljaš dizajn tokene i root layout koji obavija svaku stranu.

## Dizajn tokeni — CSS promenljive

@file web/src/styles/tokens.css

Tokeni su **odluke o dizajnu sa imenom**: `--bg` umesto `#131313`, `--pad` umesto `clamp(20px,4vw,56px)`. Kada sutra hoćeš svetliju pozadinu, menjaš jedan red.

- `clamp(min, poželjno, max)` — fluidna veličina: raste sa širinom ekrana (`vw`), ali nikad ispod `min` ni iznad `max`. Zato naslov „Marko Kostić" lepo stoji i na 390 px i na 2560 px bez ijednog media query-ja.
- `--f-sans: var(--font-sans, ui-sans-serif), ...` — `--font-sans` će postaviti `next/font` (videćemo u layoutu). Drugi argument u `var()` je rezervna vrednost ako promenljiva ne postoji.
- `body::after` sa SVG šumom — „zrno" preko celog sajta (`opacity: .05`), daje taktilnost bez ijedne slike za preuzimanje.
- **Plava porodica** (`--blue`, `--blue-2`, `--blue-3`, `--cyan`, `--navy`, dva gradijenta) — dodata u drugom izdanju, kad je crno-belo počelo da deluje monotono. Pravilo upotrebe je zapisano u komentaru: `--blue` za površine (dugmad, izbor), `--blue-2` za tekst na tamnoj pozadini (ima bolji kontrast od `--blue`), gradijenti samo za naglaske. Boja je **začin**, ne podloga — zato je baza i dalje `#131313`.

:::senior Kako dodati boju a ne pokvariti dizajn
Nova boja ide kao **sloj**: tokeni na vrhu, a sva pravila koja je koriste u jednom bloku na dnu `globals.css` („BLUE ACCENT LAYER"). Ako se klijentu (ili tebi za šest meseci) ne svidi, obrišeš jedan blok i vraćaš se na monohromni dizajn. Kad boju razbacaš po celom fajlu, više ne možeš da je skloniš.
:::

:::zamka Jedan zalutali red ubije ceo blok — desilo se pri testiranju
Dok sam prebacivao CSS iz prototipa, u ovaj fajl se provukla duplirana linija `=== */` odmah posle komentara. CSS parser je video tekst `=== */ :root {` kao **neispravan selektor** i, po pravilima CSS-a, odbacio ceo `:root` blok — sve promenljive su nestale, a sajt je postao beo, bez razmaka i fontova. Nema greške u konzoli; CSS greške su tihe. Pouka: kad „sve izgleda pogrešno odjednom", proveri prvo da li se tokeni uopšte primenjuju (DevTools → Elements → `:root` → Computed).
:::

## globals.css — stilovi sekcija (izvodi)

`globals.css` ima oko 1.600 linija jer pokriva sve sekcije. Ne prikazujem ga ceo — obrazac je uvek isti. Pogledajmo pet reprezentativnih delova.

Zajednička glava sekcije — 12-kolonski grid koji se na mobilnom slaže u jednu kolonu:

@code web/src/app/globals.css | 193 | 233

Hero — ime preko cele širine i „scroll cue" sa animiranom linijom:

@code web/src/app/globals.css | 74 | 120

Stanja za animacije koja postavlja JavaScript:

@code web/src/app/globals.css | 1238 | 1260

Plavi sloj — ambijentalno svetlo iza sajta i gradijent na italic rečima naslova:

@code web/src/app/globals.css | 1376 | 1419

- `body::before` sa `position: fixed` i `z-index: -1` — tri meka radijalna gradijenta „iza" celog sajta. Ne prave nijedan HTTP zahtev i ne pomeraju se pri skrolu, pa ne koštaju ništa u performansama.
- `background-clip: text` + `color: transparent` — tekst postaje „prozor" kroz koji se vidi gradijent. `box-decoration-break: clone` je tu zbog SplitText-a (faza 6): kad animacija razbije reč na `<span>` elemente po slovu, svaki deo dobija svoj isečak gradijenta, inače bi prelom reda „presekao" boju.

Portret u About sekciji — okvir, odsjaj i raspored u gridu:

@code web/src/app/globals.css | 1529 | 1566

- `aspect-ratio: 4/5` rezerviše prostor pre nego što se slika učita — nema poskakivanja sadržaja (CLS).
- `::after` sa plavim gradijentom i `mix-blend-mode: screen` — slika „upija" svetlo palete, pa fotografija ne izgleda nalepljeno. Sama slika je već pripremljena u plavo-sivom tonu (split-tone), a CSS dodaje samo ivicu svetla.

:::zasto Globalni CSS ili CSS Modules?
Next.js podržava oba. Pravilo koje koristimo: **globalno** idu tokeni, reset i stilovi sekcija koje se pojavljuju jednom (lakše je pratiti dizajn kao celinu). **CSS Modules** (`Header.module.css`) idu za komponente sa stanjem i opštim imenima klasa (`.label`, `.nav`), gde bi globalno ime lako došlo u sukob. Videćeš oba pristupa u fazi 4.
:::

## Root layout — omotač svake strane

@file web/src/app/layout.tsx

Ovo je prva prava React komponenta. Idemo redom.

**Importi CSS-a (8–9).** U Next.js-u se globalni CSS uvozi u layoutu — tako je učitan na svakoj strani. Ovo je kao `wp_enqueue_style` u `functions.php`, samo deklarativno.

**next/font (17–25).** `Inter_Tight({...})` se izvršava **pri build-u**: Next preuzme font sa Google-a, sačuva ga uz sajt i generiše CSS. Posetilac nikad ne kontaktira Google (brže, i bolje za GDPR), a `variable: '--font-sans'` izlaže font kao CSS promenljivu koju čitaju naši tokeni. `latin-ext` podskup je obavezan zbog „ć" u tvom prezimenu.

**`export const metadata` (28–41).** Next.js od ovog objekta pravi `<title>`, `<meta name="description">`, Open Graph tagove i `canonical` link. `title.template: '%s — Marko Kostić'` znači da strana koja postavi `title: 'IDSA — case study'` dobija pun naslov „IDSA — case study — Marko Kostić". Ovo je Yoast, u kodu.

**JSON-LD (49–59).** Strukturisani podaci `Person` — govore Google-u i AI pretraživačima ko si, gde si i šta znaš. Ovo je deo AEO/GEO optimizacije koju već radiš klijentima.

**`motionGuard` (66).** Mali skript koji se izvršava pre prvog iscrtavanja i privremeno sakriva tekst hero sekcije dok se animacije ne učitaju. Detaljno u fazi 6.

**Sama komponenta (68–89).** Obrati pažnju na nekoliko stvari:

- Funkcija prima jedan objekat (props) i odmah ga **destrukturira**: `({ children })`. `children` je sve što Next.js ubaci unutra — sadržaj trenutne strane.
- Vraća **JSX** — izgleda kao HTML, ali je JavaScript. Zato `className` umesto `class` (jer je `class` rezervisana reč u JS-u), a vrednosti u `{ }` su JavaScript izrazi: `` className={`${sans.variable} ...`} ``.
- `dangerouslySetInnerHTML` — jedini način da ubaciš sirov HTML/JS. Ime je namerno zastrašujuće: React inače sve escape-uje (kao `esc_html()`), ovde ti isključuje zaštitu. Koristimo ga samo za sadržaj koji sami pišemo, nikad za unos korisnika.
- `<SmoothScroll>` obavija header, main i footer — to je **provider**: komponenta koja deli nešto (Lenis instancu) sa svima unutar sebe.

:::redosled
`Header`, `Footer` i `SmoothScroll` pravimo u fazama 3, 4 i 6. Da bi projekat radio odmah, privremeno ih zakomentariši i ostavi samo `<main id="main">{children}</main>`. Kad napraviš svaku od njih, vrati njen red.
:::

:::wp
`layout.tsx` je `header.php` + `footer.php` + `wp_head()` u jednom fajlu, s tim što `{children}` zamenjuje sve između `get_header()` i `get_footer()`. Ugnježdeni layouti (npr. `app/blog/layout.tsx`) bi bili kao zaseban `header-blog.php` za deo sajta.
:::

:::ispod Server Component bez ijednog bajta JS-a
`RootLayout` nema `'use client'`, pa je **Server Component**: izvršava se pri build-u, a u browser stiže samo njen HTML. Zato je u redu što u njoj pravimo veliki JSON-LD objekat — on ne ide u JavaScript bundle. Komponente `Header` i `SmoothScroll` su klijentske; Next.js ih automatski izdvaja u zaseban JS. Granica server/klijent je **po fajlu**, ne po strani.
:::

## Prve male komponente

### AvailablePill — props, children, uslovni prikaz

@file web/src/components/ui/AvailablePill.tsx

- Tip props-a je napisan direktno u potpisu: `{ children?: ReactNode; className?: string }`. `ReactNode` je „bilo šta što React ume da prikaže": tekst, broj, element, niz, `null`.
- `className = ''` — podrazumevana vrednost, kao u PHP-u.
- `if (!site.available) return null;` — komponenta koja vrati `null` ne prikazuje ništa. Ovo je React-ov `if ( ! $available ) return;`.
- `{children ?? 'Available — start a call'}` — ako pozivalac nije dao sadržaj, koristi podrazumevani tekst. Header daje dve verzije (dugu i kratku za mobilni), Case study strana ne daje ništa.
- `rel="noopener noreferrer"` uz `target="_blank"` — bezbednost: nova kartica ne može da kontroliše tvoju stranu kroz `window.opener`.

### SectionHead — interfejs za props i Fragment

@file web/src/components/ui/SectionHead.tsx

- `interface SectionHeadProps` — kad props-a ima više, izdvoji ih u imenovani tip. Komentari `/** ... */` iznad polja se prikazuju kao pomoć u VS Code-u kad koristiš komponentu.
- `{accent && (...)}` — **logičko I za uslovni prikaz**: ako je `accent` prazan, ništa se ne prikazuje.
- `<>...</>` je **Fragment** — grupiše elemente bez dodatnog `<div>` u HTML-u. Treba nam jer posle `{' '}` (razmak) dolazi `<span>`, a JSX izraz mora vratiti jedan koren.
- `data-reveal="head"` — sekcija ne zna ništa o animacijama; samo se „označi". `SiteMotion` (faza 6) nađe sve takve elemente i animira ih.

:::zamka 0 && <X/>
`{count && <span>{count}</span>}` — ako je `count` jednak `0`, React prikaže **nulu** na strani, jer je `0` validan sadržaj. Za brojeve piši `{count > 0 && ...}`. Sa stringovima (`accent`) je bezbedno: prazan string se ne prikazuje.
:::

### ToConfirm — najmanja korisna komponenta

@file web/src/components/ui/ToConfirm.tsx

Jedna linija, ali nosi politiku sajta: nepotvrđene informacije se ne izmišljaju, već se vidljivo označe. Kad potvrdiš podatak (npr. period rada na MC Adventure), upišeš ga u `projects.ts` i oznaka nestaje sama.

### ProjectVisual — inline stilovi i CSS promenljive

@file web/src/components/ui/ProjectVisual.tsx

- `style={{ '--h': project.hue }}` — u JSX-u je `style` **objekat**, ne string (otuda dvostruke vitičaste zagrade: spoljne za JS izraz, unutrašnje za objekat). Postavljamo CSS promenljivu `--h` koju `.pv` stilovi koriste za nijansu gradijenta, pa svaki projekat dobija svoju boju bez posebne CSS klase.
- `as CSSProperties` — TypeScript-ov tip za `style` ne zna za custom properties, pa ga „ubeđujemo" kastovanjem. Ovo je jedan od retkih opravdanih kastova.
- **Rani `return` za pravu sliku.** Ako projekat ima `cover` iz Sanity-ja, komponenta vraća `next/image` sa URL-om sa Sanity CDN-a (`urlFor(...).width(1600).height(1000).fit('crop')`) i završava. Tek ako slike nema, crta generisani vizual. Ovo je obrazac **„guard clause"**: obradi poseban slučaj na vrhu, pa glavni kod ostaje bez ugnježdavanja.
- `.map((s) => <span key={s}>...)` — prva lista u projektu. **`key`** je obavezan kad praviš listu elemenata: React po njemu prepoznaje koji element je koji između dva rendera. Ključ mora biti stabilan i jedinstven među braćom — ovde je to sam naziv tehnologije.

:::senior Placeholder koji je dizajniran
Kad nemaš pravi screenshot, ne stavljaj sivi pravougaonik „Image here". Napravi namernu vizuelnu obradu (ovde: browser traka sa domenom, monogram, orbita u boji projekta) i označi je kao zamenljivu. Sajt izgleda završeno danas, a sutra dodaješ pravu sliku u Studio — i komponenta je sama koristi, bez promene koda.
:::

:::testiraj
Privremeno u `app/page.tsx` vrati `<SectionHead index="01" title="Test" accent="heading" id="t" />`, pokreni `npm run dev` i proveri da se naslov prikazuje sa italic delom. Zatim obriši test kod.
:::

:::commit
`feat(ui): add design tokens, root layout with fonts/metadata and base UI components`
:::
