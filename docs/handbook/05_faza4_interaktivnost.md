# Faza 4 — Interaktivnost: state, efekti, hookovi

**Cilj faze:** naučiš četiri najvažnija hooka (`useState`, `useEffect`, `useRef`, `useMemo`) i dva napredna obrasca (podizanje stanja i animiranje pre uklanjanja iz DOM-a). Praviš filter projekata, header koji reaguje na skrol i meni preko celog ekrana.

## 'use client' — granica server/klijent

Sve do sada su bile Server Components. Čim komponenti treba **stanje** (nešto što se menja dok korisnik koristi stranu) ili **browser API** (`window`, `document`, event-i), na vrh fajla ide:

```tsx
'use client';
```

To ne znači „renderuj samo u browseru". Client Component se **i dalje** renderuje pri build-u u HTML (posetilac vidi sadržaj odmah), a zatim se njen JavaScript učita i hidratiše. `'use client'` označava granicu: ovaj fajl i sve što on importuje ide u browser bundle.

:::senior Spusti granicu što niže
Ne stavljaj `'use client'` na celu stranu zato što jedno dugme treba onClick. Izdvoji to dugme u malu klijentsku komponentu. Što je manje klijentskog koda, brži je sajt. Kod nas je `Hero` serverski, a samo `HeroCanvas` u njemu klijentski.
:::

## ProjectIndex — useState i izvedeno stanje

@file web/src/components/sections/ProjectIndex.tsx

**`useState`** (linija sa `const [tag, setTag] = useState<TagFilter>('All')`): vraća par — trenutnu vrednost i funkciju za promenu. Kad pozoveš `setTag('Webflow')`, React ponovo poziva celu funkciju `ProjectIndex` sa novim `tag`, i UI se ažurira. Ti ne menjaš DOM — opisuješ kako UI izgleda za dato stanje, a React sam izračuna razliku.

:::wp
U WordPress-u bi filter bio `?platform=webflow` u URL-u, pa server pravi novi `WP_Query` i šalje celu stranu ponovo. Ovde je filter samo promenljiva u memoriji, a React za 1 ms prerenderuje listu. Bez zahteva ka serveru.
:::

**Izvedeno stanje.** Primeti da u state-u čuvamo **samo izabrani tag**. Vidljivu listu (`visible`) ne čuvamo u state-u — ona se **izračunava** iz `projects` i `tag` pri svakom renderu. Da smo napravili `const [visible, setVisible] = useState(...)`, imali bismo dve istine koje mogu da se raziđu (npr. promeniš projekte, a lista ostane stara). Pravilo: **u state ide minimum; sve što se može izračunati — izračunaj.**

**`useMemo`** pamti rezultat dok se zavisnosti (`[projects, tag]`) ne promene. Sa 18 projekata ovo nije potrebno zbog brzine — služi kao dokumentacija: „ovo je izvedena vrednost". Kod velikih lista bi štedeo vreme.

**`onClick={() => setTag(t)}`** — event handler je funkcija. Pazi: `onClick={setTag(t)}` (bez strelice) bi **pozvao** `setTag` odmah pri renderu → beskonačna petlja.

**Pristupačnost:** `aria-pressed` kaže čitaču ekrana da je dugme prekidač i da li je uključen; `aria-live="polite"` paragraf izgovori „3 projects shown" posle promene filtera.

### CSS Modules

@file web/src/components/sections/ProjectIndex.module.css

`import styles from './ProjectIndex.module.css'` — svaka klasa u ovom fajlu postaje svojstvo objekta `styles`, a Next.js joj pri build-u doda jedinstveni sufiks: `.row` postaje npr. `ProjectIndex_row__a8Kq2`. Možeš slobodno da koristiš kratka imena (`.row`, `.name`) bez straha od sukoba sa `.row` iz `globals.css`.

- `className={styles.chip}` — jedna klasa.
- `` className={`${styles.platform} mono muted`} `` — modul klasa + globalne klase zajedno.
- `.chip[aria-pressed='true']` — stilizujemo po ARIA atributu umesto po posebnoj „active" klasi. Jedan izvor istine: ako je dugme označeno za čitač ekrana, označeno je i vizuelno.

:::testiraj
Na početnoj klikni „Webflow" — ostaju 3 projekta. Klikni „All" — 18. Uključi VoiceOver/NVDA i proveri da se broj izgovara.
:::

## Header — useEffect, useRef i podizanje stanja

@file web/src/components/layout/Header.tsx

**`useEffect(() => {...}, [])`** — kod koji se izvršava **posle** prikaza, samo u browseru. Prazan niz zavisnosti `[]` znači „samo jednom, posle prvog prikaza". Unutra kačimo `scroll` listener, a funkcija koju vraćamo je **cleanup** — React je poziva kad komponenta nestane. Bez cleanup-a listener bi ostao da živi zauvek (curenje memorije).

