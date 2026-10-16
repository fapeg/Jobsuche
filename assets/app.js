/*
 * Baut die Startup-Liste aus window.STARTUP_STAEDTE und window.STARTUP_KATEGORIEN
 * (siehe data/) auf und kümmert sich um Städte-Auswahl, Branchenfilter, Suche und Sortierung.
 * Der Filterzustand steht im URL-Hash (z. B. #stadt=koeln&branche=energie), damit Links teilbar sind.
 */
(function () {
  'use strict';

  var ALLE = 'alle';
  var STAEDTE = window.STARTUP_STAEDTE || [];
  var KATEGORIEN = window.STARTUP_KATEGORIEN || {};

  var el = {
    intro: document.getElementById('kopf-intro'),
    staedte: document.getElementById('staedte'),
    stadtInfo: document.getElementById('stadt-info'),
    suche: document.getElementById('suche'),
    sortierung: document.getElementById('sortierung'),
    kategorien: document.getElementById('kategorien'),
    treffer: document.getElementById('treffer'),
    liste: document.getElementById('liste'),
    leer: document.getElementById('leer'),
    zuruecksetzen: document.getElementById('zuruecksetzen'),
    quellen: document.getElementById('quellen'),
  };

  var zustand = { stadt: ALLE, branche: ALLE, suche: '', sortierung: 'relevanz' };

  // Alle Startups als flache Liste, jeweils mit Verweis auf ihre Stadt und ihre Position in der Datei.
  var eintraege = [];
  STAEDTE.forEach(function (stadt) {
    stadt.startups.forEach(function (startup, index) {
      eintraege.push({
        startup: startup,
        stadt: stadt,
        rang: index,
        suchtext: normalisiere([
          startup.name,
          startup.branche,
          startup.beschreibung,
          startup.highlights,
          stadt.name,
          kategorieName(startup.kategorie),
        ].join(' ')),
      });
    });
  });

  // ---------- Hilfsfunktionen ----------

  /** Kleinbuchstaben ohne Akzente, damit „koln“ auch „Köln“ findet. */
  function normalisiere(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ß/g, 'ss');
  }

  function kategorieName(schluessel) {
    return KATEGORIEN[schluessel] ? KATEGORIEN[schluessel].name : schluessel;
  }

  function stadtById(id) {
    for (var i = 0; i < STAEDTE.length; i++) {
      if (STAEDTE[i].id === id) return STAEDTE[i];
    }
    return null;
  }

  function erzeuge(tag, klasse, text) {
    var knoten = document.createElement(tag);
    if (klasse) knoten.className = klasse;
    if (text !== undefined && text !== null) knoten.textContent = text;
    return knoten;
  }

  function externerLink(href, text, klasse) {
    var link = erzeuge('a', klasse);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(text + ' ');
    link.appendChild(erzeuge('span', 'knopf__pfeil', '↗')).setAttribute('aria-hidden', 'true');
    link.appendChild(erzeuge('span', 'sr-only', '(öffnet in neuem Tab)'));
    return link;
  }

  function anzahlText(anzahl) {
    return anzahl === 1 ? '1 Startup' : anzahl + ' Startups';
  }

  function aufzaehlung(namen) {
    if (namen.length <= 1) return namen.join('');
    return namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
  }

  // ---------- URL-Hash <-> Zustand ----------

  function zustandAusHash() {
    var parameter = new URLSearchParams(window.location.hash.slice(1));
    var stadt = parameter.get('stadt');
    var branche = parameter.get('branche');
    var sortierung = parameter.get('sortierung');

    zustand.stadt = stadt && stadtById(stadt) ? stadt : ALLE;
    zustand.branche = branche && KATEGORIEN[branche] ? branche : ALLE;
    zustand.suche = parameter.get('suche') || '';
    zustand.sortierung = sortierung && el.sortierung.querySelector('option[value="' + sortierung + '"]') ? sortierung : 'relevanz';

    el.suche.value = zustand.suche;
    el.sortierung.value = zustand.sortierung;
  }

  function hashAusZustand() {
    var parameter = new URLSearchParams();
    if (zustand.stadt !== ALLE) parameter.set('stadt', zustand.stadt);
    if (zustand.branche !== ALLE) parameter.set('branche', zustand.branche);
    if (zustand.suche) parameter.set('suche', zustand.suche);
    if (zustand.sortierung !== 'relevanz') parameter.set('sortierung', zustand.sortierung);

    var hash = parameter.toString();
    var url = window.location.pathname + window.location.search + (hash ? '#' + hash : '');
    window.history.replaceState(null, '', url);
  }

  // ---------- Darstellung ----------

  function zeichneStaedte() {
    el.staedte.replaceChildren();
    var optionen = [{ id: ALLE, name: 'Alle Städte', anzahl: eintraege.length }].concat(
      STAEDTE.map(function (stadt) {
        return { id: stadt.id, name: stadt.name, anzahl: stadt.startups.length };
      })
    );

    optionen.forEach(function (option) {
      var knopf = erzeuge('button', 'stadt-knopf');
      knopf.type = 'button';
      knopf.setAttribute('aria-pressed', String(zustand.stadt === option.id));
      knopf.append(option.name);
      knopf.appendChild(erzeuge('span', 'stadt-knopf__anzahl', String(option.anzahl)));
      knopf.addEventListener('click', function () {
        zustand.stadt = option.id;
        // Branchenfilter verwerfen, wenn es die Branche in der neuen Stadt nicht gibt.
        var brancheVorhanden = eintraege.some(function (eintrag) {
          return (option.id === ALLE || eintrag.stadt.id === option.id) && eintrag.startup.kategorie === zustand.branche;
        });
        if (!brancheVorhanden) zustand.branche = ALLE;
        aktualisiere();
      });
      el.staedte.appendChild(knopf);
    });
  }

  function zeichneStadtInfo(stadt) {
    el.stadtInfo.replaceChildren();
    if (!stadt) return;

    el.stadtInfo.appendChild(erzeuge('h2', 'stadt-info__titel', 'Startup-Szene ' + stadt.name));
    el.stadtInfo.appendChild(erzeuge('p', null, stadt.beschreibung));
    if (stadt.hinweis) {
      el.stadtInfo.appendChild(erzeuge('p', 'stadt-info__hinweis', stadt.hinweis));
    }
  }

  function zeichneKategorien(basis) {
    // Nur Branchen anzeigen, die es in der gewählten Stadt (und zur Suche passend) gibt.
    var anzahlen = {};
    basis.forEach(function (eintrag) {
      var kategorie = eintrag.startup.kategorie;
      anzahlen[kategorie] = (anzahlen[kategorie] || 0) + 1;
    });

    el.kategorien.replaceChildren();
    var optionen = [{ id: ALLE, name: 'Alle Branchen', anzahl: basis.length }];
    Object.keys(KATEGORIEN).forEach(function (schluessel) {
      if (anzahlen[schluessel] || zustand.branche === schluessel) {
        optionen.push({ id: schluessel, name: KATEGORIEN[schluessel].name, anzahl: anzahlen[schluessel] || 0 });
      }
    });

    optionen.forEach(function (option) {
      var chip = erzeuge('button', 'chip');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(zustand.branche === option.id));
      if (option.id !== ALLE) {
        chip.dataset.kategorie = option.id;
        chip.appendChild(erzeuge('span', 'chip__punkt')).setAttribute('aria-hidden', 'true');
      }
      chip.append(option.name + ' ');
      chip.appendChild(erzeuge('span', 'chip__anzahl', String(option.anzahl)));
      chip.addEventListener('click', function () {
        zustand.branche = option.id;
        aktualisiere();
      });
      el.kategorien.appendChild(chip);
    });

    // Auf dem Handy scrollt die Chip-Leiste horizontal: aktiven Chip sichtbar halten.
    var aktiv = el.kategorien.querySelector('[aria-pressed="true"]');
    if (aktiv && el.kategorien.scrollWidth > el.kategorien.clientWidth) {
      var links = aktiv.offsetLeft - el.kategorien.offsetLeft;
      var rechts = links + aktiv.offsetWidth;
      var sichtbarRechts = el.kategorien.scrollLeft + el.kategorien.clientWidth;
      if (links < el.kategorien.scrollLeft || rechts > sichtbarRechts) {
        el.kategorien.scrollLeft = links - 16;
      }
    }
  }

  function zeichneKarte(eintrag, mitStadt) {
    var s = eintrag.startup;
    var karte = erzeuge('li', 'karte');
    karte.dataset.kategorie = s.kategorie;

    var kopf = erzeuge('div', 'karte__kopf');
    kopf.appendChild(erzeuge('h3', 'karte__name', s.name));
    if (mitStadt) kopf.appendChild(erzeuge('span', 'karte__stadt', eintrag.stadt.name));
    karte.appendChild(kopf);

    var meta = erzeuge('p', 'karte__meta');
    meta.appendChild(erzeuge('span', 'badge', kategorieName(s.kategorie)));
    if (s.branche) meta.appendChild(erzeuge('span', null, s.branche));
    if (s.gegruendet) meta.appendChild(erzeuge('span', null, 'gegr. ' + s.gegruendet));
    karte.appendChild(meta);

    karte.appendChild(erzeuge('p', 'karte__text', s.beschreibung));
    if (s.highlights) karte.appendChild(erzeuge('p', 'karte__highlights', s.highlights));
    if (s.hinweis) karte.appendChild(erzeuge('p', 'karte__hinweis', s.hinweis));

    var aktionen = erzeuge('div', 'karte__aktionen');
    if (s.karriere) {
      aktionen.appendChild(externerLink(s.karriere, 'Karriereseite', 'knopf knopf--primaer'));
    } else {
      // Ohne bekannte Karriereseite: Websuche nach Jobs als Ausweg.
      var suchUrl = 'https://www.google.com/search?q=' + encodeURIComponent('"' + s.name + '" ' + eintrag.stadt.name + ' Jobs');
      aktionen.appendChild(externerLink(suchUrl, 'Jobs suchen', 'knopf knopf--primaer'));
    }
    if (s.website) aktionen.appendChild(externerLink(s.website, 'Website', 'knopf'));
    karte.appendChild(aktionen);

    if (s.karriereHinweis) karte.appendChild(erzeuge('p', 'karte__karriere-hinweis', s.karriereHinweis));

    return karte;
  }

  function sortiere(liste) {
    var kopie = liste.slice();
    var nachName = function (a, b) {
      return a.startup.name.localeCompare(b.startup.name, 'de', { sensitivity: 'base' });
    };

    if (zustand.sortierung === 'name') {
      kopie.sort(nachName);
    } else if (zustand.sortierung === 'jung' || zustand.sortierung === 'alt') {
      var richtung = zustand.sortierung === 'jung' ? -1 : 1;
      kopie.sort(function (a, b) {
        var jahrA = a.startup.gegruendet;
        var jahrB = b.startup.gegruendet;
        if (!jahrA && !jahrB) return nachName(a, b);
        if (!jahrA) return 1; // ohne Gründungsjahr immer ans Ende
        if (!jahrB) return -1;
        return (jahrA - jahrB) * richtung || nachName(a, b);
      });
    }
    // 'relevanz': Reihenfolge wie in den Datendateien (Städte in Tab-Reihenfolge).
    return kopie;
  }

  function zeichneQuellen(stadt) {
    el.quellen.replaceChildren();
    var staedte = stadt ? [stadt] : STAEDTE;
    staedte.forEach(function (eintrag) {
      (eintrag.quellen || []).forEach(function (quelle) {
        var punkt = erzeuge('li');
        var link = erzeuge('a', null, (stadt ? '' : eintrag.name + ': ') + quelle.titel);
        link.href = quelle.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        punkt.appendChild(link);
        el.quellen.appendChild(punkt);
      });
    });
  }

  function aktualisiere() {
    var stadt = zustand.stadt === ALLE ? null : stadtById(zustand.stadt);
    var suchbegriffe = normalisiere(zustand.suche).split(/\s+/).filter(Boolean);

    var inStadt = eintraege.filter(function (eintrag) {
      return !stadt || eintrag.stadt === stadt;
    });
    var passendZurSuche = inStadt.filter(function (eintrag) {
      return suchbegriffe.every(function (begriff) {
        return eintrag.suchtext.indexOf(begriff) !== -1;
      });
    });
    var sichtbar = sortiere(passendZurSuche.filter(function (eintrag) {
      return zustand.branche === ALLE || eintrag.startup.kategorie === zustand.branche;
    }));

    zeichneStaedte();
    zeichneStadtInfo(stadt);
    zeichneKategorien(passendZurSuche);
    zeichneQuellen(stadt);

    el.liste.replaceChildren();
    var fragment = document.createDocumentFragment();
    sichtbar.forEach(function (eintrag) {
      fragment.appendChild(zeichneKarte(eintrag, !stadt));
    });
    el.liste.appendChild(fragment);

    var ort = stadt ? ' in ' + stadt.name : '';
    el.treffer.textContent = sichtbar.length === inStadt.length
      ? anzahlText(sichtbar.length) + ort
      : sichtbar.length + ' von ' + anzahlText(inStadt.length) + ort;
    el.leer.hidden = sichtbar.length > 0;

    hashAusZustand();
  }

  // ---------- Start ----------

  el.intro.textContent = 'Ausgewählte Startups aus ' + aufzaehlung(STAEDTE.map(function (s) { return s.name; })) +
    ' – mit Kurzprofil und direktem Link zur Karriereseite.';

  var suchVerzoegerung;
  el.suche.addEventListener('input', function () {
    window.clearTimeout(suchVerzoegerung);
    suchVerzoegerung = window.setTimeout(function () {
      zustand.suche = el.suche.value.trim();
      aktualisiere();
    }, 120);
  });

  el.sortierung.addEventListener('change', function () {
    zustand.sortierung = el.sortierung.value;
    aktualisiere();
  });

  el.zuruecksetzen.addEventListener('click', function () {
    zustand.branche = ALLE;
    zustand.suche = '';
    el.suche.value = '';
    aktualisiere();
  });

  window.addEventListener('hashchange', function () {
    zustandAusHash();
    aktualisiere();
  });

  zustandAusHash();
  aktualisiere();
})();
