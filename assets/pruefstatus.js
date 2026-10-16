/*
 * Prüfstatus: merkt sich, welche Startups als „geprüft“ markiert sind, und synchronisiert das
 * über die Datei data/geprueft.json im GitHub-Repository (Konfiguration: data/einstellungen.js).
 *
 * - Lesen klappt ohne Anmeldung (öffentliches Repository).
 * - Schreiben braucht einen GitHub-Token mit „Contents: Read and write“; er liegt nur im Browser (localStorage).
 * - Ohne Token (oder offline) werden Änderungen lokal vorgemerkt und beim nächsten Sync nachgereicht.
 *
 * Schnittstelle für assets/app.js: window.Pruefstatus (siehe unten).
 */
(function () {
  'use strict';

  var KONFIG = window.JOBSUCHE_SYNC || null;
  var API = 'https://api.github.com';
  var SPEICHER = {
    stand: 'jobsuche.geprueft',
    ausstehend: 'jobsuche.geprueft.ausstehend',
    token: 'jobsuche.github-token',
  };
  var SPEICHER_VERZOEGERUNG = 800; // ms – mehrere Klicks kurz hintereinander landen in einem Commit

  var geprueft = lies(SPEICHER.stand) || {}; // Schlüssel -> Datum (JJJJ-MM-TT), inkl. eigener Änderungen
  var ausstehend = lies(SPEICHER.ausstehend) || {}; // noch nicht gespeicherte Änderungen: Schlüssel -> Datum | null
  var token = liesText(SPEICHER.token);
  var namen = {}; // Schlüssel -> Anzeigename, nur für Commit-Nachrichten
  var modus = KONFIG ? 'laedt' : 'lokal'; // laedt | synchron | speichert | lokal | fehler
  var meldung = '';
  var beobachter = [];
  var speichertGerade = false;
  var speicherTimer = null;

  // ---------- localStorage (kann in privaten Fenstern fehlen) ----------

  function lies(schluessel) {
    try {
      return JSON.parse(window.localStorage.getItem(schluessel));
    } catch (fehler) {
      return null;
    }
  }

  function liesText(schluessel) {
    try {
      return window.localStorage.getItem(schluessel) || '';
    } catch (fehler) {
      return '';
    }
  }

  function schreibe(schluessel, wert) {
    try {
      if (wert === null) window.localStorage.removeItem(schluessel);
      else window.localStorage.setItem(schluessel, typeof wert === 'string' ? wert : JSON.stringify(wert));
    } catch (fehler) {
      // Ohne localStorage bleibt der Stand nur bis zum Neuladen erhalten.
    }
  }

  function sichereLokal() {
    schreibe(SPEICHER.stand, geprueft);
    schreibe(SPEICHER.ausstehend, ausstehend);
  }

  // ---------- Hilfsfunktionen ----------

  function heute() {
    var d = new Date();
    var zweistellig = function (zahl) { return String(zahl).padStart(2, '0'); };
    return d.getFullYear() + '-' + zweistellig(d.getMonth() + 1) + '-' + zweistellig(d.getDate());
  }

  function wendeAn(basis, aenderungen) {
    var ergebnis = Object.assign({}, basis);
    Object.keys(aenderungen).forEach(function (schluessel) {
      if (aenderungen[schluessel]) ergebnis[schluessel] = aenderungen[schluessel];
      else delete ergebnis[schluessel];
    });
    return ergebnis;
  }

  function alsJson(daten) {
    var sortiert = {};
    Object.keys(daten).sort().forEach(function (schluessel) { sortiert[schluessel] = daten[schluessel]; });
    return JSON.stringify({ geprueft: sortiert }, null, 2) + '\n';
  }

  function kodiere(text) {
    var binaer = '';
    new TextEncoder().encode(text).forEach(function (byte) { binaer += String.fromCharCode(byte); });
    return window.btoa(binaer);
  }

  function dekodiere(base64) {
    var binaer = window.atob(base64.replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(binaer, function (zeichen) { return zeichen.charCodeAt(0); }));
  }

  function setzeModus(neuerModus, neueMeldung) {
    modus = neuerModus;
    meldung = neueMeldung || '';
    beobachter.forEach(function (rueckruf) { rueckruf(); });
  }

  function kopfzeilen(mitToken) {
    var kopf = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (mitToken) kopf.Authorization = 'Bearer ' + mitToken;
    return kopf;
  }

  function dateiUrl() {
    return API + '/repos/' + KONFIG.owner + '/' + KONFIG.repo + '/contents/' + KONFIG.datei;
  }

  function fehlerText(status) {
    if (status === 401) return 'GitHub-Token ungültig oder abgelaufen.';
    if (status === 403 || status === 404) return 'Der Token darf in diesem Repository nicht schreiben (Contents: Read and write nötig).';
    return 'GitHub antwortet mit Fehler ' + status + '.';
  }

  function commitNachricht(aenderungen) {
    var teile = Object.keys(aenderungen).map(function (schluessel) {
      return (aenderungen[schluessel] ? '✓ ' : '✗ ') + (namen[schluessel] || schluessel);
    });
    if (teile.length > 4) return 'Prüfstatus aktualisiert (' + teile.length + ' Änderungen)';
    return 'Prüfstatus: ' + teile.join(', ');
  }

  // ---------- GitHub ----------

  async function ladeRemote(mitToken) {
    // no-store + Zeitstempel: Die API-Antworten sind sonst bis zu 60 s gecacht.
    var antwort = await fetch(dateiUrl() + '?ref=' + encodeURIComponent(KONFIG.branch) + '&t=' + Date.now(), {
      headers: kopfzeilen(mitToken),
      cache: 'no-store',
    });
    if (antwort.status === 404) return { daten: {}, sha: null }; // Datei gibt es noch nicht – wird beim ersten Speichern angelegt
    if (!antwort.ok) throw new Error(fehlerText(antwort.status));
    var json = await antwort.json();
    var inhalt = JSON.parse(dekodiere(json.content || '') || '{}');
    return { daten: (inhalt && inhalt.geprueft) || {}, sha: json.sha };
  }

  /** Holt den Stand aus GitHub, legt lokale Änderungen darüber und speichert sie, falls ein Token da ist. */
  async function synchronisiere() {
    if (!KONFIG) return;
    if (speichertGerade) return;
    setzeModus('laedt');
    try {
      var remote = await ladeRemote(token);
      geprueft = wendeAn(remote.daten, ausstehend);
      sichereLokal();
      if (Object.keys(ausstehend).length > 0 && token) {
        await speichere();
      } else {
        setzeModus(Object.keys(ausstehend).length > 0 ? 'lokal' : 'synchron');
      }
    } catch (fehler) {
      setzeModus('fehler', fehler instanceof TypeError ? 'Keine Verbindung zu GitHub.' : fehler.message);
    }
  }

  /** Schreibt alle vorgemerkten Änderungen ins Repository (bei Bedarf in mehreren Commits). */
  async function speichere() {
    window.clearTimeout(speicherTimer);
    speicherTimer = null;
    if (!KONFIG || !token || speichertGerade) return;

    speichertGerade = true;
    try {
      // Klicks während des Speicherns landen in "ausstehend" und werden in der nächsten Runde mitgenommen.
      while (Object.keys(ausstehend).length > 0) {
        setzeModus('speichert');
        await speicherePaket();
      }
      setzeModus('synchron');
    } catch (fehler) {
      setzeModus('fehler', fehler instanceof TypeError ? 'Keine Verbindung zu GitHub.' : fehler.message);
    } finally {
      speichertGerade = false;
    }
  }

  async function speicherePaket() {
    for (var versuch = 0; versuch < 3; versuch++) {
      var paket = Object.assign({}, ausstehend);
      var remote = await ladeRemote(token);
      var neu = wendeAn(remote.daten, paket);

      if (alsJson(neu) !== alsJson(remote.daten)) {
        var antwort = await fetch(dateiUrl(), {
          method: 'PUT',
          headers: Object.assign(kopfzeilen(token), { 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            message: commitNachricht(paket),
            content: kodiere(alsJson(neu)),
            sha: remote.sha || undefined,
            branch: KONFIG.branch,
          }),
        });
        // 409/422: Die Datei wurde zwischenzeitlich (z. B. auf einem anderen Gerät) geändert – neu laden und erneut versuchen.
        if (antwort.status === 409 || antwort.status === 422) continue;
        if (!antwort.ok) throw new Error(fehlerText(antwort.status));
      }

      // Nur die Änderungen abhaken, die in diesem Commit steckten; neue Klicks bleiben vorgemerkt.
      Object.keys(paket).forEach(function (schluessel) {
        if (ausstehend[schluessel] === paket[schluessel]) delete ausstehend[schluessel];
      });
      geprueft = wendeAn(neu, ausstehend);
      sichereLokal();
      return;
    }
    throw new Error('Speichern ist mehrfach an gleichzeitigen Änderungen gescheitert – bitte erneut versuchen.');
  }

  // ---------- Öffentliche Schnittstelle ----------

  function setze(schluessel, istGeprueft, anzeigename) {
    var wert = istGeprueft ? heute() : null;
    namen[schluessel] = anzeigename || schluessel;
    ausstehend[schluessel] = wert;
    var aenderung = {};
    aenderung[schluessel] = wert;
    geprueft = wendeAn(geprueft, aenderung);
    sichereLokal();

    if (KONFIG && token) {
      window.clearTimeout(speicherTimer);
      speicherTimer = window.setTimeout(speichere, SPEICHER_VERZOEGERUNG);
      setzeModus('speichert');
    } else {
      setzeModus(modus === 'fehler' ? 'fehler' : 'lokal', meldung);
    }
  }

  async function setzeToken(neuerToken) {
    neuerToken = String(neuerToken || '').trim();
    if (!neuerToken) throw new Error('Bitte einen Token einfügen.');
    // Token vorab prüfen (Lesezugriff); fehlende Schreibrechte fallen beim ersten Speichern auf.
    await ladeRemote(neuerToken).catch(function (fehler) {
      throw fehler instanceof TypeError ? new Error('Keine Verbindung zu GitHub.') : fehler;
    });
    token = neuerToken;
    schreibe(SPEICHER.token, token);
    await synchronisiere();
  }

  function entferneToken() {
    token = '';
    schreibe(SPEICHER.token, null);
    return synchronisiere();
  }

  window.Pruefstatus = {
    /** Datum (JJJJ-MM-TT), an dem das Startup als geprüft markiert wurde – oder null. */
    datum: function (schluessel) { return geprueft[schluessel] || null; },
    setze: setze,
    setzeToken: setzeToken,
    entferneToken: entferneToken,
    synchronisiere: synchronisiere,
    beobachte: function (rueckruf) { beobachter.push(rueckruf); },
    zustand: function () {
      return {
        modus: modus,
        meldung: meldung,
        konfiguriert: !!KONFIG,
        hatToken: !!token,
        ausstehend: Object.keys(ausstehend).length,
        repo: KONFIG ? KONFIG.owner + '/' + KONFIG.repo : '',
        datei: KONFIG ? KONFIG.datei : '',
      };
    },
  };

  // Beim Zurückkehren zur Seite (z. B. Tab-Wechsel am Handy) frischen Stand holen,
  // beim Verlassen vorgemerkte Änderungen sofort speichern.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && speicherTimer) speichere();
    if (document.visibilityState === 'visible' && !speicherTimer) synchronisiere();
  });

  synchronisiere();
})();
