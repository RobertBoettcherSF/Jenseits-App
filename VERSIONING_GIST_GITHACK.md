# Versionierung — Jenseits-App

Sichtbar bleiben, sonst wirkt ein Push wie „nichts passiert“. Muster aus dem How-To, hier für dieses Repo (nicht für einen Secret-Gist).

## Regeln

1. Der Stempel steht auf **jedem** Schirm (Splash und Hülle), fest in der Ecke, hell, `z-index: 99999`, `pointer-events: none`. Er steht schon als Text in `index.html`, auch ohne JavaScript.
2. Format: `v0.1.1-splash bYYYYMMDD-HHMM <kurzsha>`.
3. Dieselbe Zeichenkette steht in `version.txt` neben `index.html` (eine Zeile).
4. Jeder Push bekommt eine **neue** Zeichenkette. Dieselbe Version nicht wiederverwenden.
5. Die Live-URL trägt `?v=N`. N bei jedem Push erhöhen.
6. Assets derselben Lieferung tragen dasselbe N: `css/app.css?v=N`, `js/i18n.js?v=N`, `js/app.js?v=N`.
7. Nicht „ist live“ sagen, bevor `version.txt` und der Stempel im HTML **dieselbe** Zeichenkette zeigen. Der CDN-Cache kann Minuten hinterher sein.

## URL

Aktuell N=2:

https://raw.githack.com/RobertBoettcherSF/Jenseits-App/main/index.html?v=2

Muster: `https://raw.githack.com/RobertBoettcherSF/Jenseits-App/main/index.html?v=N`

## Prüfen

1. Rohdatei (GitHub), Stempel aus `version.txt`:

```bash
curl -fsSL "https://raw.githubusercontent.com/RobertBoettcherSF/Jenseits-App/main/version.txt"
```

2. Dieselbe Zeichenkette im HTML auf githack, mit dem neuen N:

```bash
curl -fsSL "https://raw.githack.com/RobertBoettcherSF/Jenseits-App/main/index.html?v=2" | grep -F "v0.1.1-splash"
```

3. Stimmen die beiden Texte nicht überein, ist die Lieferung nicht fertig. Ein altes `?v=` zeigt oft den vorigen Stand.
4. Hängt der Tab: schließen und den Link mit dem neuen `?v=N` öffnen.

## Kurz-SHA im Stempel

Der dritte Teil ist der Kurz-SHA, auf dem dieser Stand aufsetzt (Eltern-Commit des Release-Commits). Entscheidend für den Abgleich ist die **ganze** Zeichenkette: HTML-Stempel und `version.txt` zeichenweise gleich.
