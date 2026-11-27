# Faza 6 — Motion sistem: GSAP, Lenis, Three.js u React-u

**Cilj faze:** vraćaš animacije iz prototipa, ali na React način — sa čišćenjem, bez curenja memorije, sa poštovanjem `prefers-reduced-motion`. Učiš `useGSAP`, `contextSafe`, React Context i kako se imperativna biblioteka (Three.js) uklapa u deklarativni React.

:::zasto Zašto animacije prave probleme u React-u
GSAP i Three.js direktno menjaju DOM i čuvaju svoja stanja (tweens, ScrollTrigger-e, WebGL kontekst). React može da ukloni komponentu u bilo kom trenutku — pri navigaciji, ili dvaput u razvoju zbog Strict Mode-a. Ako animacija nije počišćena, ostaje da „visi": ScrollTrigger meri element koji više ne postoji, WebGL kontekst troši memoriju, a posle par navigacija sajt postaje trom. Ceo ovaj fazni posao se svodi na jedno pravilo: **sve što pokreneš u efektu, ugasi u cleanup-u**.
:::

:::ispod Strict Mode pokreće efekte dvaput
U razvoju (`npm run dev`) React namerno montira, demontira i ponovo montira svaku komponentu. Cilj: da odmah vidiš da li cleanup radi. Ako ti se animacija u razvoju pokrene dvaput ili se dva Three.js platna pojave jedno ispod drugog — cleanup ne radi. U produkciji se efekti izvršavaju jednom.
:::

## lib/gsap.ts — jedno mesto za GSAP

@file web/src/lib/gsap.ts

- Svi fajlovi uvoze `gsap` **odavde**, nikad direktno iz paketa `gsap`. Tako se pluginovi registruju tačno jednom.
- `if (typeof window !== 'undefined')` — ovaj fajl se importuje i tokom build-a (u Node-u, bez `window`). Registraciju radimo samo u browseru.
- Od GSAP 3.13 svi pluginovi, uključujući SplitText, besplatni su i dolaze u npm paketu.
- `MQ` — zajednički media query-ji. Kad svaka animacija koristi iste uslove, nema situacije da se pola sajta animira na tabletu, a pola ne.

## SmoothScroll — Lenis i React Context

@file web/src/components/motion/SmoothScroll.tsx

**Context (16–22).** Lenis instanca treba meniju (da zaustavi skrol) i linkovima (da glatko skroluju). Umesto da je prosleđujemo kroz props kroz pet nivoa komponenti, pravimo **Context**: `LenisContext.Provider` (87) je obavija oko celog sajta u layoutu, a bilo koja komponenta je čita sa `useLenis()`. Ovo je React-ov `global $wp_query` — ali eksplicitan i vezan za deo stabla.

**Prvi efekat (41–62): kreiranje.** Ako korisnik ne traži manje pokreta, napravi Lenis. Zatim ga povezujemo sa GSAP-om:

- `instance.on('scroll', ScrollTrigger.update)` — pri svakom glatkom pomeranju, ScrollTrigger preračuna pozicije.
- `gsap.ticker.add(raf)` — Lenis se pokreće iz GSAP-ovog sata, ne iz posebnog `requestAnimationFrame`. **Jedan sat za obe biblioteke** = nema treperenja.
- `lagSmoothing(0)` — GSAP inače „usporava" kad tab zaostane; za skrol to pravi skokove, pa ga isključujemo.
- Cleanup: skini sa tickera, uništi instancu.

**Drugi efekat (64–78): linkovi na istoj strani.** Jedan listener na celom dokumentu hvata klik na bilo koji link sa `#`. Ako vodi na istu stranu (`/#work` dok si na `/`), sprečava skok i umesto toga glatko skroluje. Ovo je **event delegation** — isti obrazac kao `jQuery(document).on('click', 'a', ...)`.

