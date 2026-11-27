# Završno — plan commit-ova, šta su testovi pronašli, sledeći koraci

## Plan commit-ova

Ako kucaš projekat iz priručnika, ovo je istorija koju tvoj Git treba da ima. Mali, logični commit-ovi su ono što reviewer-i i klijenti cene.

| # | Faza | Poruka |
| --- | --- | --- |
| 1 | 0 | `chore: scaffold Next.js 16 app with TypeScript, ESLint, Prettier and static export` |
| 2 | 1 | `feat(core): add domain types, site config and formatting helpers with tests` |
| 3 | 2 | `feat(ui): add design tokens, root layout with fonts/metadata and base UI components` |
| 4 | 3 | `feat(content): add CV content as typed data and static home sections` |
| 5 | 4 | `feat(nav): add header with scroll state, accessible fullscreen menu and project filters` |
| 6 | 5 | `feat(work): add statically generated case study pages with per-page metadata` |
| 7 | 6 | `feat(motion): add GSAP/Lenis motion system, magnetic CTA and Three.js hero field` |
| 8 | 7 | `feat(studio): add Sanity Studio v5 with post, category and portable text schemas` |
| 9 | 8 | `feat(blog): fetch posts from Sanity at build time with portable text and fallback` |
| 10 | 9 | `feat(seo): add sitemap, robots and structured data` |
| 11 | 10 | `ci: add GitHub Actions workflow` |
| 12 | 10 | `chore(release): v1.0.0` |
| 13 | 2 | `feat(design): add blue accent layer, About portrait and tinted hero sphere` (v1.1.0) |
| 14 | 3 | `feat(content): reposition around headless CMS, Next.js and DevOps` (v1.2.0) |
| 15 | 8a | `feat(projects): move case studies to Sanity with normalised repository and seed import` |
| 16 | 8b | `feat(inquiry): add accessible multi-step project brief` |
| 18 | 10b | `feat(hosting): move to Cloudflare Workers with inquiry Worker and Resend` (v1.4.0) |
| 17 | 10 | `chore(release): v1.3.0` |

## Šta su testovi pronašli

Mreža je u mom okruženju bila blokirana, pa nisam mogao da instaliram Next.js i pokrenem pravi `next build`. Umesto toga sam napravio test-okruženje: lažne (stub) verzije paketa, minimalne React tipove za TypeScript proveru i pravo renderovanje svih strana sa `react-dom/server`, plus hidrataciju u pravom Chrome-u. Ovo je pronašlo stvarne greške — svaka je postala lekcija u priručniku:

| Šta | Simptom | Lekcija |
| --- | --- | --- |
| Zalutala linija komentara u `tokens.css` | ceo sajt beo, bez razmaka | Faza 2: CSS odbacuje ceo blok sa neispravnim selektorom |
| `import('three')` bez `.catch` | Unhandled rejection kad paket ne stigne | Faza 6: dinamički import je mrežni zahtev |
| Netipizovan `preview.prepare` | implicitni `any`, provera tipova pada | Faza 7: eksplicitni tipovi parametara |
| Meni zavisi od `onComplete` animacije | meni ostaje otvoren ako animacija ne završi | Faza 4: putanja koja ne zavisi od animacije |
| Hidratacija sa pogrešnim kodiranjem | „KostiÄ‡" vs „Kostić" | Faza 4: kako čitati hydration mismatch |
| Naslov „Design→Code" | izlazi iz kartice na desktopu | sadržaj: kraći naslov („Frontend") |
| `.statement p` (prototip) | potpis dobio 72 px | Faza 3: krhki selektori |
| Prazan `generateStaticParams` | build pada pre prvog posta | Faza 8: placeholder strana sa `noindex` |
| Dugme koje menja `type` | poslednji „Next" šalje formu | Faza 8b: različit `key` = novi element |
| `<legend>` u grid fieldset-u | nema razmaka ispod naslova koraka | Faza 8b: legend nije grid stavka |
| Hint „Optional." ispod oznake | na telefonu liči na placeholder | Faza 8b: „optional" u samoj oznaci |
| Prvi pokušaj portreta | previše zasićeno plavo, „Instagram filter" | Faza 2: boja kao sloj, ne kao preliv |

Šta **nije** testirano ovde i moraš proveriti sam posle `npm install`:

