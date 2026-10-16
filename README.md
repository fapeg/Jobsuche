# Jobsuche

Statische Website mit ausgewählten Startups aus **Essen, Düsseldorf und Köln** (je 15). Zu jedem Startup gibt es
ein Kurzprofil (Branche, Gründungsjahr, was es macht, Zahlen zu Größe/Finanzierung) und einen direkten Link zur
Karriereseite. Recherche-Stand: Oktober 2026.

Funktionen:

- Auswahl nach Stadt, Filter nach Branche, Volltextsuche (findet auch „koln“ für „Köln“) und Sortierung
- Für Handy und Desktop optimiert, mit hellem und dunklem Farbschema
- Filter stehen in der URL (z. B. `index.html#stadt=koeln&branche=energie`) und lassen sich als Link teilen
- Startups lassen sich als **„geprüft“** markieren (ausgegraut, durchgestrichen, mit Datum) – synchron auf allen Geräten
- Kein Build-Schritt und keine Abhängigkeiten: reines HTML, CSS und JavaScript

## Ansehen

`index.html` einfach im Browser öffnen, ein Webserver ist nicht nötig.

Online stellen lässt sich die Seite z. B. über **GitHub Pages**: Unter *Settings → Pages* bei *Source* den Branch
`main` und den Ordner `/ (root)` wählen. Die Seite liegt danach unter `https://<nutzer>.github.io/<repo>/`.

## Karriereseiten als „geprüft“ markieren

Jede Karte hat unten den Knopf **„Als geprüft markieren“**. Geprüfte Startups werden ausgegraut und durchgestrichen,
mit Datum angezeigt und lassen sich über **Alle / Offen / Geprüft** filtern.

Gespeichert wird in der Datei [`data/geprueft.json`](data/geprueft.json) hier im Repository – das Repository ist
also die „Datenbank“, ein eigener Server ist nicht nötig. Die Seite liest und schreibt die Datei über die GitHub-API:

- **Lesen** klappt auf jedem Gerät ohne Anmeldung.
- **Speichern** braucht pro Gerät einmalig einen GitHub-Token. Auf der Seite auf **„Sync einrichten“** tippen und
  der Anleitung folgen: unter <https://github.com/settings/personal-access-tokens/new> einen *Fine-grained Token* nur
  für dieses Repository mit *Contents: Read and write* erstellen und einfügen. Der Token bleibt im Browser gespeichert.
- Jede Markierung wird als kleiner Commit gespeichert (mehrere schnelle Klicks landen in einem Commit). Ohne Token
  oder offline wird die Änderung lokal vorgemerkt und beim nächsten Sync nachgereicht.
- Ändern zwei Geräte gleichzeitig, werden die Stände zusammengeführt.

Der Speicherort steht in `data/einstellungen.js`. Hinweis: Da das Repository öffentlich ist, ist auch die Liste der
geprüften Firmen öffentlich einsehbar.

Intern wird jedes Startup über einen Schlüssel aus Stadt und Name gespeichert (z. B. `koeln/deepl`). Wird ein
Startup umbenannt, bleibt seine Markierung erhalten, wenn man im Eintrag `id: '<alter-schlüsselteil>'` setzt
(z. B. `id: 'deepl'`). `node scripts/pruefe-daten.mjs` weist auf verwaiste Einträge in `geprueft.json` hin.

## Aufbau

```
index.html                Seitengerüst; bindet Daten und Skripte ein
assets/styles.css         Layout und Farben (inkl. Farbe pro Branche)
assets/app.js             Filter, Suche, Sortierung, Darstellung der Karten
assets/pruefstatus.js     „Geprüft“-Markierungen speichern und über GitHub synchronisieren
data/einstellungen.js     Repository und Datei für den Prüfstatus
data/geprueft.json        gespeicherte Markierungen (wird von der Seite geschrieben)
data/kategorien.js        Liste der Branchen-Kategorien
data/staedte/<stadt>.js   eine Datei pro Stadt mit den Startups
scripts/pruefe-daten.mjs  prüft die Daten auf Pflichtfelder, Links, Dubletten und den Prüfstatus
```

## Neue Stadt hinzufügen

1. Eine bestehende Datei kopieren, z. B. `data/staedte/koeln.js` nach `data/staedte/dortmund.js`.
2. `id` (klein, ohne Umlaute, z. B. `dortmund`), `name`, `beschreibung`, `hinweis` und `quellen` anpassen
   und die Startups eintragen.
3. In `index.html` direkt unter den anderen Städte-Dateien eine Zeile ergänzen:
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
  // id: 'beispiel',              // optional: fester Schlüssel für den Prüfstatus (sonst aus dem Namen abgeleitet)
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
