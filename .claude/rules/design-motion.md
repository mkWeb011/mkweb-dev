# Dizajn i motion

- Paleta: tamna baza `#131313`, topla bela, plavi akcenat (`--blue`, `--blue-2`, gradijenti) samo kao naglasak. Nova boja ide kao token u `web/src/styles/tokens.css`, nikad hardkodovana.
- Tipografija: veliki editorijalni naslovi, italic serif reč kao naglasak (`<span className="serif">`).
- Animacije: GSAP + ScrollTrigger kroz `useGSAP` sa `scope` i čišćenjem; Lenis za skrol; Three.js samo u hero sferi.
- Svaka animacija mora imati reduced-motion varijantu (`gsap.matchMedia` ili `@media (prefers-reduced-motion)`).
- Bez scroll hijacking-a, bez layout shift-a, bez bounce/elastic easing-a. Interni scroll kontejneri dobijaju `data-lenis-prevent`.
- Mobilni raspored se dizajnira posebno, ne smanjuje se desktop.
- Posle vizuelne izmene: proveri 1440 px i 390 px širinu.