- pravi `next build` i `next dev` (sa pravim Next.js 16, ne stubom),
- prave animacije GSAP-a, Lenis-a i Three.js-a (u testovima su bile zamenjene),
- `eslint .` sa pravim pravilima,
- Sanity Studio u browseru, stvarni GROQ upiti nad tvojim podacima i uvoz projekata (`sanity dataset import`),
- `wrangler deploy` i pravo slanje email-a kroz Resend (Worker je testiran unit testovima sa lažnim slanjem, a forma u browseru sa simuliranim odgovorom servera, uključujući grešku 502).

:::testiraj Prvi pravi build
```bash
cd web && npm install && npm run typecheck && npm run lint && npm test && npm run build
npx serve out     # otvori http://localhost:3000
```
Ako nešto pukne, poruka greške je skoro uvek precizna. Najverovatnija mesta: verzije paketa koje su se u međuvremenu promenile (pročitaj changelog) i ESLint pravila koja su strožija od mojih pretpostavki.
:::

## Trikovi i zaobilaznice koje ćeš koristiti svaki dan

| Situacija | Trik |
| --- | --- |
| „Hydration failed" u konzoli | Pročitaj diff koji React ispiše (server vs klijent). Najčešći uzroci: `new Date()`/`Math.random()` u renderu, `toLocaleString` sa različitom zonom, neispravno ugnježden HTML (`<p>` u `<p>`, `<div>` u `<a>` unutar `<a>`), ekstenzije browsera koje menjaju DOM. Vrednost koja se razlikuje premesti u `useEffect` — kao `enhanced` u formi. |
| Ne znaš da li je komponenta serverska | Nema `'use client'` na vrhu fajla (ni u fajlu koji je uvozi kao klijentsku) → serverska je. `console.log` iz serverske komponente se vidi u terminalu, ne u browseru. |
| Klijentska komponenta „vuče" ogroman paket | Proveri šta uvozi. Pomoćne funkcije drži u čistim fajlovima bez Sanity klijenta i sadržaja (kao `lib/projects.ts`); podatke prosleđuj kroz props. |
| Izmena `.env.local` ne radi | Restartuj `npm run dev`. `NEXT_PUBLIC_*` se ugrađuje pri pokretanju/build-u. |
| Next se ponaša čudno posle nadogradnje | Obriši keš: `rm -rf web/.next`, pa ponovo `npm run dev`. Ako sumnjaš na Turbopack, Next 16 ima opciju `--webpack` za poređenje. |
| ScrollTrigger okida na pogrešnom mestu | Privremeno `markers: true` u `scrollTrigger` opcijama; posle učitavanja slika/fontova `ScrollTrigger.refresh()`. |
| Unutrašnji skrol (meni, modal) ne radi uz Lenis | Atribut `data-lenis-prevent` na elementu koji se skroluje. |
| GROQ upit vraća `[]` | Testiraj ga u Vision tabu Studija. Proveri da li je dokument objavljen (draft ima `_id` koji počinje sa `drafts.`) i da li filter traži polje koje je prazno (`defined(publishedAt)`). |
| Hoćeš da vidiš sajt kao čitač ekrana / sa „reduce motion" | DevTools → Rendering → „Emulate CSS prefers-reduced-motion"; za čitač: VoiceOver (Cmd+F5 na Mac-u) ili NVDA (Windows), pa prođi stranu samo tastaturom. |
| Deploy je pokvario sajt | Cloudflare → Worker → Deployments → izaberi prethodnu ispravnu verziju → Rollback. Povratak traje sekundu, a ti mirno tražiš grešku. |
| Hoćeš da probaš izmenu bez rizika | Nova grana + pull request → Workers Builds pravi preview verziju sa sopstvenim URL-om; CI proverava tipove i testove. Spajaš tek kad je oboje zeleno. |
| Tip je komplikovan, ne znaš šta funkcija vraća | U VS Code-u zadrži miša iznad imena; Ctrl/Cmd + klik vodi na definiciju; F2 preimenuje svuda bezbedno. |
| Konfiguracioni objekat, a hoćeš i proveru i tačne vrednosti | `satisfies`: `const cfg = { ... } satisfies Config` — TypeScript proveri oblik, a zadrži precizne tipove literal-a (bolje od `: Config`, koji ih „razvodnjava"). |

## React/Next.js ↔ WordPress — konačna tabela

| Treba ti… | WordPress | Ovaj projekat |
| --- | --- | --- |
| Globalni omotač strane | `header.php`/`footer.php` | `app/layout.tsx` |
| Šablon za tip sadržaja | `single-project.php` | `app/work/[slug]/page.tsx` |
| Delovi šablona | `get_template_part()` | komponente u `components/` |
| Parametri za deo šablona | `$args` | props |
| Petlja | The Loop | `.map()` sa `key` |
| Upit | `WP_Query` | `lib/projects.ts`, `sanity/api.ts` + GROQ |
| Prilagođena polja | ACF | TypeScript `interface` + Sanity šema |
| Admin | wp-admin | Sanity Studio |
| Bogat tekst | `post_content` (HTML) | Portable Text (JSON) + `PostBody` |
| JS za interakciju | `wp_enqueue_script` + jQuery | `'use client'` + hookovi |
| Podešavanja | Settings → General | `content/site.ts` |
| SEO plugin | Yoast | `metadata`, `generateMetadata`, `sitemap.ts` |
| Keš strana | WP Super Cache | statički export (sve je unapred napravljeno) |
| Deploy | FTP/DeployBot | git push → Cloudflare Workers Builds |
| Hook na objavu | `save_post` akcija | Sanity webhook → Cloudflare Deploy Hook |
| Custom post type | `register_post_type('project')` | `studio/schemaTypes/project.ts` |
| Repozitorijum / upit za CPT | `WP_Query` u klasi | `lib/project-repository.ts` |
| Kontakt forma | Contact Form 7 / Gravity Forms | `StartProject.tsx` + Worker + Resend |
| Uvoz sadržaja | WP All Import | `scripts/export-projects.ts` + `sanity dataset import` |

## Sledeći koraci — redom kako bih ih ja radio

1. **Pravi screenshot-ovi projekata.** Polje `cover` već postoji: otvori projekat u Studiju, dodaj sliku 16:10 sa alt tekstom, Publish. Ovo najviše podiže utisak sajta.
2. **Potvrdi „To be confirmed" podatke.** Svaka potvrđena činjenica (period, angažman, ishod) je argument više za klijenta.
3. **Prvi MERN projekat u Lab sekciji.** Mali, stvaran alat (npr. interni dashboard za upite iz forme: Express API + MongoDB + React), deploy na Render/Railway ili VPS sa Coolify-jem. Kad bude gotov, prebaci stavku „Full-stack JS" iz grupe „Next" u „proven" — sa dokazom.
4. **Webflow + Next.js studija slučaja.** Makar demo: Webflow CMS kao izvor, Next.js frontend, objavljen na Webflow Cloud-u. Ta niša je retka, a agencije je traže.
5. **Programmatic SEO, oprezno.** Počni sa 20–50 strana „usluga × industrija" koje imaju pravi sadržaj (faza 9), prati Search Console, pa skaliraj.
6. **Live preview.** Kad poželiš da vidiš post pre objave, skini `output: 'export'`, pređi na hosting sa Node podrškom i dodaj `next-sanity` sa `defineLive` i Draft Mode-om. Tada imaš i ISR — nema više čekanja na build.
7. **Testovi komponenti.** Kad poželiš dublje: Vitest + React Testing Library za `ProjectIndex` i `Menu`, i Playwright za ceo tok (otvori meni → klikni → proveri URL).
8. **BalkanSignal.** Kad bude spreman za javnost, dobija pravu case studiju u Lab sekciji.

## Kako o ovom projektu da pričaš na razgovoru

> „Moj portfolio je Next.js 16 aplikacija sa statičkim exportom, hostovana besplatno na Cloudflare-u kao statički fajlovi, uz mali Worker za formu. Case studije i blog dolaze iz Sanity-ja pri build-u, kroz repozitorijum koji normalizuje podatke iz CMS-a i ima lokalnu rezervu, a webhook pokreće rebuild kad nešto objavim. Upiti stižu kroz višestepenu formu koja radi i bez JavaScript-a, sa fokus menadžmentom za tastaturu i čitače ekrana. Sekcije su Server Components, pa stranu prati minimalan JavaScript; interaktivni delovi — meni sa fokus zamkom, filteri, animacije — su izolovani klijentski delovi. Za animacije koristim GSAP sa ScrollTrigger-om i Lenis na zajedničkom sat-u, i Three.js sferu koja se učitava dinamički i čisti se pri demontiranju. Sve poštuje `prefers-reduced-motion`. CI proverava tipove, lint i testove, i gradi sajt bez tajni da dokaže da rezervni put radi. Imam i testove sadržaja koji sprečavaju objavu izmišljenih metrika."

To je priča seniora: ne „znam React", već **odluke, kompromisi i dokazi**.

Srećno sa lansiranjem, Marko.
