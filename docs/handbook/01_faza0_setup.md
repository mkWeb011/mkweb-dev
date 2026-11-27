# Faza 0 — Postavka projekta

**Cilj faze:** prazan folder → Next.js projekat koji se pokreće, sa TypeScript-om, lintom, formatiranjem i Git-om. Još nema dizajna — gradimo temelj.

## Korak 1: folder, Git i Node verzija

```bash
mkdir mk-portfolio && cd mk-portfolio
git init
node -v          # mora biti v20.9 ili novije; preporuka: 22.x
```

Napravi fajl `.nvmrc` sa jednim redom — verzijom Node-a. Alati kao `nvm` i build servisi ga čitaju i automatski biraju pravu verziju.

@file .nvmrc

:::senior
Zaključaj verziju Node-a u repozitorijumu od prvog dana. „Kod mene radi" je skoro uvek razlika u verziji Node-a između tvog računara, kolege i servera za build.
:::

## Korak 2: create-next-app

Next.js ima generator. Pokrećemo ga u podfolderu `web`, jer će pored njega živeti i `studio` (Sanity):

```bash
npx create-next-app@latest web --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --turbopack
cd web
npm run dev     # otvori http://localhost:3000
```

Šta znače opcije: `--ts` TypeScript; `--app` App Router (novi način rutiranja, folderi u `src/app`); `--src-dir` kod u `src/`; `--no-tailwind` jer imamo sopstveni dizajn sistem u CSS-u; `--import-alias "@/*"` omogućava `import x from '@/lib/x'` umesto `../../../lib/x`.

Generator pravi primer stranicu. Sve generisane fajlove ćemo sada zameniti našim verzijama — jedan po jedan, sa objašnjenjem. Fajlove `src/app/page.module.css`, `public/*.svg` i primer sadržaj slobodno obriši.

## Korak 3: package.json — lična karta projekta

@file web/package.json

Blok po blok:

- **`"type": "module"`** (linija 5) — fajlovi `.js`/`.mjs` koriste moderne `import`/`export` module.
- **`engines`** (6–8) — dokumentuje minimalni Node. npm upozorava ako je verzija starija.
- **`scripts`** (9–18) — komande koje pokrećeš sa `npm run <ime>`. `dev` je razvojni server sa Turbopack-om (u Next.js 16 podrazumevani bundler). `build` pravi statički sajt u `out/`. `typecheck` i `lint` proveravaju kod. `test` pokreće unit testove kroz `tsx` (TypeScript bez prevođenja), `format` formatira ceo projekat Prettier-om, a `seed:projects` izvozi projekte za Sanity (faza 8a).
- **`dependencies`** (19–30) — paketi koji završe u sajtu: `next`, `react`, `react-dom`; animacije (`gsap`, `@gsap/react`, `lenis`, `three`); Sanity (`@sanity/client`, `@sanity/image-url`, `@portabletext/react`).
- **`devDependencies`** (31–41) — alati samo za razvoj: TypeScript, tipovi, ESLint, Prettier, tsx.

