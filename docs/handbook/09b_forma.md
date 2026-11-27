# Faza 8b — Forma „Start a project"

**Cilj faze:** posetilac koji nije spreman za video poziv opisuje projekat u četiri kratka koraka — šta mu treba, obim, budžet i rok, kontakt — a upit stiže na tvoj email preko Cloudflare Worker-a (faza 10b). Forma radi i bez JavaScript-a, pristupačna je tastaturom i čitačem ekrana, i nikad ne gubi odgovore.

:::zasto Zašto brief, a ne obična kontakt forma?
Polje „Poruka" daje odgovore tipa „Treba mi sajt, koliko košta?". Kratak, strukturisan brief (po uzoru na agencijske sajtove) radi tri posla: klijentu pomaže da razmisli šta mu treba, tebi daje dovoljno informacija za konkretan odgovor, i **kvalifikuje** upit — raspon budžeta i rok ti odmah kažu da li je projekat za tebe. Četiri koraka umesto jedne duge strane smanjuju utisak napora: korisnik vidi „Step 1 / 4" i jedno pitanje, a ne dvanaest polja.
:::

@image /home/claude/handbook/form_desktop.png | 16

## Arhitektura: tri sloja, isti obrazac kao ostatak sajta

| Sloj | Fajl | Odgovornost |
| --- | --- | --- |
| Sadržaj | `content/inquiry.ts` | pitanja, opcije, rasponi budžeta — samo podaci |
| Logika | `lib/inquiry.ts` | tipovi, validacija, kodiranje za slanje — čiste funkcije |
| Prikaz | `StartProject.tsx` + `.module.css` | koraci, fokus, greške, slanje |
| Server | `worker/index.ts` (faza 10b), `app/thanks/` | prijem i slanje upita; strana posle slanja bez JS-a |

Ako sutra hoćeš peto pitanje, menjaš samo `content/inquiry.ts` — forma u browseru i Worker na serveru ga čitaju iz istog fajla.

## Pitanja kao podaci

@file web/src/content/inquiry.ts

