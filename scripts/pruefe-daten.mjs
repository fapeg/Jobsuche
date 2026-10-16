#!/usr/bin/env node
/*
 * Prüft die Datendateien, die index.html lädt, auf Pflichtfelder, gültige Kategorien,
 * https-Links und doppelte Einträge.  Aufruf:  node scripts/pruefe-daten.mjs
 * Keine Abhängigkeiten nötig.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(wurzel, 'index.html'), 'utf8');
const datenSkripte = [...html.matchAll(/<script src="(data\/[^"]+\.js)"><\/script>/g)].map((treffer) => treffer[1]);

const kontext = vm.createContext({ window: {} });
for (const pfad of datenSkripte) {
  vm.runInContext(readFileSync(join(wurzel, pfad), 'utf8'), kontext, { filename: pfad });
}

const kategorien = kontext.window.STARTUP_KATEGORIEN ?? {};
const staedte = kontext.window.STARTUP_STAEDTE ?? [];
const fehler = [];
const aktuellesJahr = new Date().getFullYear();

const istText = (wert) => typeof wert === 'string' && wert.trim() !== '';

function pruefeUrl(wert, ort, optional) {
  if (wert === null && optional) return;
  try {
    if (new URL(wert).protocol !== 'https:') fehler.push(`${ort}: Link muss mit https:// beginnen (${wert})`);
  } catch {
    fehler.push(`${ort}: ungültiger Link (${wert})`);
  }
}

if (Object.keys(kategorien).length === 0) fehler.push('Keine Kategorien gefunden (data/kategorien.js geladen?)');
if (staedte.length === 0) fehler.push('Keine Städte gefunden');

const stadtIds = new Set();
for (const stadt of staedte) {
  const ort = `Stadt "${stadt.name ?? stadt.id}"`;
  if (!/^[a-z0-9-]+$/.test(stadt.id ?? '')) fehler.push(`${ort}: id muss aus Kleinbuchstaben, Ziffern und - bestehen`);
  if (stadtIds.has(stadt.id)) fehler.push(`${ort}: id "${stadt.id}" ist doppelt`);
  stadtIds.add(stadt.id);
  if (!istText(stadt.name)) fehler.push(`${ort}: name fehlt`);
  if (!istText(stadt.beschreibung)) fehler.push(`${ort}: beschreibung fehlt`);
  if (!Array.isArray(stadt.quellen)) fehler.push(`${ort}: quellen muss eine Liste sein`);
  for (const quelle of stadt.quellen ?? []) {
    if (!istText(quelle.titel)) fehler.push(`${ort}: Quelle ohne titel`);
    pruefeUrl(quelle.url, `${ort}, Quelle "${quelle.titel}"`, false);
  }
  if (!Array.isArray(stadt.startups) || stadt.startups.length === 0) {
    fehler.push(`${ort}: startups fehlt oder ist leer`);
    continue;
  }

  const namen = new Set();
  for (const startup of stadt.startups) {
    const sOrt = `${stadt.name} / "${startup.name}"`;
    if (!istText(startup.name)) fehler.push(`${sOrt}: name fehlt`);
    if (namen.has(startup.name)) fehler.push(`${sOrt}: doppelt in dieser Stadt`);
    namen.add(startup.name);
    if (!kategorien[startup.kategorie]) fehler.push(`${sOrt}: unbekannte kategorie "${startup.kategorie}"`);
    if (!istText(startup.branche)) fehler.push(`${sOrt}: branche fehlt`);
    if (!istText(startup.beschreibung)) fehler.push(`${sOrt}: beschreibung fehlt`);
    const jahr = startup.gegruendet;
    if (jahr !== null && !(Number.isInteger(jahr) && jahr >= 1950 && jahr <= aktuellesJahr)) {
      fehler.push(`${sOrt}: gegruendet muss eine Jahreszahl oder null sein`);
    }
    pruefeUrl(startup.website, `${sOrt}, website`, true);
    pruefeUrl(startup.karriere, `${sOrt}, karriere`, true);
    if (startup.karriere === null && !istText(startup.karriereHinweis)) {
      fehler.push(`${sOrt}: ohne Karriereseite bitte karriereHinweis angeben`);
    }
  }
}

for (const stadt of staedte) console.log(`${stadt.name}: ${stadt.startups?.length ?? 0} Startups`);

if (fehler.length > 0) {
  console.error(`\n${fehler.length} Fehler:\n- ${fehler.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAlle Daten sind gültig.');