:::wp
`useEffect` je kao `jQuery(document).ready(...)` u fajlu dodatom kroz `wp_enqueue_script`, s tim što ima i „undo" deo (cleanup) i ponovo se pokreće kad se promene zavisnosti iz niza.
:::

**`useRef` za `lastY`.** Treba nam prethodna pozicija skrola da znamo smer. Da je u state-u, svaki skrol bi izazvao render samo da bi se upisao broj koji se ne prikazuje. `useRef` je „kutija" koja preživljava renderove, a njena promena **ne** pokreće render. Pravilo: ako se vrednost prikazuje → state; ako je samo pamtiš → ref.

**`ref={buttonRef}`** — drugi oblik `useRef`: referenca na DOM element. Prosleđujemo je meniju da bi, kad se zatvori, vratio fokus na dugme (pristupačnost tastaturom).

**Podizanje stanja.** `menuOpen` živi u `Header`-u, ne u `Menu`-u, jer ga koriste dva deteta: dugme (prikazuje „Menu"/„Close" i `aria-expanded`) i meni (otvara se). Kad dve komponente dele stanje, ono ide u **najbližeg zajedničkog roditelja**, a deca ga dobijaju kroz props (`open`) i menjaju kroz callback (`onClose`). Ovo je najvažnije pravilo arhitekture u React-u.

**`setMenuOpen((open) => !open)`** — kad nova vrednost zavisi od stare, prosledi funkciju. React garantuje da dobijaš najsvežiju vrednost, čak i ako se više promena desi u istom trenutku.

**`cx(...)`** iz `lib/format.ts` spaja klase uslovno: `hidden && !menuOpen && styles.hidden` daje klasu samo kad su oba uslova tačna.

@file web/src/components/layout/Header.module.css

Animacija ikonice: dve linije (`.lines i`) se pri `aria-expanded="true"` pomere u sredinu i rotiraju za ±45° — postaju „X". Natpis „Menu" klizi gore i nestaje, „Close" ulazi odozdo (`.label span`). Sve je CSS; React samo menja jedan atribut.

## Sopstveni hookovi

Hook je samo funkcija čije ime počinje sa `use` i koja koristi druge hookove. Izdvajamo logiku koju želimo da delimo ili da sakrijemo iza jasnog imena.

### useMediaQuery — useSyncExternalStore

@file web/src/hooks/useMediaQuery.ts

`matchMedia` je stanje koje živi **van** React-a (u browseru). `useSyncExternalStore` je zvanični most: daješ mu kako da se pretplati na promene, kako da pročita trenutnu vrednost, i šta da vrati na serveru (gde `window` ne postoji). Rezultat: `useReducedMotion()` vraća `true` čim korisnik u sistemu uključi „Reduce motion" — čak i dok je strana otvorena.

### useLocalTime — hidratacija bez greške

@file web/src/hooks/useLocalTime.ts

Ovo je hook iza „Belgrade, local time 01:42" u meniju. Najzanimljivija stvar je komentar o **hidrataciji**.

:::zamka Hydration mismatch — desilo se pri testiranju
React posle učitavanja proverava da HTML koji je napravio server odgovara onome što bi browser napravio. Ako ne odgovara — greška „Hydration failed because the server rendered text didn't match the client", i React baci serverski HTML i sve iscrta ponovo.

Klasični uzroci: `Date.now()`, `Math.random()`, vreme, ili `typeof window !== 'undefined'` grananje u renderu. Kad bismo vreme prikazali direktno, HTML bi sadržao vreme **build-a** (pre tri dana), a browser trenutno vreme → nepoklapanje. Rešenje: na serveru i pri prvom renderu prikaži neutralno `'—'`, a pravo vreme postavi u `useEffect` (koji se izvršava samo u browseru, posle hidratacije).

U mom test-okruženju sam dobio ovu grešku iz drugog razloga: HTML bez `<meta charset="utf-8">` pa je „ć" u tvom prezimenu pročitano kao „Ä‡" — server i klijent su videli različit tekst. Next.js sam ubacuje charset, pa to u pravom projektu ne vidiš, ali poruka greške je ista. Kad je vidiš, uporedi tačno koji tekst se razlikuje — React ti to ispiše.
:::

## Menu — animacija pre uklanjanja, fokus i navigacija

@file web/src/components/layout/Menu.tsx

Ovo je najsloženija komponenta u projektu. Rastavimo je.

**Dva stanja: želja i stvarnost (linije 26 i 36).** `open` (prop) je ono što roditelj želi. `rendered` (state) je da li je meni stvarno u DOM-u. Pri otvaranju se poklapaju odmah. Pri zatvaranju — `open` postane `false`, ali `rendered` ostaje `true` dok se izlazna animacija ne završi; tek onda `setRendered(false)` uklanja meni. Bez ovog razdvajanja, React bi uklonio meni u istom trenutku i animacija ne bi imala šta da animira.

