# Faza 10b — Cloudflare: statički sajt i Worker za formu

**Cilj faze:** razumeti tri nova fajla koji sajt prebacuju na Cloudflare — `wrangler.jsonc`, `worker/index.ts` i `_headers` — i kako zajedno daju sajt koji je besplatan bez obzira na broj poseta, a forma i dalje šalje upite na tvoj email.

:::istorija Od servera do „izolata"
Klasičan hosting znači server (ili kontejner) koji stalno radi i čeka zahteve — plaćaš ga i kad niko ne dolazi. **Serverless** funkcije (AWS Lambda, 2014) pokreću kod samo na zahtev, ali svaka „hladna" funkcija se budi stotinama milisekundi. Cloudflare Workers (2017) idu korak dalje: kod se izvršava u **V8 izolatu** — istom mehanizmu kojim Chrome razdvaja kartice — na serveru najbližem posetiocu. Izolat se pokreće za par milisekundi, pa je pokretanje praktično besplatno. Kasnije je Cloudflare dodao i **statičke fajlove** uz Worker: fajlove koji se samo šalju posetiocu, bez pokretanja koda — i njih ne naplaćuje.
:::

## Kako zahtev putuje

```
posetilac ──► mkweb-dev.com/work/zignify/
                 │
                 ├─ postoji fajl u out/?  → da → pošalji ga        (Worker se NE budi — $0, bez limita)
                 │
posetilac ──► POST mkweb-dev.com/api/inquiry
                 │
                 └─ /api/* → Worker (worker/index.ts)
                        ├─ provera (lib/inquiry.ts — isti kod kao u browseru)
                        ├─ Resend API → email tebi, „Reply" ide klijentu
                        └─ JSON (fetch) ili 303 → /thanks/ (forma bez JS-a)
```

Ključ je u tome da se Worker budi **samo** za formu. Svaka poseta strani je čist statički fajl.

## wrangler.jsonc — podešavanje

@file web/wrangler.jsonc

`wrangler` je Cloudflare-ov alat komandne linije; ovaj fajl je njegova konfiguracija (JSON sa komentarima — zato `.jsonc`).

- **`name`** — ime Worker-a. Mora biti isto kao u Cloudflare panelu, inače Workers Builds odbija deploy.
- **`compatibility_date`** — „ponašaj se kao Workers runtime na ovaj dan". Cloudflare ne menja ponašanje postojećih Worker-a kad izbaci novu verziju runtime-a; datum pomeraš svesno, kad hoćeš nove mogućnosti.
- **`main`** — ulazni fajl Worker-a. Wrangler ga sam spakuje (esbuild) zajedno sa svim što uvozi — zato Worker može da uveze `src/lib/inquiry.ts` iz Next projekta.
- **`assets.directory: "./out"`** — folder statičkog exporta (`next build` sa `output: 'export'`).
- **`html_handling: "auto-trailing-slash"`** — `/work/zignify` preusmeri na `/work/zignify/` i servira `index.html` iz tog foldera. Usklađeno sa `trailingSlash: true` iz `next.config.ts`.
- **`not_found_handling: "404-page"`** — za nepostojeću adresu servira `out/404.html` sa statusom 404 (tvoja `not-found.tsx` strana).
- **`run_worker_first: ["/api/*"]`** — najvažniji red. Podrazumevano Cloudflare prvo traži statički fajl, pa tek ako ga nema budi Worker. Ovde kažemo: za `/api/*` uvek Worker (da `POST` stigne do koda), za sve ostalo — fajlovi.
- **`vars`** — obična podešavanja dostupna Worker-u kao `env.INQUIRY_TO`. Javna su (u repo-u), pa tu nikad ne ide ključ.
- **`observability`** — logovi Worker-a u panelu (Workers → mkweb-dev → Observability). Tu vidiš `console.error` iz Worker-a kad slanje ne uspe.

