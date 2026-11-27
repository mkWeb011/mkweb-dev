# Status projekta — gde smo stali

Poslednje ažuriranje: 27. 11. 2026. Ovaj fajl je „predaja smene": šta je urađeno, šta je otvoreno i koje odluke važe.
Claude Code ga čita na početku rada (vidi `CLAUDE.md`). Ažuriraj ga kad završiš veći korak.

## Infrastruktura — urađeno

- **Repo:** github.com/mkWeb011/mkweb-dev — monorepo v1.4.1 (`web/`, `studio/`, `docs/`, `.github/`, `.claude/`).
- **Hosting:** Cloudflare Workers, Worker `mkweb-dev`, Workers Builds iz GitHub-a.
  - Root directory `web` · Build `npm run build` · Deploy `npx wrangler deploy`.
  - Custom domain `mkweb-dev.com` (Production). Preview domen `*.test.mkweb-dev.com` (opciono, može da se ukloni).
  - Secret `RESEND_API_KEY` je podešen.
- **DNS:** nameserveri prebačeni sa Namecheap-a na Cloudflare (`merlin` / `selah.ns.cloudflare.com`), 27. 11.
- **Resend:** domen `mkweb-dev.com` verifikovan; zapisi (`send`, `rsend`, `resend._domainkey`) su u Cloudflare DNS-u.
- **Netlify:** sajt obrisan. Netlify GitHub App po želji ukloniti (GitHub → Settings → Applications).
- **CI (GitHub Actions):** lint/typecheck ispravke u v1.4.1; lock fajlovi za `web/` i `studio/` su u repou.
- **Sanity:** projekat `i1beswkh`, dataset `production` (public). Studio radi lokalno (`studio/.env`).

## Otvoreno — sledeći koraci

1. [ ] Sačekati da domen bude **Active** u Cloudflare-u i da Universal SSL sertifikat bude izdat (greška `ERR_CERT_COMMON_NAME_INVALID` je do tada očekivana; lokalno: `sudo resolvectl flush-caches` + Chrome host cache).
2. [ ] Dodati `www.mkweb-dev.com` kao custom domain u Worker.
3. [ ] SSL/TLS → Full (strict), Always Use HTTPS.
4. [ ] Sanity: `npx sanity login`, pa `npm run import:projects` (iz `studio/`) — 18 projekata još nije u Sanity-ju.
5. [ ] Sanity: `npm run deploy` (javni Studio), CORS po potrebi.
6. [ ] Cloudflare Build variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID=i1beswkh`, `NEXT_PUBLIC_SANITY_DATASET=production`, `NEXT_PUBLIC_SANITY_API_VERSION=2026-02-01` → Retry build.
7. [ ] Deploy hook u Cloudflare-u + webhook u Sanity-ju (create/update/delete).
8. [ ] Test: prvi blog post u Studiju → Publish → proveri `/blog/`.
9. [ ] Test forme iz incognita (mejl stiže sa `inquiry@mkweb-dev.com`, Reply ide klijentu).
10. [ ] Email Routing (opciono): obrisati Namecheap `eforward` MX + SPF, uključiti Cloudflare Email Routing (`hello@` → Gmail).
11. [ ] Analitika: Cloudflare Web Analytics (automatski), Google Search Console (Domain property, TXT u Cloudflare DNS), Bing Webmaster (import iz GSC).

## Odluke koje važe

- **Bez indeksiranja do lansiranja.** U `web/public/_headers` pod `/*` ide `X-Robots-Tag: noindex`. Ne slati sitemap i ne raditi Request Indexing dok se ne završi plan ispod. Ne koristiti `Disallow: /` u robots.txt (Google tada ne vidi `noindex`).
- **Plan pre lansiranja (redom):** sekcije i layout → performance (Core Web Vitals, mobilni prvo) → SEO → AEO/GEO → ukloniti `noindex`, poslati sitemap, Request Indexing za početnu + 3–5 ključnih stranica.
- **Analitika bez kolačića:** Cloudflare Web Analytics + Search Console. GA4 tek uz cookie banner (posetioci iz EU).
- **Sanity umesto WordPress-a za portfolio:** statički export, nema servera ni održavanja; Sanity se zove samo pri build-u.
- **Tajne nikad u repo:** `.env`, `.env.local`, `.dev.vars` su u `.gitignore`.

## Navika pre svakog push-a

```bash
cd web && npm run typecheck && npm run lint && npm test && npm run build
cd ../studio && npx tsc --noEmit
```
Kad se menja `package.json` → `npm install` i commit `package-lock.json` zajedno sa njim.
