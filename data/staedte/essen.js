/*
 * Startups in Essen – Recherche-Stand: Oktober 2026.
 * Aufbau eines Eintrags: siehe README.md („Neue Stadt hinzufügen“).
 */
(window.STARTUP_STAEDTE = window.STARTUP_STAEDTE || []).push({
  id: 'essen',
  name: 'Essen',
  beschreibung:
    'Die „Energiehauptstadt“ im Ruhrgebiet: rund 171 Startups mit etwa 2.500 Beschäftigten, allein 22 Neugründungen in den letzten zwölf Monaten (EWG). Schwerpunkte sind Energie & Klima sowie Deep Tech rund um das Gründungszentrum BRYCK.',
  hinweis:
    'Die Essener Szene ist kleiner als die in Köln oder Düsseldorf. Die Liste enthält deshalb neben jungen Startups auch einige aus Startups gewachsene Tech-Firmen (z. B. Machineseeker Group, clickworker).',
  quellen: [
    { titel: 'EWG – Start-up-City Essen', url: 'https://www.ewg.de/start-up-essen/' },
    { titel: 'MEO Magazin – 22 neue Start-ups in einem Jahr', url: 'https://www.meomagazin.de/gruendungsstandort-essen-22-neue-start-ups-in-einem-jahr/' },
    { titel: 'UPSCALER by EWG – Start-up Stories', url: 'https://www.startup-essen.de/start-up-stories' },
    { titel: 'Business Metropole Ruhr – Greenlyte', url: 'https://www.business.ruhr/stories/greenlyte-carbon-technologies.html' },
  ],
  startups: [
    {
      name: 'Greenlyte Carbon Technologies',
      kategorie: 'energie',
      branche: 'Direct Air Capture & E-Fuels',
      gegruendet: 2022,
      beschreibung:
        'Filtert CO₂ direkt aus der Luft und erzeugt daraus zusammen mit Wasserstoff synthetische Kraftstoffe („LiquidSolar™“).',
      highlights:
        'Über 45 Mio. € eingesammelt, 70+ Mitarbeitende; erste E-Fuel-Anlage in Duisburg, DAC-to-SAF-Projekt mit dem Düsseldorfer Flughafen.',
      website: 'https://www.greenlyte.tech/',
      karriere: 'https://join.com/companies/greenlyte',
      karriereHinweis: 'Stellen über JOIN; Karrierebereich auch auf greenlyte.tech.',
    },
    {
      name: 'Greenflash',
      kategorie: 'energie',
      branche: 'Energielösungen für Industrie',
      gegruendet: null,
      beschreibung:
        'Plant und baut schlüsselfertige Energiekonzepte für Industrie und Gewerbe – Photovoltaik, Batteriespeicher und Ladeinfrastruktur aus einer Hand.',
      highlights:
        'Nach dem Umzug nach Essen von 5 auf 80+ Mitarbeitende gewachsen (BRYCK); Standorte Essen und Lingen, viele offene Stellen in Engineering, Vertrieb und Software.',
      website: 'https://greenflash.de/',
      karriere: 'https://greenflash.de/jobs/',
    },
    {
      name: 'Staige',
      kategorie: 'software',
      branche: 'Sports-Tech & Edge-KI',
      gegruendet: 2017,
      beschreibung:
        'KI-gesteuerte Kamerasysteme und Streaming für den Amateur- und Breitensport, dazu Edge-KI-Videoanalyse (früher „soccerwatch“).',
      highlights:
        'Investoren u. a. Borussia Dortmund; gehört zur adesso-Gruppe. Mehrere Engineering-Stellen in Essen (Edge-KI, Python, Fullstack).',
      website: 'https://staige.com/',
      karriere: 'https://staige.com/mehr/karriere',
    },
    {
      name: 'Machineseeker Group',
      kategorie: 'plattform',
      branche: 'Marktplatz für Gebrauchtmaschinen',
      gegruendet: 1999,
      beschreibung:
        'Betreibt Online-Marktplätze für gebrauchte Maschinen und Nutzfahrzeuge – u. a. Maschinensucher, Machineseeker und TruckScout24.',
      highlights:
        'Aus einem Ein-Personen-Startup zur führenden europäischen Plattform gewachsen; Büro nahe Essen Hbf, rund ein Dutzend offene Stellen.',
      website: 'https://www.maschinensucher.de/',
      karriere: 'https://join.com/companies/maschinensucher',
      karriereHinweis: 'Stellen über JOIN.',
    },
    {
      name: 'clickworker',
      kategorie: 'software',
      branche: 'Crowdworking & KI-Trainingsdaten',
      gegruendet: 2005,
      beschreibung:
        'Crowdworking-Plattform, über die eine weltweite Community Mikro-Aufgaben erledigt – etwa KI-Trainingsdaten, Texte, Umfragen und Sprachaufnahmen.',
      highlights:
        'Europa-Sitz in Essen-Bredeney; im StartupBlink-Ranking die Nr. 1 der Essener Startups.',
      website: 'https://www.clickworker.de/',
      karriere: 'https://www.clickworker.de/ueber-uns/karriere/',
      karriereHinweis: 'Gemeint sind Stellen im Team – nicht die Crowdworking-Aufträge auf der Plattform.',
    },
    {
      name: 'Unigy',
      kategorie: 'energie',
      branche: 'Energiehandel & Energiedaten',
      gegruendet: 2020,
      beschreibung:
        'Algorithmischer Kurzfrist-Energiehandel, Beschaffung und Energiemanagement für Stadtwerke und Energieversorger.',
      highlights:
        'Gründerpreis NRW 2022; Stadtwerke Bochum und Rhönenergie Fulda sind beteiligt. Jobs u. a. Data Science und Werkstudium IT.',
      website: 'https://www.unigy.de/',
      karriere: 'https://www.unigy.de/category/karriere/',
    },
    {
      name: 'ökoloco',
      kategorie: 'energie',
      branche: 'Heizung & Wärmepumpen',
      gegruendet: null,
      beschreibung:
        'Heizungsbauer mit digitalem Vertrieb: Beratung, Austausch und Wartung von Heizungen und Wärmepumpen.',
      highlights:
        'Mehr als 50 Mitarbeitende; eigenes Entwicklungsprogramm vom Monteur zur Teamleitung, auch Vertriebsrollen.',
      website: 'https://oekoloco.de/',
      karriere: 'https://karriere.oekoloco.de/',
    },
    {
      name: 'objego',
      kategorie: 'immobilien',
      branche: 'PropTech-Software',
      gegruendet: 2020,
      beschreibung: 'Software, mit der private Vermieter:innen ihre Immobilien einfach und digital verwalten.',
      highlights: 'Team mit 11–50 Mitarbeitenden; Engineering-Rollen auch remote innerhalb Deutschlands.',
      website: 'https://objego.de/',
      karriere: 'https://jobs.objego.de/',
    },
    {
      name: 'BRYGHT',
      kategorie: 'plattform',
      branche: 'Creator Economy',
      gegruendet: 2024,
      beschreibung:
        'Plattform für Creator, Coaches und digitale Unternehmer:innen mit eigenem Marktplatz, Payment, Memberships und Community-Funktionen.',
      highlights: 'Investment der Axel-Springer-Gruppe (April 2026); Pre-Seed u. a. mit NRW.BANK.',
      website: null,
      karriere: null,
      karriereHinweis: 'Keine eigene Karriereseite gefunden.',
    },
    {
      name: 'Fronyx',
      kategorie: 'hardware',
      branche: 'KI für E-Mobilität',
      gegruendet: 2020,
      beschreibung:
        'Conversational AI für E-Mobility-Anbieter: hilft E-Auto-Fahrer:innen per Chat und Voice bei der Ladesäulensuche und im Support.',
      highlights: 'Investment von Next Mobility Labs; gefördert u. a. von EIT Urban Mobility und BRYCK. Sitz in Rüttenscheid.',
      website: 'https://fronyx.io/',
      karriere: null,
      karriereHinweis: 'Keine eigene Karriereseite gefunden – Initiativbewerbung über die Website.',
    },
    {
      name: 'fasciotens',
      kategorie: 'gesundheit',
      branche: 'Medizintechnik',
      gegruendet: 2016,
      beschreibung:
        'Medizinprodukte für den schonenden Verschluss des offenen Bauchs und großer Hernien durch kontrollierte Faszientraktion.',
      highlights: 'Kleines, international ausgerichtetes MedTech-Team aus Essen.',
      website: 'https://www.fasciotens.com/',
      karriere: 'https://www.fasciotens.com/about-us',
      karriereHinweis: 'Offene Stellen werden auf der „About us“-Seite veröffentlicht.',
    },
    {
      name: 'Nola (MyLetics)',
      kategorie: 'gesundheit',
      branche: 'Digital Health',
      gegruendet: 2017,
      beschreibung:
        'App-basierter Physio-Coach für die 28 häufigsten orthopädischen Beschwerden (Rücken, Nacken, Knie) – CE-zertifiziertes Medizinprodukt.',
      highlights: 'Von einem Essener Physiotherapeuten mitgegründet; wird über Krankenkassen wie die mkk angeboten.',
      website: 'https://www.health-nola.com/',
      karriere: null,
      karriereHinweis: 'Keine eigene Karriereseite gefunden – Kontakt über die Website.',
    },
    {
      name: 'Green Club',
      kategorie: 'konsum',
      branche: 'FoodTech & Lieferdienst',
      gegruendet: null,
      beschreibung:
        'Salat- und Bowl-Lieferdienst mit eigener App, gegründet in Essen als „Pottsalat“ und 2024 mit MaKE zu Green Club fusioniert.',
      highlights: '2025 über einen Insolvenzplan restrukturiert; Expansion seitdem vor allem über Franchise-Standorte.',
      website: 'https://pottsalat.de/',
      karriere: 'https://join.com/companies/pottsalat',
      karriereHinweis: 'Stellen (u. a. Küche, Lieferung, Schichtleitung) über JOIN.',
    },
    {
      name: 'Beautinda',
      kategorie: 'plattform',
      branche: 'Buchungsplattform Beauty',
      gegruendet: 2021,
      beschreibung:
        'Online-Buchungsplattform für Friseur-, Kosmetik- und Nageltermine; kleine Studios bekommen kostenlos eine Online-Präsenz.',
      highlights: 'Team mit 11–20 Mitarbeitenden; regelmäßig Praktika in Sales, Marketing und Social Media.',
      website: 'https://beautinda.de/',
      karriere: 'https://join.com/companies/beautinda',
      karriereHinweis: 'Stellen über JOIN.',
    },
    {
      name: 'Ackerhelden',
      kategorie: 'konsum',
      branche: 'Urban Gardening',
      gegruendet: 2012,
      beschreibung:
        'Vermietet vorbepflanzte Bio-Gemüsegärten und baut Hochbeet-Projekte für Städte, Unternehmen und Gesundheitsprogramme.',
      highlights: 'Deutschlands erster bundesweiter Anbieter bio-zertifizierter Mietgärten.',
      website: 'https://www.ackerhelden.de/',
      karriere: 'https://www.ackerhelden.de/%C3%BCber-uns/jobs/',
    },
  ],
});
