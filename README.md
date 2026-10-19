# kev.dev Casual

Die warme, offene Variante von kev.dev: stellt Kevin Schaberl wie ein Angebot vor,
mit Werkstatt (eine kleine Live-Demo pro Projekt), Ablauf, Werdegang und Kontakt.

Vanilla TypeScript + Vite, kein Framework — wie kev.dev selbst.

## Befehle

- `npm run dev` — Dev-Server
- `npm run build` — `tsc` (nur Typprüfung) und `vite build` nach `dist/`
- `npm run preview` — gebautes `dist/` ausliefern

## Aufbau

- `index.html` — der komplette Inhalt der Seite (Texte stehen hier)
- `src/style.css` — Tokens für hell/dunkel, eine Akzentfarbe, Layout
- `src/main.ts` — lädt Schriften und Module
- `src/canvas.ts` — ein gemeinsamer rAF-Loop; jede Canvas zeichnet nur, solange sie sichtbar ist
- `src/hero.ts` — Punktefeld hinter der Werkbank-Karte, Werkzeug-Laufband
- `src/tenants.ts` — die fünf YourBrand-Mandanten (Farben, Schriften, Menünamen aus ihren `tenant.json`)
- `src/workshop.ts` — die Demos in Angebot und Werkstatt
- `src/ui.ts` — Theme, Einblenden beim Scrollen, Hochzählen, Konfetti, Mail kopieren

## Pflege

Die Karte „Gerade auf der Werkbank“ im Hero (`index.html`) zeigt, woran gerade
gearbeitet wird — sie muss mitgezogen werden, wenn sich das ändert. Die Kennzahlen
stehen mit ihrer Quelle im Abschnitt „Was die Zahlen sagen“.

## Grundsatz

Nichts erfinden, nichts übertreiben: Zahlen kommen aus den Repos, Unfertiges heißt unfertig.