:::zamka Verzije u ovom fajlu
Brojevi verzija su minimalni koje sam koristio pri pisanju (novembar 2026). Ne kopiraj ih slepo — instaliraj pakete komandama ispod, pa npm upisuje najnovije verzije. Ako neki paket u međuvremenu izbaci major verziju (npr. `three` na 0.x verzijama menja „minor" kao da je major), pročitaj njegov changelog pre nadogradnje.
:::

```bash
npm install gsap @gsap/react lenis three @sanity/client @sanity/image-url @portabletext/react
npm install -D @types/three tsx prettier
```

:::stack package.json u drugim svetovima
Laravel: `composer.json` (PHP paketi) **i** `package.json` (Vite, frontend). MERN: obično dva `package.json` — jedan za Express server, jedan za React klijent — ili monorepo kao ovde. Gatsby: isti `package.json`, ali sa `gatsby-plugin-*` paketima, jer Gatsby gotovo sve radi kroz pluginove. Next.js ima malo pluginova; umesto toga, ti pišeš obične funkcije.
:::

:::wp
`package.json` je kombinacija zaglavlja `style.css` teme (ime, verzija) i `composer.json` (zavisnosti). `node_modules/` je kao `vendor/` — nikad ga ne commit-uješ, uvek se rekreira iz `package-lock.json`.
:::

## Korak 4: tsconfig.json — pravila za TypeScript

@file web/tsconfig.json

Najvažnije opcije:

- **`"strict": true`** (7) — uključuje sve stroge provere. Na početku boli, posle štedi sate debugovanja.
- **`"noUncheckedIndexedAccess": true`** (8) — `niz[3]` ima tip `T | undefined`, jer element možda ne postoji. Videćeš u `lib/projects.ts` kako nas to tera da obradimo kraj liste.
- **`"moduleResolution": "bundler"`** (12) — rešava importe kao što to radi Turbopack/webpack.
- **`"jsx": "react-jsx"`** (15) — JSX se prevodi automatski; ne moraš da pišeš `import React`.
- **`paths`** (18–20) — alias `@/*` → `./src/*`.

:::zasto TypeScript za nekoga ko dolazi iz PHP-a
PHP 8 sa `declare(strict_types=1)` i tipovima parametara je već pola puta do TypeScript-a. Razlika: TypeScript proverava **pre** pokretanja, u editoru, dok kucaš. Kad promeniš ime polja u tipu `Project`, VS Code ti odmah podvuče svih 15 mesta koja treba popraviti.
:::

## Korak 5: next.config.ts — statički export

@file web/next.config.ts

Ovo je jedna od najvažnijih odluka u projektu, zato je komentar u fajlu dug.

- **`output: 'export'`** (10) — `next build` piše gotove HTML/CSS/JS fajlove u `out/`. Nema Node servera u produkciji → hosting je besplatan i skoro neuništiv.
- **`trailingSlash: true`** (11) — `/work/zignify/` postaje `out/work/zignify/index.html`. Svaki statički hosting to servira bez dodatnih pravila za preusmeravanje.
- **`images.unoptimized: true`** (16) — Next-ov optimizator slika radi na serveru, koga nemamo. Slike iz Sanity-ja optimizuje Sanity CDN (videćemo u fazi 8).

:::zasto Šta gubimo statičkim exportom
Nemamo ISR (osvežavanje strane u pozadini), API rute, `proxy.ts` (bivši middleware), ni Draft Mode za pregled neobjavljenih postova. Za portfolio sa blogom ništa od toga nije potrebno: sadržaj se menja par puta mesečno, a objava posta automatski pokreće novi build (faza 10). Kad ti jednog dana zatreba Live Preview, skidaš jednu liniju i deploy-uješ na hosting sa Node podrškom.
:::

## Korak 6: ESLint

@file web/eslint.config.mjs

Next.js 16 je **uklonio** komandu `next lint` — ESLint pokrećemo direktno (`eslint .`). Konfiguracija je u novom „flat" formatu: niz objekata koji se primenjuju redom. `core-web-vitals` pravila hvataju greške koje kvare performanse (npr. `<img>` bez dimenzija), a `typescript` pravila hvataju neiskorišćene promenljive i slično.

:::zamka Stari tutorijali
Ako vidiš `.eslintrc.json` sa `"extends": "next/core-web-vitals"` ili `"lint": "next lint"` — to je pre-16 način i više ne radi. Na isti način prepoznaješ zastareo tutorijal.
:::

## Korak 7: env promenljive

@file web/.env.example

`.env.example` se commit-uje i služi kao spisak potrebnih promenljivih. Prave vrednosti idu u `.env.local`, koji je u `.gitignore`.

:::zamka NEXT_PUBLIC_
Sve što počinje sa `NEXT_PUBLIC_` Next.js **ugrađuje u JavaScript koji ide u browser**. Sanity project ID i dataset su javni identifikatori — to je u redu. Token sa pravom pisanja nikad ne sme imati taj prefiks. Pravilo: ako je tajna, nema `NEXT_PUBLIC_`.
:::

## Korak 8: fajlovi u korenu repozitorijuma

`.gitignore` — šta Git ignoriše:

@file .gitignore

`.editorconfig` — isti razmaci i krajevi linija u svakom editoru:

@file .editorconfig

Prettier — automatsko formatiranje. Jednom podesiš, nikad više ne raspravljaš o navodnicima:

@file .prettierrc.json

@file .prettierignore

:::senior
Uključi u VS Code „Format on Save" sa Prettier-om. Formatiranje nikad ne treba da bude tema code review-a — to radi mašina. Ljudi gledaju logiku.
:::

:::testiraj
```bash
cd web
npm run dev        # strana se otvara na localhost:3000
npm run typecheck  # bez grešaka
npm run lint       # bez grešaka
```
:::

:::commit
`chore: scaffold Next.js 16 app with TypeScript, ESLint, Prettier and static export`
:::
