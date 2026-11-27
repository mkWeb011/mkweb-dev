# Prelazak na Cloudflare — korak po korak

Ovaj vodič prebacuje mkweb-dev.com sa Netlify-ja na Cloudflare. Na kraju:

- sajt se servira kao statički fajlovi sa Cloudflare-a — **besplatno i bez limita poseta**;
- svaki `git push` na `main` i svaki Publish u Sanity-ju sam objavi novu verziju;
- forma „Start a project" šalje upit na tvoj email preko malog Cloudflare Worker-a i servisa Resend;
- `hello@mkweb-dev.com` prosleđuje poštu na tvoj Gmail.

Ukupno vreme: oko sat vremena, od čega je većina čekanje da DNS proradi.

```
GitHub (push)  ──►  Cloudflare Workers Builds:  npm run build  →  npx wrangler deploy
Sanity (Publish) ──► Deploy Hook ───────────────┘
                                   │
                       mkweb-dev.com ── statički fajlovi iz web/out  (besplatno, neograničeno)
                                   └── /api/inquiry → Worker → Resend → tvoj email
```

---

## Korak 0 — repo u pravoj strukturi

Koren GitHub repo-a `mkweb-dev` mora izgledati ovako (verzija 1.4.0 iz ZIP-a):

```
mkweb-dev/
├── .github/workflows/ci.yml
├── docs/
├── studio/
├── web/
│   ├── worker/index.ts
│   ├── wrangler.jsonc
│   └── package.json …
├── CHANGELOG.md
└── README.md
```

1. U lokalnom folderu repo-a obriši sve osim skrivenog foldera `.git`.
2. Kopiraj **sadržaj** foldera `mk-portfolio` iz ZIP-a u koren.
3. Ako si već imao `web/package-lock.json`, vrati ga (ili u `web/` pokreni `npm install` da se napravi novi). Workers Builds koristi lock fajl za tačne verzije paketa.
4. ```bash
   git add -A
   git commit -m "chore(release): v1.4.0 — move hosting to Cloudflare"
   git push
   ```

---

## Korak 1 — domen na Cloudflare (DNS)

Domen **ostaje registrovan na Namecheap-u** (tamo ga obnavljaš). Samo DNS — „telefonski imenik" domena — prelazi na Cloudflare.

