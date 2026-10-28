# kev.dev Casual

Die freundliche, verkaufende Variante von kev.dev: Kevin Schaberl bietet Produktseiten
mit 3D und Scroll-Animationen an, und die Seite ist selbst wie eine Produktseite aufgebaut.
Drei Demo-Produktseiten (fiktive Produkte) zeigen, wie das aussieht.

Vanilla TypeScript + Vite + three.js, kein Framework.

## Befehle

- `npm run dev`: Dev-Server
- `npm run build`: `tsc` (nur Typprüfung) und `vite build` nach `dist/`
- `npm run preview`: gebautes `dist/` ausliefern

## Seiten

Zwei Einstiege in `vite.config.ts`, normale Navigation ohne Router:

- `index.html`: die Hauptseite (alle Texte stehen hier)
- `demos/index.html`: die Demo-Produktseiten, ein Tab pro Produkt, per `#halde`, `#kern`, `#zirbn` direkt verlinkbar

## Aufbau

- `src/main.ts`: Schriften und Module der Hauptseite
- `src/cards.ts`: Intro mit dem 3D-Stapel aus fünf Visitenkarten (85 × 55 mm). Die Kartentexte werden in `cardCanvas()` gezeichnet.
- `src/demo-art.ts`: die kleinen 2D-Animationen auf den Demo-Karten
- `src/dots.ts`: Punkte-Porträt in „Über mich“, Platzhalter bis FaceDots ein echtes Foto bekommt
- `src/ui.ts`, `src/util.ts`: Einblenden beim Scrollen, Mail kopieren, ein gemeinsamer rAF-Loop (jede Canvas zeichnet nur, solange sie sichtbar ist)
- `src/demos/`: `main.ts` (Tabs, Scroll-Fortschritt, Regler), `shared.ts` (Renderer, Umgebungslicht), je eine Datei pro Szene: `halde.ts` (Kaffeefilter), `kern.ts` (Laptop, Explosionsansicht), `zirbn.ts` (Limo-Dose)

## Offen

- Preise der Pakete stehen als „ab … €“ da und sind als Platzhalter markiert.
- Impressum und Datenschutz verlinken noch nirgends hin.
- Das Porträt ist ein gezeichneter Platzhalter, kein Foto.

## Grundsatz

Nichts erfinden, nichts übertreiben: Zahlen über Kevin kommen aus seinen Repos. Die Demo-Produkte
sind erfunden und sagen das auf jeder Seite.
