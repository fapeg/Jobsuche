# Jobsuche

Statische Website mit ausgewählten Startups aus **Essen, Düsseldorf und Köln** (je 15). Zu jedem Startup gibt es
ein Kurzprofil (Branche, Gründungsjahr, was es macht, Zahlen zu Größe/Finanzierung) und einen direkten Link zur
Karriereseite. Recherche-Stand: Oktober 2026.

Funktionen:

- Auswahl nach Stadt, Filter nach Branche, Volltextsuche (findet auch „koln“ für „Köln“) und Sortierung
- Für Handy und Desktop optimiert, mit hellem und dunklem Farbschema
- Filter stehen in der URL (z. B. `index.html#stadt=koeln&branche=energie`) und lassen sich als Link teilen
- Kein Build-Schritt und keine Abhängigkeiten: reines HTML, CSS und JavaScript

## Ansehen

`index.html` einfach im Browser öffnen, ein Webserver ist nicht nötig.

Online stellen lässt sich die Seite z. B. über **GitHub Pages**: Unter *Settings → Pages* bei *Source* den Branch
`main` und den Ordner `/ (root)` wählen. Die Seite liegt danach unter `https://<nutzer>.github.io/<repo>/`.

## Aufbau

```
index.html                Seitengerüst; bindet Daten und Skript ein
assets/styles.css         Layout und Farben (inkl. Farbe pro Branche)
assets/app.js             Filter, Suche, Sortierung, Darstellung der Karten
data/kategorien.js        Liste der Branchen-Kategorien
data/staedte/<stadt>.js   eine Datei pro Stadt mit den Startups
scripts/pruefe-daten.mjs  prüft die Daten auf Pflichtfelder, Links und Dubletten
```

## Neue Stadt hinzufügen

1. Eine bestehende Datei kopieren, z. B. `data/staedte/koeln.js` nach `data/staedte/dortmund.js`.
2. `id` (klein, ohne Umlaute, z. B. `dortmund`), `name`, `beschreibung`, `hinweis` und `quellen` anpassen
   und die Startups eintragen.
3. In `index.html` vor `assets/app.js` eine Zeile ergänzen:
   ```html
   <script src="data/staedte/dortmund.js"></script>
   ```
   Die Reihenfolge der `<script>`-Zeilen bestimmt die Reihenfolge der Städte-Buttons.
4. Daten prüfen:
   ```sh
   node scripts/pruefe-daten.mjs
   ```

Aufbau eines Startup-Eintrags:

```js
{
  name: 'Beispiel GmbH',
  kategorie: 'software',          // Schlüssel aus data/kategorien.js
  branche: 'KI für Logistik',     // kurze Branchenangabe
  gegruendet: 2021,               // Jahr oder null, wenn unbekannt
  beschreibung: 'Was das Startup macht – ein bis zwei Sätze.',
  highlights: 'Finanzierung, Teamgröße, Standorte …',
  hinweis: 'Optional: z. B. „Gehört inzwischen zu …“',
  website: 'https://…',           // oder null
  karriere: 'https://…/jobs',     // oder null → Karte zeigt „Jobs suchen“ (Websuche)
  karriereHinweis: 'Optional: z. B. „Stellen über JOIN.“ (Pflicht, wenn karriere null ist)',
}
```

Eine neue Branche kommt in `data/kategorien.js` dazu; ihre Farbe wird in `assets/styles.css` als
`--kat-<schlüssel>` (helles und dunkles Schema) plus eine Zeile `[data-kategorie="<schlüssel>"]` ergänzt.

## Hinweis zu den Daten

Auswahl und Profile beruhen auf öffentlichen Quellen (Startup-Rankings, Fachpresse wie deutsche-startups.de,
Wirtschaftsförderungen, Unternehmenswebsites); die Quellen je Stadt stehen im Fuß der Seite. Offene Stellen
und Karriereseiten ändern sich laufend, deshalb die Daten gelegentlich aktualisieren.
