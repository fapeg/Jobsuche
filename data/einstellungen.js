/*
 * Speicherort für den Prüfstatus („geprüft“-Markierungen).
 * Die Markierungen liegen als JSON-Datei in diesem GitHub-Repository und werden über die GitHub-API
 * gelesen und geschrieben – so sind sie auf allen Geräten gleich. Zum Schreiben braucht jedes Gerät
 * einmalig einen GitHub-Token (Einrichtung über „Sync einrichten“ auf der Seite, siehe README.md).
 */
window.JOBSUCHE_SYNC = {
  owner: 'fapeg',
  repo: 'Jobsuche',
  branch: 'main',
  datei: 'data/geprueft.json',
};