:::zamka Tajne nikad u wrangler.jsonc
`RESEND_API_KEY` se upisuje u panelu kao **Secret** (ili `npx wrangler secret put RESEND_API_KEY`). Promenljive iz `vars` se pri svakom deploy-u prepišu vrednostima iz fajla, a tajne ostaju netaknute — zato ih ne mešaš. Lokalno, tajne idu u `web/.dev.vars`, koji je u `.gitignore`.
:::

## worker/index.ts — prijem forme

@file web/worker/index.ts

**`export default { fetch }`** — oblik svakog Worker-a: objekat sa metodom `fetch(request, env)` koja vraća `Response`. Nema Express-a, nema servera koji sluša port — Cloudflare poziva ovu funkciju za svaki zahtev. `Request` i `Response` su **iste klase kao u browseru** (Web standard), pa znanje iz `fetch()` važi i ovde.

**`interface Env`** — opis svega što Worker dobija spolja: `ASSETS` (pristup statičkim fajlovima), tajnu i dve promenljive. TypeScript tako zna da `env.INQUIRY_TO` postoji.

**Ruter** — tri grane: `/api/inquiry` → obrada forme; ostali `/api/*` → JSON 404; sve drugo → `env.ASSETS.fetch(request)` (u produkciji se ne dešava zbog `run_worker_first`, ali `wrangler dev` i budući API-ji ostaju bezbedni).

**`handleInquiry(request, env, send = sendWithResend)`** — srce fajla, korak po korak:

1. **`wantsJson`** — zaglavlje `Accept: application/json` šalje samo naš `fetch()` u `StartProject`. Isti endpoint tako služi i JavaScript formu (JSON odgovor) i formu bez JS-a (preusmerenje).
2. **Samo `POST`** — sve ostalo dobija 405 sa zaglavljem `Allow`.
3. **Ograničenje veličine** — brief nikad nije veći od par KB; 32 KB je velikodušna granica protiv zloupotrebe.
4. **`request.formData()`** — čita i `application/x-www-form-urlencoded` (naš fetch i obična forma) i `multipart/form-data`.
5. **Honeypot** — popunjeno skriveno polje znači bot. Vraćamo **uspeh** i ne šaljemo ništa: bot ne sazna da je uhvaćen, pa ne pokušava drugačije.
6. **`parseInquiry` + `firstInvalidStep`** — iste funkcije koje koristi browser (faza 8b). Ako nešto fali: JSON 422 sa brojem koraka i greškama, ili kratka HTML poruka sa linkom nazad.
7. **Slanje** — `await send(...)` u `try/catch`. Ako Resend ne radi: 502 i poruka sa tvojom adresom, a greška ide u log. Nikad tiho „uspešno".
8. **Uspeh** — `{ ok: true }` ili **303 See Other** na `/thanks/`.

**Zašto je `send` parametar?** To je **ubrizgavanje zavisnosti** (dependency injection): u produkciji je podrazumevana vrednost `sendWithResend`, a test prosledi lažnu funkciju koja email samo zapamti. Test tako proverava tačan sadržaj email-a bez interneta i bez trošenja kvote.

**`buildEmail`** — običan tekst, ne HTML: ne može se „slomiti" ubacivanjem HTML-a kroz polje forme, i čita se lepo na telefonu. `reply_to` je adresa klijenta, pa „Reply" u Gmail-u odmah piše njemu. Naslov je skraćen na 180 znakova.

**`sendWithResend`** — jedan `fetch` na Resend REST API. Bez SDK-a: jedna zavisnost manje, a Worker ostaje mali.