`if (open && !rendered) setRendered(true);` direktno u telu komponente izgleda čudno, ali je dozvoljeno: React podržava postavljanje stanja **tokom rendera** za ovakvo „usklađivanje sa props-ima". React odmah ponovi render sa novom vrednošću, pre nego što bilo šta prikaže.

**Efekat za animaciju (39–90).** Zavisnosti `[open, rendered, lenis, returnFocusTo]` — efekat se pokreće pri svakoj promeni `open`. Ako je otvoren: zaustavi Lenis, zaključaj skrol, fokusiraj prvi link, pokreni GSAP timeline. Ako se zatvara: pokreni izlazni timeline sa `onComplete: finish`, a `finish` otključa skrol, ukloni meni i — ako je korisnik kliknuo link — tek tada navigira.

:::zamka Ako animacija nikad ne završi, meni se nikad ne zatvori
Pri testiranju sa lažnim (stub) GSAP-om, timeline nije pozivao `onComplete` i meni je ostao zauvek otvoren — preko dugmeta, pa se nije mogao ni ponovo kliknuti. U pravom GSAP-u se to ne dešava, ali obrazac ima tu slabost: logika zatvaranja zavisi od toga da li animacija stigne do kraja. Zato **reduced-motion** grana (linije 76–79) poziva `finish()` direktno, bez animacije. Kad god UI stanje zavisi od callback-a animacije, uvek imaj putanju koja ne zavisi od nje.
:::

**Cleanup vraća `tl.kill()`.** Ako korisnik brzo klikne Menu → Close → Menu, efekat se ponovo pokreće pre nego što se prethodna animacija završila. Cleanup ubije staru animaciju da se dve ne bi borile oko istih elemenata.

**`eslint-disable` komentar (88–89).** Pravilo `exhaustive-deps` bi tražilo da i `navigate` bude u zavisnostima. Ali `navigate` je nova funkcija pri svakom renderu, pa bi se animacija restartovala pri svakom renderu. Isključujemo pravilo **svesno, sa komentarom zašto** — nikad bez objašnjenja.

**Fokus zamka (92–118).** Dok je meni otvoren, Tab mora da kruži unutar njega (plus dugme Close). Na poslednjem elementu Tab vraća na prvi, a Shift+Tab na prvom ide na poslednji. Escape zatvara. Ovo je obavezno za `role="dialog"` i `aria-modal="true"`.

**`.filter((el): el is HTMLElement => el !== null)`** — **type guard**: TypeScript posle filtera zna da u nizu više nema `null`.

**Navigacija (120–130).** Klik na link: `preventDefault()` zaustavi browser, zapamti adresu u `pendingHref` (ref, jer ne treba render), zatvori meni. Kad animacija završi, `navigate` odluči: ako je link na istoj strani (`/#experience` dok si na `/`) — glatko skrolaj Lenis-om; inače — `router.push` (Next-ova klijentska navigacija, bez punog učitavanja).

**JSX (132–kraj).** `{item.label && 'accent' in item ? ' ' : ''}` — operator `in` proverava da li objekat ima svojstvo; TypeScript ga koristi da suzi tip stavke menija. `data-lenis-prevent` kaže Lenis-u da ne preuzima skrol unutar menija (na malim ekranima meni može da se skroluje).

@file web/src/components/layout/Menu.module.css

`.mask` + `.label` je klasičan trik za otkrivanje teksta: roditelj ima `overflow: hidden`, a GSAP pomera dete sa `yPercent: 110` na `0` — tekst „izranja" iz nevidljive ivice. Dodatni `padding-bottom: .14em` sprečava da maska odseče donji deo kurzivnog „g" u reči *Writing* — sitnica koju sam primetio tek na screenshot-u.

:::senior useCallback ili ne?
`Header` prosleđuje `onClose={() => setMenuOpen(false)}` — nova funkcija pri svakom renderu, pa se efekat za tastaturu u meniju ponovo kači. To je ovde potpuno bezopasno (header se retko renderuje). `useCallback` bi to sprečio, ali dodaje šum. U React 19 sa React Compiler-om (Next.js 16 ga podržava) ovakve stvari se memoizuju automatski. Optimizuj kad izmeriš problem, ne unapred.
:::

:::testiraj
1. Klikni Menu → meni se otvara, fokus je na „Home".
2. Pritisni Tab 12 puta → fokus ostaje u meniju.
3. Escape → meni se zatvara, fokus se vraća na dugme Menu.
4. Otvori meni, klikni „Experience" → meni se zatvara, strana skroluje do iskustva.
5. U sistemu uključi „Reduce motion" → meni se otvara i zatvara bez animacije.

Sve ovo je prošlo u automatizovanom Chrome testu na 1440 px i 390 px.
:::

:::commit
`feat(nav): add header with scroll state, accessible fullscreen menu and project filters`
:::
