# Jenseits-App

Inoffizielle Demo-Hülle zum YouTube-Kanal „Einblicke-ins-Jenseits“.
Die Seite gehört nicht zum Kanal und kommt nicht von den Menschen, die ihn betreiben.
Kein Server, keine Analyse, keine Fernaufrufe. Kein medizinischer Rat.

Dieser Stand ist nur **Splash + Hülle**. Fragebogen, Teilen per E-Mail und die Nähe-Demo sind leere Platzhalter. Ton ist in diesem Stand nicht dabei.

## Lokal öffnen

1. Ordner behalten (`index.html`, `css/`, `js/`, `version.txt` zusammen).
2. `index.html` im Browser öffnen (Doppelklick, `file://` reicht — die App lädt nichts aus dem Netz).
3. Der Splash kommt bei jedem Start. Eine gespeicherte Sprache ist vorausgewählt; eine andere Flagge ändert sie. Die Wahl liegt in `localStorage` unter `jenseits.v1`.
4. Eine Flagge übernimmt die Sprache und öffnet die Hülle. Tippen oder eine Taste überspringt den Splash mit der vorausgewählten Sprache. Kein automatisches Weiter. Die Sprache lässt sich danach in der Kopfzeile und unter Info wechseln.

## Live-URL

Cache-Bust jedes Pushs, aktuell `?v=3`:

https://raw.githack.com/RobertBoettcherSF/Jenseits-App/main/index.html?v=3

Muster: `https://raw.githack.com/RobertBoettcherSF/Jenseits-App/main/index.html?v=N`

Stempel und `version.txt` tragen dieselbe Zeichenkette. Prüfung: `VERSIONING_GIST_GITHACK.md`.
Diese README behauptet nicht, dass der CDN-Cache schon den neuen Stand ausliefert.

## Soft-AC (Splash + Hülle)

1. Splash: obere Hälfte eines Dipol-Feldes als Tunnel (Canvas, weiße/creme Linien auf Schwarz, Licht am Fluchtpunkt). Kein WASM, keine untere Spiegelhälfte. Unten App-Name und der feste Versionsstempel.
2. `prefers-reduced-motion: reduce` zeigt ein Standbild der Ringe, ohne Animation. Der Splash erscheint bei jedem Start.
3. Sprachen DE / EN / FR. DE und EN vollständig, FR mit allen Schlüsseln (kurz).
4. Sichtbarer Hinweis: inoffizielle Demo, nicht der Kanal. Auf dem Splash und unter Info.
5. Danach vier senkrechte Bereiche: Erlebnis, Teilen, Nähe (Demo), Info. Die drei ersten sind Platzhalter („kommt als Nächstes“).
6. Heller Versionsstempel auf jedem Schirm. Format `v0.1.2-tunnel bYYYYMMDD-HHMM <kurzsha>`. Dieselbe Zeile in `version.txt`.
7. Debug-Zeile immer sichtbar (`Debug · F9`, Sprache, Viewport-Breite, `reduced-motion: yes/no`). F9 öffnet den Bericht. „Bericht speichern“ schreibt eine Text/JSON-Datei nur mit technischen Feldern (`appVersion`, `lang`, `ua`, `screen`, `reducedMotion`, …). Keine Erlebnis-Inhalte.
8. Hilfe-Leiste immer sichtbar: Telefonseelsorge 0800 111 0 111 und 0800 111 0 222, Notruf 112. Hinweis, keine Beratung.
9. Sicherung: JSON-Export und -Import nur für Sprache und zuletzt geöffneten Bereich, `localStorage` in `try/catch`.

## Version

`v0.1.2-tunnel b20261031-1752 f7b4abc`

Dieselbe Zeile steht in `version.txt` und im sichtbaren Stempel.
