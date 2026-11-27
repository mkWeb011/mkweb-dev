# Faza 10 — Lansiranje: hosting, CI, Cloudflare, domen, webhook, forme

**Cilj faze:** sajt je na tvom domenu, svaki push na `main` ga automatski gradi i objavljuje, objava posta ili projekta u Sanity-ju pokreće novi build, a upiti iz forme stižu na tvoj email. Pre toga — gde i zašto hostujemo.

## Hosting za Next.js: opcije, razlike i kada se plaća

Ključna stvar: **koliko plaćaš zavisi od toga kako se tvoj app izvršava, a ne od toga što je Next.js.** Statički export (tvoj sajt) su obični fajlovi i skoro svuda su besplatni. Čim imaš SSR, API rute, ISR ili Server Actions, kod radi na serveru pri svakom zahtevu — i tada plaćaš procesorsko vreme, broj zahteva ili ceo server.

| Vrsta | Primeri | Kako radi | Besplatno | Plaća se kada |
| --- | --- | --- | --- | --- |
| Frontend platforma | Netlify, Vercel, Cloudflare | Git push → build → CDN; preview po grani; funkcije za server deo | statički sajt; Netlify i komercijalno; Vercel Hobby samo nekomercijalno | prekoračiš kredite/zahteve; Vercel za bilo kakvu komercijalnu upotrebu; više članova tima |
| PaaS | Render, Railway, Fly.io | tvoj app je pravi Node proces, uz bazu, cron i worker-e | Render ima instance koje „zaspu"; Railway mali mesečni kredit | čim treba da radi stalno (bez buđenja od pola minuta) |
| Sopstveni VPS | Hetzner, DigitalOcean + Coolify | iznajmiš server, Coolify ti daje „sopstveni Vercel" | — | uvek, ali fiksno i nezavisno od saobraćaja |
| Veliki cloud | AWS Amplify, Firebase App Hosting | sve skalira, naplata po potrošnji | mali nivoi | kompleksno predvideti; za portfolio preterano |

:::zasto Zašto Cloudflare za tvoj portfolio (i zašto ne Netlify)
Prvo izdanje je koristilo Netlify: besplatan i za komercijalnu upotrebu, sa ugrađenim formama. Onda smo izračunali šta znači tvoj plan — blog i SEO, dakle **što više poseta**. Netlify Free ima mesečni fond od 300 kredita iz kog se plaćaju i objave (15 po deploy-u) i saobraćaj; kad se fond potroši, sajt se pauzira do sledećeg meseca. Sa desetak objava mesečno to je okvirno 8–10 hiljada poseta. Uspeh bi ugasio sajt.

Cloudflare za **statičke fajlove** ne naplaćuje ni zahteve ni prenos podataka. Tvoj sajt je statički export, pa 100 i 100.000 poseta koštaju isto: $0. Ono što Netlify ima ugrađeno (forme, build hook) ovde rešavamo jednom, sami: mali Worker za formu i Deploy Hook za Sanity (faza 10b).

Pouka koja važi za svaki projekat: **hosting biraš prema tome kako sajt raste**, ne prema tome šta je najlakše prvog dana.
:::

:::senior Hosting kao usluga koju prodaješ
Kad počneš da radiš MERN aplikacije i klijentske Next.js sajtove sa serverom, VPS sa Coolify-jem je dobar i za tebe i kao ponuda: fiksna cena, više sajtova na jednom serveru, a održavanje (ažuriranja, bekapi, monitoring) naplaćuješ mesečno. Za to ti treba disciplina: automatski bekapi, ažuriranja sistema, firewall, alarmi. To je deo tvog „DevOps & hosting" pozicioniranja — sa dokazom koji možeš da pokažeš.
:::

## Budžet za tvoj sajt

| Stavka | Cena |
| --- | --- |
| Domen | jedini obavezan trošak |
| Hosting (Cloudflare Workers, statički fajlovi) | $0, bez limita poseta |
| Sanity (Free: 20 korisnika, 10.000 dokumenata) | $0 |
| Forma: Worker (100.000 zahteva dnevno besplatno) + Resend (3.000 email-ova mesečno, 100 dnevno) | $0 |
| Email na domenu (Cloudflare Email Routing → Gmail) | $0 |
| Analitika (GA4 ili Cloudflare Web Analytics) | $0 |
| Google Meet | $0 |

Za statički sajt ovaj budžet ne raste sa posetama. Plaćao bi tek ako dodaš serverski kod koji radi pri svakoj poseti, ili ako primaš više od 100 upita dnevno. Cene i limiti se menjaju — pre nego što bilo šta kupiš, proveri zvanične cenovnike.

## Korak 1: dokumentacija repozitorijuma

@file README.md

README je na engleskom jer je repozitorijum deo tvog portfolija — klijent ili agencija koja ga otvori treba da za 30 sekundi vidi stack, strukturu i kako se pokreće.

@file CHANGELOG.md

:::senior
CHANGELOG po formatu „Keep a Changelog" i verzije po SemVer-u. Za lični sajt deluje kao višak — ali ovo je navika koju klijenti primete u svakom projektu koji im predaješ. Ti već radiš „structured handover"; CHANGELOG je njegov deo.
:::