**Treći efekat (80–85): posle navigacije.** Kad `pathname` promeni (prelaz na case studiju), vrati skrol na vrh i reci ScrollTrigger-u da sve izmeri ponovo.

## SiteMotion — „režiser" animacija početne strane

@file web/src/components/motion/SiteMotion.tsx

Ovo je arhitektonska odluka vredna razumevanja: sekcije su Server Components (bez JS-a), a **jedna** klijentska komponenta koja ne prikazuje ništa (`return null`) pronalazi ih po klasama i `data-` atributima i animira ih.

**`useGSAP(() => {...})`** iz `@gsap/react` je `useEffect` sa automatskim čišćenjem: sve što GSAP napravi unutar funkcije (tweens, timeline-ovi, ScrollTrigger-i, SplitText podele) beleži se u kontekst i poništava kad komponenta nestane. Bez ovog hooka, morao bi ručno da pamtiš i gasiš svaku od pedesetak animacija.

**`gsap.matchMedia()`** (linije 21, 172, 191) — animacije se registruju po uslovu. Ako se uslov promeni (rotiraš tablet, uključiš „Reduce motion" usred posete), GSAP automatski poništi animacije tog uslova i vrati elemente u prvobitno stanje. Bolje od ručnog `if (window.innerWidth > 900)`, koji se proverava samo jednom.

**Hero intro (26–49).** `SplitText.create(name, { type: 'chars', mask: 'chars' })` deli „Marko Kostić" na slova, svako u svojoj maski, pa slova izranjaju jedno po jedno (`stagger: 0.035`). SplitText 3.13 automatski dodaje `aria-label` sa celim tekstom, pa čitač ekrana i dalje čita „Marko Kostić", a ne „M a r k o".

**Scrub animacije.** `scrub: true` vezuje napredak animacije za skrol: skroluješ napred — animacija ide napred; nazad — vraća se. Tako rade izjava koja „svetli" reč po reč (51–65) i linija vremenske ose koja se iscrtava (124–138).

**Portret (105–122).** Tri sloja pokreta na jednoj slici, svaki sa svojim zadatkom: `clipPath: 'inset(100% 0 0 0)'` otkriva okvir odozdo nagore kao zavesa; slika istovremeno „izlazi" iz uvećanja (`scale: 1.25` → 1), pa deluje kao da se kamera odmiče; a dok skroluješ, slika se lagano pomera unutar okvira (`yPercent: -6`, `scrub: true`) — paralaksa. Okvir ima `overflow: hidden`, pa se pomeranje nikad ne vidi kao „rupa".

**Horizontalni skrol (171–189).** Samo na desktopu: sekcija sa sposobnostima se zakači (`pin: true`) i kartice klize ulevo dok skroluješ naniže. `x: () => -distance()` je **funkcija**, ne broj — uz `invalidateOnRefresh: true` dužina se ponovo računa kad se promeni veličina prozora.

**Kraj (200–205).** Kad se fontovi učitaju, tekst menja širinu, pa sve pozicije treba izmeriti ponovo (`ScrollTrigger.refresh()`). I na kraju uklanjamo klasu `motion-pending` koju je postavio inline skript iz layout-a.

:::zasto motion-pending: zašto je potreban skript u head-u
Bez njega se dešava ovo: HTML stigne → hero tekst je vidljiv → React se hidratiše → `SiteMotion` doda klasu `has-motion` koja sakriva tekst → animacija ga ponovo prikaže. Posetilac vidi treptaj: vidljivo → nevidljivo → animirano. Mali skript u `<head>` postavi klasu **pre prvog iscrtavanja**, pa tekst nikad nije vidljiv pre animacije. Sigurnosna mreža: posle 4 sekunde klasa se skida sama, da tekst nikad ne ostane sakriven ako JavaScript zakaže. Ako je uključeno „Reduce motion", skript ne radi ništa.
:::

:::zamka Animacije koje čekaju JS sakrivaju sadržaj
Nikad ne stavljaj `opacity: 0` u CSS „jer će ga GSAP prikazati". Ako se JS ne učita (spora mreža, blokator, greška), sadržaj zauvek ostaje nevidljiv — i za Google. Zato su sva početna stanja vezana za klasu `has-motion`, koju postavlja JavaScript tek kad je spreman.
:::

## SelectedWork — useGSAP sa scope-om i contextSafe

@file web/src/components/sections/SelectedWork.tsx

Lista istaknutih projekata sa karticom koja prati kursor.

- `useGSAP(..., { scope })` — `scope` je ref na sekciju; selektori unutar funkcije traže elemente samo u njoj.
- `gsap.quickTo(el, 'x', ...)` — pravi funkciju optimizovanu za česte pozive (svaki pomeraj miša). Brže od novog `gsap.to` pri svakom događaju.
- **`contextSafe`** — handleri `show` i `hide` se izvršavaju na hover, **posle** što je `useGSAP` završio. Animacije napravljene tada inače ne bi bile u kontekstu i ne bi se počistile. `contextSafe(fn)` ih uvlači u kontekst.
- `const [active, setActive] = useState<Project | null>(null)` — koji projekat je u kartici. Kartica prikazuje `ProjectVisual` aktivnog projekta.

:::zamka Pozicioniranje sa transformom
CSS kartice ima `transform: translate(-50%, -50%)` da bi se centrirala na kursoru. Čim GSAP postavi `x`/`y`, prepisuje ceo `transform`, pa centriranje nestaje i kartica „visi" desno-dole od kursora. Rešenje: reci GSAP-u isto preko njegovih svojstava — `gsap.set(el, { xPercent: -50, yPercent: -50 })`. Pravilo: kad GSAP upravlja transformom, sve delove transforma daj GSAP-u.
:::

## Magnetic i SignalWave — mali obrasci

@file web/src/components/motion/Magnetic.tsx

Omotač koji pomera dete ka kursoru. Primer **kompozicije**: `Magnetic` ne zna šta obavija (`children`); u `Contact` obavija dugme za poziv, a sutra može bilo šta. Listener-e kačimo u `matchMedia` callback-u i vraćamo funkciju koja ih skida.

@file web/src/components/motion/SignalWave.tsx

Talas na kartici BalkanSignal. Najvažnija lekcija: **ne koristi state za animaciju od 60 frejmova u sekundi**. Svaki `setState` znači novi render cele komponente. Umesto toga, ref na `<path>` i direktno `path.setAttribute('d', ...)` u GSAP ticker-u — React se uopšte ne uključuje. `IntersectionObserver` gasi računanje kad kartica nije na ekranu.

Funkcija `wavePath` je izvezena i čista, pa ima svoj test:

@file web/tests/wave.test.ts

## HeroCanvas — Three.js u React-u

@file web/src/components/motion/HeroCanvas.tsx

Three.js je potpuno imperativan: praviš scenu, kameru, geometriju i sam crtaš frejmove. React-ov posao je mali: da da DOM čvor (`hostRef`), da pokrene Three.js posle montiranja i da sve očisti pri demontiranju.

**Dinamički import.** `import('three').then(...)` — Three.js (~600 KB) se učitava tek kad je strana već prikazana i interaktivna, kao zaseban fajl. Ne usporava prvo iscrtavanje.

**`let disposed = false`** — import traje. Ako korisnik napusti stranu pre nego što se završi, `cleanup` postavi `disposed = true`, pa `.then` ne pravi scenu za komponentu koje više nema. Klasičan obrazac za asinhroni kod u efektima.

**Fibonačijeva sfera.** Petlja raspoređuje 12.000 tačaka (5.000 na mobilnom) ravnomerno po sferi pomoću zlatnog ugla. Pozicije idu u `Float32Array` — tipizovani niz koji se direktno šalje grafičkoj kartici.

**Uniforms** su vrednosti koje JavaScript prosleđuje šejderu svakog frejma: vreme, napredak skrola, položaj miša, i dve boje — `uColor` (topla bela) i `uColorB` (plava `#2F7BFF`, dodata u drugom izdanju). `gsap.to(uniforms.uScroll, { value: 1, scrollTrigger: {...} })` — GSAP može da animira bilo koje svojstvo bilo kog objekta, ne samo CSS. Kako skroluješ niz hero, sfera se raspršuje.

**Štednja.** `IntersectionObserver` zaustavlja crtanje kad hero nije vidljiv; `ResizeObserver` prilagođava platno; `Math.min(devicePixelRatio, 1.6)` ograničava rezoluciju na retina ekranima.

**Cleanup** — najduži deo fajla, i tako treba: zaustavi petlju, ubij tweens i njihove ScrollTrigger-e, skini listener-e, isključi observere, oslobodi geometriju, materijal i renderer, ukloni platno.

:::zamka Dinamički import može da padne — pronađeno testom
Prva verzija nije imala `.catch` na `import('three')`. Dinamički import je mrežni zahtev: offline korisnik, CDN koji ne radi, deploy u toku. Bez `.catch`, neuspeh postaje „Unhandled promise rejection" u konzoli. Test sa namerno neispravnim Three.js paketom je to otkrio. Sada se greška beleži kao upozorenje, a hero radi i bez sfere — tekst je ionako sav u HTML-u.
:::

@file web/src/components/motion/heroShaders.ts

Šejderi su programi u jeziku GLSL koji se izvršavaju na grafičkoj kartici. **Vertex shader** se pokreće jednom po tački: pomera je simpleks šumom (organsko „disanje"), gura tačke ka mišu i raspršuje sferu prema `uScroll`. **Fragment shader** se pokreće po pikselu: crta mekani krug umesto kvadrata. **`varying float vTint`** je most između njih: vertex shader izračuna koliko je tačka „duboka" (zadnja strana sfere) i koliko je šum pomera, i preda tu vrednost fragment shader-u, koji sa `mix(uColor, uColorB, vTint)` meša belu i plavu. Rezultat: prednja strana sfere je svetla, a dubina tone u plavo — boja nosi informaciju o prostoru, ne samo ukras. Ne moraš razumeti svaku liniju šuma (to je standardna Ashima implementacija) — bitno je da znaš koje uniforme ulaze i šta menjaju.

:::stack Animacije u drugim stackovima
**WordPress:** GSAP se učita kroz `wp_enqueue_script`, a animacije pišeš u jednom `main.js` nad gotovim HTML-om — tačno kao prototip ovog sajta. **Webflow:** Interactions rade isto bez koda, a DevLink izvozi Webflow komponente i interakcije u React. **Vue/Nuxt:** isti GSAP, samo se pokreće u `onMounted` i čisti u `onUnmounted`. **React bez GSAP-a:** Motion (bivši Framer Motion) je deklarativna alternativa — `<motion.div animate={{ opacity: 1 }}>` — odličan za UI prelaze, slabiji za duge scroll scene. Pravilo: GSAP za priču vezanu za skrol, Motion ili CSS za mikro-interakcije komponenti.
:::

:::testiraj
1. `npm run dev` — slova imena izranjaju, sfera se pojavljuje desno, izjava svetli dok skroluješ, kartice sposobnosti klize horizontalno.
2. U sistemu uključi „Reduce motion" i osveži — sve je statično i odmah vidljivo; sfera je jedan nepomičan frejm.
3. DevTools → Performance → snimaj skrol: nema dugih zadataka; posle odlaska sa početne (klik na case studiju) u Memory → Heap snapshot nema `WebGLRenderer` objekata.
:::

:::commit
`feat(motion): add GSAP/Lenis motion system, magnetic CTA and Three.js hero field`
:::