- **Koraci i polja su niz objekata.** Komponenta ih samo prolazi `map`-om. Redosled koraka je redosled u nizu.
- **`kind`** određuje kontrolu: `single` → radio dugmad, `multi` → kvadratići, `text`/`email`/`url`/`textarea` → polja za unos.
- **`note`** je drugi red ispod opcije („Wix, Drupal, WordPress, Webflow…") — pomaže klijentu koji ne zna terminologiju da izabere pravo.
- **Rasponi budžeta** su tvoja poslovna odluka, ne tehnička. Komentar u kodu to kaže: oni oblikuju ko ti piše. Prenizak minimum privlači upite koji ti ne odgovaraju; previsok plaši male klijente.
- **`autoComplete`** (`name`, `email`, `organization`, `url`) — browser i menadžer lozinki popunjavaju polja sami. Na telefonu je to razlika između 30 sekundi i dva minuta kucanja.
- **`INQUIRY_FORM_NAME`** — ime forme; ide u telo zahteva i u prvi red email-a, da odmah znaš odakle je upit stigao.

## Logika bez React-a

@file web/src/lib/inquiry.ts

**`InquiryField` je diskriminisana unija.** Polje sa `kind: 'single' | 'multi'` mora imati `options`; polje sa `kind: 'text' | ...` ih nema, ali može imati `autoComplete`. Kad u kodu napišeš `if (field.kind === 'multi')`, TypeScript zna da `field.options` postoji. Isti obrazac kao `PostCard` iz faze 8.

**`InquiryValues = Record<string, string | string[]>`** — sve odgovore drži jedan objekat: kvadratići su nizovi, sve ostalo string. `emptyValues` pravi početno stanje iz konfiguracije, pa komponenta ne mora da zna koja polja postoje.

**Validacija vraća poruku ili `null`.** `validateField` je jedna funkcija sa ranim povratcima: prazno a obavezno → poruka; email bez `@` i domena → poruka; URL koji ne liči na adresu → poruka; poruka kraća od 20 znakova → „a few more words". Regularni izraz za URL namerno prihvata i „example.com" bez `https://` — ljudi tako pišu adrese.

**`firstInvalidStep`** — pri slanju proveravamo sve korake. Ako je neki raniji korak nevažeći (npr. korisnik se vratio i odštiklirao uslugu), forma se vraća baš na taj korak.

**`encodeInquiry`** pravi telo zahteva u formatu `application/x-www-form-urlencoded` (isti format koji šalje obična HTML forma). Kvadratići se spajaju u jednu čitljivu vrednost „Redesign, Migration"; Worker ih na serveru ponovo deli (`parseInquiry`).

**`summarizeInquiry`** — tekstualni rezime svih odgovora. Koristi se ako slanje ne uspe: korisnik dobija `mailto:` link sa već popunjenim email-om.

:::stack Validacija u drugim stackovima
**Laravel:** Form Request klasa sa `rules()` (`'email' => 'required|email'`, `'services' => 'required|array|min:1'`) — validacija je na serveru, a greške se vraćaju u Blade ili kao JSON. **MERN:** Zod šema koju dele React forma i Express ruta (`schema.safeParse(req.body)`), pa pravila postoje jednom. **WordPress:** Gravity Forms ili WPForms za višestepene forme bez koda; ručno — `sanitize_text_field`, `is_email` i nonce. Ovde su iste funkcije i na klijentu i na serveru: browser ih uvozi u `StartProject`, a Cloudflare Worker u `worker/index.ts` — moguće baš zato što su pisane bez React-a i bez DOM-a.
:::

## Testovi forme

@file web/tests/inquiry.test.ts

Poslednja četiri testa proveravaju **serversku** stranu: `parseInquiry` odbacuje nepoznata polja i opcije, prihvata oba oblika slanja (sa JS-om: „Redesign, Migration" u jednom polju; bez JS-a: jedno polje po kvadratiću), seče predugačak tekst, a „round trip" test dokazuje da ono što browser zakodira, server tačno pročita.

**`parseInquiry` ukratko:** za svako poznato polje uzme sve poslate vrednosti (`getAll`), za opcije zadrži samo one sa liste (`Set` dozvoljenih vrednosti), za tekst uzme prvu vrednost i skrati je na `MAX_LENGTH`. Prima `FormLike` — interfejs sa samo jednom metodom `getAll` — pa radi i sa `FormData` u Worker-u i sa `URLSearchParams` u testu, bez browsera.

## Gde upit odlazi

U prvoj verziji forma je slala upite u Netlify Forms. Od verzije 1.4 sajt je na Cloudflare-u (faza 10b), a upit prima **mali Cloudflare Worker** na adresi `/api/inquiry` i šalje ga na tvoj email. Za ovu fazu je važno samo ovo:

- komponenta šalje `POST` na `site.inquiryEndpoint` (`/api/inquiry`) sa zaglavljem `Accept: application/json` i dobija `{ ok: true }` ili grešku;
- bez JavaScript-a browser šalje istu formu na istu adresu, a Worker odgovara preusmerenjem na `/thanks/`;
- Worker proverava odgovore **istim funkcijama** iz `lib/inquiry.ts` koje koristi browser — pravila postoje na jednom mestu.

:::zasto Zašto validacija i na serveru, kad je već ima u browseru?
Validacija u browseru je **usluga korisniku** (brza poruka „pick one option"). Validacija na serveru je **zaštita**: bot ili radoznali korisnik može da pošalje `POST` bez tvoje forme, sa bilo kakvim poljima. Zato Worker prihvata samo poznata polja i samo dozvoljene opcije (`parseInquiry`), i ponovo proverava obavezna polja. Pravilo koje važi u svakom stacku: browseru se nikad ne veruje.
:::

## StartProject — komponenta

@file web/src/components/sections/StartProject.tsx

Ovo je najsloženija komponenta u projektu, pa idemo po temama, ne po linijama.

### Progresivno poboljšanje: `enhanced`

Server pravi HTML forme sa **svim koracima vidljivim**, sa `required` atributima, `method="POST"` i `action="/api/inquiry"`. Bez JavaScript-a (blokiran, spora mreža, greška) to je potpuno ispravna forma: browser je pošalje Worker-u, a on ga preusmeri na `/thanks/`.

Posle hidratacije, `useEffect(() => setEnhanced(true), [])` uključuje „aplikacijski" režim: prikazuje se jedan korak, `noValidate` isključuje browserove poruke (koristimo svoje), pojavljuju se stepper, traka napretka i dugmad Back/Next.

:::zasto Zašto `enhanced` počinje kao `false`
Prvi render u browseru mora biti **identičan** HTML-u sa servera, inače React prijavljuje grešku hidratacije. Server ne zna da li će JS raditi, pa renderuje verziju „bez JS-a". `useEffect` se izvršava tek **posle** hidratacije, pa promena na `true` je običan drugi render — bez neslaganja. Isti trik koristi svaka komponenta koja se razlikuje na serveru i klijentu.
:::

### Stanje

Šest `useState` vrednosti: da li je režim uključen, trenutni korak, odgovori, greške, status slanja i honeypot. Primeti da **odgovori ne zavise od koraka**: kad se vratiš nazad, sve što si izabrao je i dalje tu, jer svi koraci čitaju isti objekat `values`.

- **`update(name, value)`** pravi **nov** objekat (`{ ...v, [name]: value }`) umesto da menja postojeći — React poredi reference; izmena „u mestu" ne bi izazvala novi render.
- **Brisanje greške dok kucaš** — čim korisnik popravi polje, poruka nestaje. Kopiramo objekat grešaka i brišemo jedan ključ, opet bez menjanja originala.
- **`toggle`** dodaje ili uklanja opciju iz niza: `filter` za uklanjanje, `[...list, option]` za dodavanje.

### Fokus — pristupačnost koju niko ne vidi, a svi osete

- **Na promenu koraka** fokus ide na naslov novog koraka (`<legend tabIndex={-1}>`). Bez toga, korisnik tastature ostaje na dugmetu „Next" koje je možda nestalo, a čitač ekrana ne zna da se sadržaj promenio. `tabIndex={-1}` znači: element može da primi fokus iz koda, ali nije u redosledu Tab tastera.
- **`moved` ref** sprečava pomeranje fokusa pri prvom renderu — inače bi strana pri učitavanju „skočila" na formu.
- **Niz ref-ova** `stepHeadings.current[i] = el` — callback ref za svaki korak. Kada ti treba ref za element u listi, ovo je obrazac.
- **Kod greške** fokus ide na prvo neispravno polje. `requestAnimationFrame` čeka sledeći frejm, tj. da React iscrta poruke o grešci, pa tek onda fokusira.
- **`aria-live="polite"`** skriveni pasus javlja „Step 2 of 4: Shape" čitaču ekrana posle svakog prelaza.
- **Posle slanja** fokus ide na naslov „Thanks, Ana." (`role="status"`), da korisnik čitača čuje potvrdu.
- **`useId()`** pravi jedinstven prefiks za `id` atribute (`label htmlFor`, `aria-describedby`). Ručno pisani ID-jevi bi se sudarili kad bi komponenta postojala dvaput na strani.

### Slanje

`submit` ima tri grane: bez JS-a ne radi ništa (browser šalje sam); na koraku koji nije poslednji, Enter znači „Next"; na poslednjem — provera svih koraka, pa `fetch` na `site.inquiryEndpoint`. Uspeh prikazuje potvrdu sa rezimeom odgovora; neuspeh prikazuje poruku **„my fault, not yours"** i `mailto:` link sa već popunjenim tekstom. Korisnik nikad ne gubi ono što je napisao.

:::zamka Poslednji „Next" je slao formu — pronađeno testom
Prva verzija je imala jedno dugme koje je menjalo `type` — `button` na koracima 1–3, `submit` na poslednjem. Playwright test je pokazao čudno ponašanje: klik na „Next: You" je **odmah slao formu**, pre nego što je korisnik video poslednji korak. Uzrok: React ažurira stanje sinhrono na kraju klika; isti DOM element je postao `type="submit"` pre nego što je browser završio podrazumevanu akciju klika — i ta akcija je sada bila „pošalji formu". Rešenje su **različiti `key`-evi** (`key="next"` i `key="submit"`): React tada uklanja stari element i pravi novi, pa kliknuti element ostaje običan `button`. Pouka: kad element menja ulogu, a ne samo izgled, neka bude novi element.
:::

### Polja: komponenta `Field`

Pomoćna komponenta u istom fajlu prima jedno polje iz konfiguracije i vraća pravi HTML:

- **Grupe opcija** su `<fieldset>` sa `<legend>` i pravim `<input type="radio|checkbox">` elementima. Inputi su vizuelno sakriveni CSS-om, ali **ostaju u DOM-u i fokusabilni** — tastatura (strelice za radio, razmak za kvadratić) i čitači ekrana rade bez ijedne linije dodatnog koda. Sopstveni „div koji liči na checkbox" bi sve to izgubio.
- **Bez JS-a** (`native`): samo prvi radio u grupi dobija `required` — to je dovoljno da browser zahteva izbor u celoj grupi.
- **`aria-invalid` i `aria-describedby`** povezuju polje sa porukom o grešci i sa hintom; čitač ekrana pročita „Email, invalid entry, Enter a valid email address."
- **`RequiredMark`** — zvezdica za obavezna polja (sakrivena od čitača, jer `required` i poruke već nose tu informaciju) i reč „optional" za ostala. Prvi pokušaj je imao hint „Optional." ispod oznake polja — na telefonu je izgledao kao placeholder u praznom polju, pa je premešten u oznaku.
- **URL polje je `type="text"` sa `inputMode="url"`** — tastatura na telefonu prikazuje „.com" i „/", ali browser ne odbija „example.com" bez `https://` kao što bi `type="url"` uradio.

## Stilovi forme (izvodi)

`StartProject.module.css` ima oko 470 linija; evo delova sa novim tehnikama.

Stepper u levoj koloni — stanje dolazi iz `data-state` atributa, ne iz posebnih klasa:

@code web/src/components/sections/StartProject.module.css | 33 | 72

Korak, animacija ulaska i naslov koraka:

@code web/src/components/sections/StartProject.module.css | 109 | 158

- **`.step[hidden] { display: none }`** — atribut `hidden` je slab: bilo koji `display: grid` u CSS-u ga pregazi. Zato ga eksplicitno pojačavamo.
- **Animacija samo sa `from`** — `@keyframes stepIn { from {...} }` animira od zadatog stanja do onog koje element već ima. Kraće i ne može da se „razmimoiđe" sa stvarnim stilom.
- **`:global(.serif)`** — u CSS Module-u su sve klase lokalne (dobiju jedinstveno ime). `.serif` je globalna klasa iz `globals.css`, pa je moramo označiti sa `:global()` da bi je selektor pogodio.

:::zamka Legend nije deo grida — pronađeno na screenshot-u
`.step` je `display: grid` sa `gap`, ali razmak između naslova koraka i prvog pitanja je bio skoro nula. Razlog: `<legend>` je poseban element koji browser crta „u ivici" fieldset-a, i **ne učestvuje** u grid rasporedu. Rešenje je `padding-bottom` na samom `legend`-u. Ovakve stvari ne hvata nijedan test koda — samo pogled na rezultat. Zato posle svake vizuelne izmene pravim screenshot na 1440 i 390 piksela.
:::

Redovi opcija — izbor bez JavaScript klasa, pomoću `:has()`:

@code web/src/components/sections/StartProject.module.css | 185 | 266

- **`.option:has(input:focus-visible)`** — `:has()` je „roditeljski selektor": stilizuj `label` **ako sadrži** input koji ima fokus sa tastature. Pre 2023. ovo je zahtevalo JavaScript.
- **`data-checked`** postavlja React; mogli smo i `:has(input:checked)` (tako radi verzija u prototipu, bez React-a). Oba rade — atribut je tu jer ga React već zna, a selektor je kraći.
- **Kvačica** je `::after` pseudo-element: pravougaonik sa dve ivice, rotiran 45° — `scale(0)` → `scale(1)` je cela animacija.

Telefon — stepper postaje horizontalna traka, a „Prefer to talk?" ide ispod forme:

@code web/src/components/sections/StartProject.module.css | 404 | 470

:::senior Mobilni raspored nije „smanjen desktop"
Na desktopu leva kolona je lepljiva (`position: sticky`) i nosi stepper i dugme za poziv. Na telefonu bi ista kolona stajala **između** steppera i pitanja i gurala formu za ceo ekran naniže. Zato komponenta renderuje `PreferToTalk` dvaput (u koloni i posle forme), a CSS prikazuje pravu verziju za ekran. Dupli HTML od pet linija je jeftiniji od lošeg toka na uređaju sa kog dolazi većina posetilaca.
:::

Ovako prvi korak izgleda na telefonu od 390 piksela — stepper je traka iznad pitanja, a opcije su jedna kolona velikih redova za palac:

@image /home/claude/handbook/form_mobile.png | 6

## Strana posle slanja bez JavaScript-a

@file web/src/app/thanks/page.tsx

Koristi je samo „klasičan" tok: forma bez JS-a šalje na `/api/inquiry`, a Worker posle slanja email-a odgovara statusom **303 See Other** i adresom `/thanks/` — browser tada učita ovu stranu običnim GET-om (obrazac „Post/Redirect/Get": osvežavanje strane ne šalje formu ponovo). `robots: { index: false }` — strana nema vrednost u pretrazi.

:::stack Forme u drugim stackovima
**Laravel:** ruta `POST /inquiries` → Form Request → `Inquiry::create()` → `Mail::to(...)->queue(new InquiryReceived($inquiry))`; višestepeni UI najčešće u Livewire-u. **MERN:** Express ruta `POST /api/inquiries` sa Zod validacijom, upis u MongoDB, email preko Resend-a ili Nodemailer-a, rate limit middleware protiv spama. **Next.js sa serverom:** Server Action (`'use server'` funkcija) koja validira i šalje email — bez posebne API rute. **Webflow:** ugrađene forme, višestepene uz malo custom koda. Naš Worker je najbliži MERN varijanti — jedna ruta, validacija, email — samo bez servera koji stalno radi.
:::

:::testiraj
1. `npm test` — testovi validacije, kodiranja i serverskog parsiranja prolaze.
2. Lokalno, `next dev` nema Worker (slanje vraća grešku → vidiš `mailto:` rezervu, što je i to korisno testirati). Ceo tok probaš sa `npm run cf:dev` (faza 10b).
3. Na produkciji: pošalji probni upit i proveri da email stiže i da „Reply" ide na adresu iz forme.
4. Isključi JavaScript u DevTools (Settings → Debugger → Disable JavaScript): svi koraci su vidljivi, browser traži obavezna polja, slanje vodi na `/thanks/`.
5. Prođi celu formu samo tastaturom: Tab, strelice, razmak, Enter.
:::

U automatskom testu sam prošao formu u Chrome-u na 1440 i 390 piksela: greška na praznom koraku i fokus na prvu opciju, nestajanje greške posle izbora, fokus na naslov novog koraka i najava „Step 2 of 4", odbijen neispravan URL i email, odgovori sačuvani posle Back, tačna polja u poslatom zahtevu, potvrda sa fokusom — i scenario sa greškom servera, gde se pojavljuje `mailto:` link sa popunjenim tekstom.

:::commit
`feat(inquiry): add accessible multi-step project brief`
:::
