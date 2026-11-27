# Faza 1 — TypeScript temelj: tipovi, podešavanja, čiste funkcije

**Cilj faze:** pre ijedne komponente, opisujemo **oblik podataka** sajta i pišemo prve funkcije sa testovima. Ovo je deo koji najviše liči na PHP koji već znaš — zato krećemo odavde.

:::zasto Zašto tipovi pre komponenti?
Komponenta je funkcija koja prima podatke i vraća UI. Ako prvo precizno opišeš podatke (`Project`, `Job`, `Post`), komponente se skoro same napišu: editor ti predlaže polja, a greška u imenu polja se vidi pre pokretanja. U WordPress-u to radiš kad prvo nacrtaš ACF field group, pa tek onda pišeš šablon.
:::

## lib/types.ts — rečnik domena

@file web/src/lib/types.ts

Prođimo kroz nove TypeScript koncepte koje ovde vidiš:

**`as const` i izvedeni tip (vrh fajla).** `PROJECT_TAGS` je običan niz, ali `as const` kaže TypeScript-u: „ovo se nikad neće promeniti, zapamti tačne vrednosti". Onda `(typeof PROJECT_TAGS)[number]` znači „bilo koji element tog niza" — dobijamo tip `'WordPress' | 'WooCommerce' | ...`. Prednost: lista postoji jednom (za filter dugmad u UI-ju) i tip se izvodi iz nje. Dodaš novi tag u niz → tip se sam proširi.

**`interface`** — opis oblika objekta. `Project` je ugovor: svaki projekat mora imati sva ova polja, sa ovim tipovima.

**`string | null`** — „ovo polje je ili tekst ili ništa". Ovo je srce tvoje politike iskrenosti: kad klijent ili period nisu potvrđeni, vrednost je `null`, a UI prikazuje oznaku „To be confirmed". TypeScript te **tera** da obradiš `null` slučaj svuda gde koristiš polje.

**`?` (opciono polje)**, npr. `accent?: string` u `CapabilityGroup` — polje može da ne postoji.

**Unija literala**, `status: 'proven' | 'growing'` — samo dve dozvoljene vrednosti; `'Proven'` sa velikim P je greška.

**Opciono polje koje može biti i `null`**, `cover?: SanityImage | null` u `Project` — tri stanja: polje ne postoji (projekat iz lokalnog fajla), postoji ali je prazno (projekat iz Sanity-ja bez slike), ili ima sliku. Komponenta `ProjectVisual` obrađuje sva tri jednom proverom `if (project.cover)`.

**Index signature** u `PortableTextBlock`, `[key: string]: unknown` — „bilo koji drugi ključevi, nepoznatog tipa". `unknown` je bezbedniji od `any`: pre korišćenja moraš da proveriš tip.

:::wp
`interface Project` je isto što i ACF field group „Project" sa poljima tipa text, textarea, repeater (`approach: ApproachStep[]` je repeater sa dva podpolja). Razlika: ACF proverava pri unosu u adminu, TypeScript proverava pri pisanju koda.
:::

:::stack Tipovi u drugim stackovima
**Laravel:** model + `$casts` + Form Request pravila; od PHP 8.1 i `readonly` klase/DTO (npr. paket spatie/laravel-data). **MERN:** Mongoose šema opisuje oblik u bazi, a TypeScript interfejs (ili Zod šema iz koje izvodiš tip) opisuje oblik u kodu — dobra praksa je jedan izvor istine, npr. `z.infer<typeof ProjectSchema>`. **Gatsby:** tipovi se generišu iz GraphQL šeme (`gatsby-plugin-typegen`). Ideja je svuda ista: opiši podatke jednom, proveravaj ih automatski.
:::

:::zamka any
Kad TypeScript zakoči, primamljivo je napisati `any`. To isključuje proveru za tu vrednost **i sve što iz nje teče**. U ovom projektu nema nijednog `any`. Ako ne znaš tip, napiši `unknown` i suzi ga proverom (`typeof x === 'string'`).
:::

## content/site.ts — podešavanja sajta na jednom mestu

@file web/src/content/site.ts

- `process.env.NEXT_PUBLIC_SITE_URL ?? '...'` — operator `??` (nullish coalescing) uzima desnu vrednost samo ako je leva `null` ili `undefined`. Isti je kao PHP `??`.
- `meetUrl` — **zameni** ovu vrednost svojim stalnim Google Meet linkom (Google Calendar → napravi ponavljajući događaj „Office hours" → kopiraj Meet link). Sva dugmad „Available — start a call" čitaju odavde.
- `available: true` — jedan prekidač gasi sve „Available" oznake na sajtu.
- `inquiryEndpoint` — adresa na koju forma „Start a project" šalje upit. To je `/api/inquiry` — jedina adresa koju obrađuje Cloudflare Worker (faza 10b); sve ostalo su statički fajlovi.
- `nav` i `menu` — stavke navigacije kao podaci. Komponente ih samo prikazuju; da dodaš stavku, menjaš samo ovaj fajl. Stavka „Start a *project*" je dodata baš tako — jednim redom, bez diranja komponente `Menu`.
- `as const` na kraju — ceo objekat postaje nepromenljiv, a TypeScript zna tačne vrednosti (npr. da stavka menija ima ili nema `accent`).

:::senior
Kad vidiš da istu vrednost (email, link) kucaš na dva mesta — izvuci je u konfiguraciju odmah, ne „kasnije". Prototip je imao Meet link na tri mesta; ovde je na jednom.
:::

## lib/format.ts — prve čiste funkcije

@file web/src/lib/format.ts

**Čista funkcija** (pure function) za isti ulaz uvek vraća isti izlaz i ne menja ništa van sebe. One su najlakše za testiranje i čine kostur svakog održivog koda.

- `hostOf` — dva `replace` sa regularnim izrazima: skida protokol, `www.` i završnu kosu crtu.
- `formatDate` — `Intl.DateTimeFormat` je ugrađeni formatter datuma u JavaScript-u (kao PHP `IntlDateFormatter`). `timeZone: 'UTC'` sprečava da datum „pobegne" za dan zbog vremenske zone servera. `Number.isNaN(date.getTime())` hvata neispravan datum.
- `timeIn` — vreme u zadatoj zoni. Primeti parametar `now: Date = new Date()`: podrazumevano „sada", ali test može da prosledi fiksni datum. To je **ubrizgavanje zavisnosti** u najmanjem obliku — sat je zavisnost, i činimo ga zamenljivim.
- `cx` — spaja CSS klase i preskače `false`/`null`; koristi se za uslovne klase u komponentama.

## Prvi test

@file web/tests/format.test.ts

Koristimo ugrađeni Node test runner (`node:test`) — nema potrebe za Jest-om ili Vitest-om za ovakve testove. `assert.equal` poredi vrednosti, `assert.match` proverava regularni izraz.

Najzanimljiviji je test za `timeIn`: proverava i zimsko (CET, UTC+1) i letnje (CEST, UTC+2) računanje vremena za Beograd. Bez injektovanog `now`, ovaj test bi bio nemoguć — rezultat bi zavisio od trenutka pokretanja.

:::testiraj
```bash
npm test
# ✔ hostOf strips protocol, www and trailing slash
# ✔ formatDate formats ISO dates and tolerates bad input
# ✔ timeIn returns HH:MM in the requested time zone
# ...
```
:::

:::commit
`feat(core): add domain types, site config and formatting helpers with tests`
:::