## Korak 2: GitHub i CI

```bash
cd mk-portfolio
git add .
git commit -m "chore: initial release v1.0.0"
gh repo create mk-portfolio --private --source=. --push    # ili preko github.com
```

@file .github/workflows/ci.yml

Na svaki push i pull request GitHub pokreće dva posla:

- **web** — na Node 22 i 24 (matrix; Node 20 je završio životni ciklus u aprilu 2026): `npm ci` (tačne verzije iz lock fajla), provera tipova, lint, testovi, build **bez Sanity tajni** (dokazuje da rezervna putanja radi), pa smoke test: postoje li ključni fajlovi u `out/` (uključujući `/thanks/`, `404.html` i `_headers`) i da li HTML sadrži tvoje ime.
- **studio** — provera tipova šeme.

:::zasto Build bez tajni u CI-ju
CI ne dobija Project ID namerno. Ako neko sutra slučajno napravi da build zavisi od Sanity-ja (npr. ukloni `safeFetch`), CI pada odmah — pre nego što se pokvari produkcija.
:::

## Koraci 3–7: Cloudflare, domen, Sanity, forma, provera

Fajlovi za Cloudflare (`wrangler.jsonc`, Worker, `_headers`) i šta svaki red znači su u fazi 10b. Ovde je redosled radnji; detaljno uputstvo sa svakim klikom je u repo-u, u `docs/CLOUDFLARE.md`.

1. **Domen na Cloudflare DNS.** Cloudflare → Add a domain → Free plan → dobiješ dva nameservera → upišeš ih na Namecheap-u (Nameservers → Custom DNS). Domen ostaje registrovan na Namecheap-u; samo „imenik" prelazi.
2. **Povezivanje GitHub-a.** Workers & Pages → Import a repository → `mkweb-dev`. Root directory `web`, build `npm run build`, deploy `npx wrangler deploy`, ime Worker-a `mkweb-dev`. Build variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NODE_VERSION`.
3. **Domen na Worker-u.** Obriši stare DNS zapise koji pokazuju na prethodni hosting, pa Settings → Domains & Routes → Custom domain za `mkweb-dev.com` i `www`; Redirect Rule `www` → glavni domen.
4. **Sanity → Deploy Hook.** Settings → Builds → Deploy Hooks → URL ide u Sanity webhook (filter `_type in ["post", "project"]`).
5. **Forma.** Resend nalog → verifikuj domen (DNS zapisi u Cloudflare-u) → API ključ → Worker → Variables and Secrets → tajna `RESEND_API_KEY`.
6. **Email na domenu.** Email Routing: `hello@mkweb-dev.com` → tvoj Gmail.

:::zamka NEXT_PUBLIC_ se ugrađuje pri build-u
Ako promeniš build promenljivu, sajt se **ne menja** dok ne pokreneš novi build (push ili Deploy Hook). Vrednosti `NEXT_PUBLIC_*` se upisuju u fajlove pri build-u, ne čitaju se pri posetama. Tajne Worker-a (`RESEND_API_KEY`) su druga priča — one se čitaju pri svakom zahtevu i važe odmah.
:::

:::zamka Email na istom domenu
MX zapisi za email su nezavisni od sajta. Kad nameserveri pređu na Cloudflare, prosleđivanje koje si podesio kod registrara prestaje da radi — zato Email Routing podešavaš odmah posle prelaska. SPF, DKIM i DMARC (Resend ih traži za slanje) podesi odmah — to radiš i klijentima.
:::

:::wp
Ovo zamenjuje trenutak kada u WordPress-u klikneš „Publish" i post je odmah na sajtu. Ovde između klika i objave stoji build od minut-dva — cena za sajt koji je brz, besplatan i nema bazu koja može da padne ili bude hakovana.
:::

## Završna provera pre lansiranja

| Provera | Kako |
| --- | --- |
| Meet link je pravi | klikni „Available — start a call" |
| Email i LinkedIn | meni → Elsewhere |
| Sve case studije se otvaraju | `/work/<slug>/` za svih 18, i bez završne kose crte |
| 404 radi | `/nesto-sto-ne-postoji/` → tvoja strana, status 404 |
| `www` preusmerava | `https://www.mkweb-dev.com` → `https://mkweb-dev.com` |
| Reduced motion | sistemsko podešavanje → sajt bez animacija, sav sadržaj vidljiv |
| Mobilni | pravi telefon, ne samo DevTools |
| Lighthouse | Performance, Accessibility, SEO ≥ 90 |
| Sitemap u Search Console | poslat, bez grešaka |
| „To be confirmed" oznake | potvrdi podatke ili ostavi svesno |
| Projekti iz Sanity-ja | izmeni `order` jednog projekta → Publish → redosled se promeni posle build-a |
| Forma | probni upit stiže na email, „Reply" ide klijentu; isprobaj i na telefonu |
| Forma bez JS-a | isključi JavaScript → slanje vodi na `/thanks/` |

:::commit
`ci: add GitHub Actions workflow` pa `chore(release): v1.0.0`
:::