1. Napravi nalog na cloudflare.com → **Add a domain** → `mkweb-dev.com` → plan **Free**.
2. Cloudflare prepiše postojeće DNS zapise i pokaže ti **dva nameservera** (npr. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`). Zapiši ih.
3. Namecheap → **Domain List → Manage** (mkweb-dev.com) → **Nameservers** → izaberi **Custom DNS** → upiši oba Cloudflare nameservera → sačuvaj (zelena kvačica).
4. Čekaj da Cloudflare javi da je domen **Active** (email ili status u panelu). Obično 15–60 minuta, ponekad nekoliko sati. Sajt za to vreme i dalje radi sa Netlify-ja, jer su prepisani zapisi i dalje usmereni tamo.

> **Pazi:** Od trenutka promene nameservera, sva DNS podešavanja (uključujući email) radiš **u Cloudflare-u**, ne na Namecheap-u. Namecheap-ovo „Redirect Email" prosleđivanje prestaje da radi — zamenjuje ga korak 6.

---

## Korak 2 — povezivanje GitHub repo-a

1. Cloudflare → **Workers & Pages → Create → Import a repository**.
2. **Connect GitHub** → odobri Cloudflare aplikaciji pristup **samo** repozitorijumu `mkweb-dev`.
3. Izaberi repo, pa podesi:

| Polje | Vrednost |
| --- | --- |
| Project / Worker name | `mkweb-dev` (mora biti isto kao `name` u `web/wrangler.jsonc`) |
| Production branch | `main` |
| Root directory (Advanced / Path) | `web` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

4. **Build variables** (promenljive za vreme build-a — Next ih ugrađuje u HTML):

| Ime | Vrednost |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://mkweb-dev.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | tvoj Sanity Project ID (sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NODE_VERSION` | `22` |

5. **Save and Deploy**. Prvi build traje 2–4 minuta. Kad uspe, sajt je na adresi tipa `mkweb-dev.<tvoj-nalog>.workers.dev` — otvori je i proveri početnu, jedan case study i `/blog/`.

Od sada: svaki `git push` na `main` = nova verzija sajta, sam od sebe.

---

## Korak 3 — tvoj domen na Worker-u

Kad je domen **Active** (korak 1):

1. Cloudflare → **mkweb-dev.com → DNS → Records**: obriši stare Netlify zapise — `A` za `mkweb-dev.com` (`75.2.60.5`) i `CNAME` za `www` (`…netlify.app`). Ostale zapise (MX, TXT) ne diraj.
2. **Workers & Pages → mkweb-dev → Settings → Domains & Routes → Add → Custom domain** → `mkweb-dev.com`. Ponovi za `www.mkweb-dev.com`.
3. Preusmeri `www` na glavni domen: **mkweb-dev.com → Rules → Redirect Rules → Create rule → šablon „Redirect from WWW to root"** → status 301 → Deploy.
4. Za par minuta `https://mkweb-dev.com` služi sajt sa Cloudflare-a, sa HTTPS-om.

---

## Korak 4 — slanje upita emailom (Resend)

Worker prima formu i šalje je kroz **Resend** — servis za slanje emailova. Besplatni plan: 3.000 emailova mesečno, najviše 100 dnevno — za upite sa portfolija dovoljno zauvek.

1. Napravi nalog na resend.com → **Domains → Add domain** → `mkweb-dev.com`.
2. Resend pokaže DNS zapise za potvrdu domena (SPF/DKIM). Ako ponudi automatsko podešavanje za Cloudflare, prihvati; inače ih dodaj ručno u **Cloudflare → DNS → Records** tačno kako piše. Klikni **Verify** — zeleno za nekoliko minuta.
3. **API Keys → Create API key** → dozvola *Sending access* → kopiraj ključ (vidiš ga samo jednom).
4. Cloudflare → **Workers & Pages → mkweb-dev → Settings → Variables and Secrets → Add** → tip **Secret**, ime `RESEND_API_KEY`, vrednost = ključ → Save / Deploy.

Adresa na koju stižu upiti (`INQUIRY_TO`) i pošiljalac (`INQUIRY_FROM`) su u `web/wrangler.jsonc`, u bloku `vars`. Menjaš ih tamo i radiš push.

> **Pazi:** `RESEND_API_KEY` je **tajna**: nikad u kod, u `wrangler.jsonc` ni u poruku. Ako procuri, u Resend-u ga obriši i napravi novi. Promenljive iz bloka `vars` se pri svakom deploy-u prepišu iz `wrangler.jsonc`, a tajne ostaju — zato ključ ide u Secrets, a obična podešavanja u fajl.

---

## Korak 5 — Sanity pokreće objavu

1. Cloudflare → **mkweb-dev → Settings → Builds → Deploy Hooks** → ime `sanity`, grana `main` → **Create** → kopiraj URL.
2. sanity.io/manage → tvoj projekat → **API → Webhooks → Create webhook**:
   - URL: kopirani Deploy Hook
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["post", "project"]`
   - HTTP method: `POST`
3. Objavi probnu izmenu u Studiju → Cloudflare → **Deployments**: novi build je krenuo. Za 2–3 minuta izmena je na sajtu.

---

## Korak 6 — email na domenu (besplatno)

1. Cloudflare → **mkweb-dev.com → Email → Email Routing → Get started**.
2. Napravi adresu `hello@mkweb-dev.com` → prosleđivanje na tvoj Gmail → potvrdi vezu u Gmail-u.
3. Cloudflare sam doda potrebne MX zapise. Oni ne smetaju sajtu ni Resend-u.
4. Opciono: Gmail → Settings → Accounts → **Send mail as** → `hello@mkweb-dev.com`, da i odgovaraš sa adrese domena.

---

## Korak 7 — provera pre nego što ugasiš Netlify

| Proveri | Kako |
| --- | --- |
| Sajt | `https://mkweb-dev.com` i `https://www.mkweb-dev.com` (preusmerava) |
| Case study | `/work/zignify/` i bez kose crte `/work/zignify` (preusmerava na verziju sa `/`) |
| 404 | `/ne-postoji/` → tvoja „not found" strana, status 404 |
| Forma | pošalji probni brief → email stiže, „Reply" ide na adresu iz forme |
| Forma bez JS-a | DevTools → isključi JavaScript → pošalji → završiš na `/thanks/` |
| Sanity | Publish u Studiju → novi deploy u Cloudflare-u |
| Bedž | nema „Powered by …" bedža |

Kad je sve zeleno: Netlify → projekat → **Project configuration → Danger zone → Delete project**.

---

## Lokalno testiranje Worker-a

`npm run dev` pokreće samo Next.js — bez Worker-a, pa forma lokalno vraća grešku i nudi mailto (i to je ispravno ponašanje). Ceo sajt sa Worker-om lokalno:

```bash
cd web
npm run cf:dev            # build + wrangler dev na http://localhost:8787
```

Za pravo slanje lokalno napravi fajl `web/.dev.vars` (već je u `.gitignore`) sa redom `RESEND_API_KEY=...`. Bez ključa Worker vraća 502, a forma pokazuje mailto rezervu.

---

## Kad nešto ne radi

| Simptom | Uzrok i rešenje |
| --- | --- |
| Build pada: „name … does not match" | Ime Worker-a u panelu ≠ `name` u `web/wrangler.jsonc` (`mkweb-dev`). |
| Build pada: ne nalazi `package.json` | Root directory nije `web`. |
| Sve strane su 404 | Build je prošao, ali `out/` je prazan — proveri da `next.config.ts` ima `output: 'export'` i log build-a. |
| Forma: „didn't send" | Worker → **Observability / Logs**: `RESEND_API_KEY is not set` → dodaj tajnu; `Resend 403` → domen u Resend-u nije verifikovan. |
| Domen ne radi posle 24 h | Na Namecheap-u proveri da su upisana **oba** Cloudflare nameservera i da je izabran „Custom DNS". |
| Custom domain se ne dodaje | U DNS-u je ostao stari `A`/`CNAME` zapis za isto ime — obriši ga (korak 3.1). |