:::stack Isti endpoint u drugim stackovima
**Express (MERN):** `app.post('/api/inquiry', express.urlencoded(), async (req, res) => { ... res.redirect(303, '/thanks/') })` — skoro identično, ali server mora stalno da radi. **Laravel:** ruta + Form Request + `Mail::to()->send()`; `return redirect('/thanks')` je takođe 303 kad dolazi posle POST-a. **Next.js sa serverom:** `app/api/inquiry/route.ts` sa `export async function POST(request)` — **isti** `Request`/`Response` API kao naš Worker; prelazak bi bio kopiranje funkcije. **WordPress:** `admin-post.php` akcija ili REST ruta + `wp_mail()`.
:::

:::ispod Post/Redirect/Get
Zašto 303, a ne prikazati „hvala" direktno iz POST-a? Kad bi odgovor na POST bila strana, osvežavanje (F5) bi browser pitalo „Pošalji formu ponovo?" — i dobio bi duplikat upita. 303 kaže browseru: „rezultat je na drugoj adresi, idi tamo sa GET". Osvežavanje `/thanks/` je onda bezopasno. Obrazac se zove **Post/Redirect/Get** i važi u svakom stacku.
:::

## _headers — keš i bezbednost

@file web/public/_headers

Next kopira sve iz `public/` u `out/`, a Cloudflare fajl `_headers` čita kao **podešavanje**, ne servira ga posetiocima. Format: putanja, pa ispod nje uvučena zaglavlja.

- **`/_next/static/*` → keš godinu dana, `immutable`.** Imena tih fajlova sadrže hash sadržaja; kad promeniš kod, nastaje novo ime. Stari fajl se zato nikad ne menja i sme se večno keširati.
- **`/*` → bezbednosna zaglavlja** za sve strane: browser ne pogađa tip fajla (`nosniff`), drugi sajtovi ne vide pune adrese tvojih strana (`Referrer-Policy`), a strana ne sme da traži kameru, mikrofon i lokaciju.

## .node-version

@file web/.node-version

Jedan red: verzija Node-a za build na Cloudflare-u. Isto što i `.nvmrc` u korenu, ali u folderu `web/`, jer Workers Builds radi iz njega (Root directory).

## Testovi Worker-a

@file web/tests/worker.test.ts

- **`post()`** pravi pravi `Request` objekat — Node 22 ima iste Web klase kao Worker, pa test ne treba nikakav emulator.
- **`fakeSend()`** — lažni Resend koji email samo doda u niz. Svaki test proveri i odgovor **i** šta bi bilo poslato.
- Pokriveno: ispravan brief (sadržaj email-a, `reply_to`, naslov), forma bez JS-a (303), nedostajući odgovori (422 sa brojem koraka, ništa nije poslato), honeypot (uspeh bez slanja), pad Resend-a (502), pogrešna metoda i prevelik zahtev, ruter.

:::testiraj
1. `npm test` — 48 testova, uključujući Worker.
2. `npm run cf:dev` — build + `wrangler dev`: ceo sajt i Worker na `http://localhost:8787`. Bez `.dev.vars` forma vraća 502 i nudi mailto — to je očekivano.
3. Sa ključem u `.dev.vars`: pošalji formu lokalno i proveri inbox.
4. Na produkciji: Workers → mkweb-dev → **Observability** pokazuje svaki poziv `/api/inquiry` i eventualne greške.
:::

:::senior Zašto ne odmah „pravi" backend
Worker od stotinak linija rešava jedan zadatak, ne košta ništa i nema server koji treba održavati. Kad ti zatreba više — čuvanje upita u bazi, panel sa listom upita, automatski odgovor — sledeći korak je isti Worker sa Cloudflare D1 bazom (SQLite na Cloudflare-u) ili prava MERN aplikacija iz tvoje Lab sekcije. Ne gradi infrastrukturu za problem koji još nemaš.
:::

Celo uputstvo sa svakim klikom (DNS, Workers Builds, Resend, Email Routing, Sanity webhook, provera, gašenje Netlify-ja) je u repo-u: `docs/CLOUDFLARE.md`.

:::commit
`feat(hosting): move to Cloudflare Workers with inquiry Worker and Resend`
:::
