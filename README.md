# Ab ins Beet Spielestand

Eine kleine Vue- und Vuetify-Webapp zum Zählen der Punkte für das Spiel **Ab ins Beet**.

## Funktionen

- Komplette Partie über 3 Durchgänge
- Flexible Spieleranzahl ab 2 Spielern
- Automatische Beetwertung nach Farben, ganzen Salaten, halben Salaten, Tomaten und Paprika
- Automatische Bonuspunkte pro Durchgang
- Manuelle Eingabe erfüllter Tierkarten
- Zwischenstand, Endstand und Podestseite mit Siegerehrung
- Speicherung der laufenden Partie im Browser per `localStorage`
- GitHub-Pages-Deployment per GitHub Actions

## Entwicklung

```bash
npm install
npm run dev
```

Die App läuft lokal unter `http://localhost:5173/`.

## Checks

```bash
npm test
npm run build
```

## Deployment

Das Repository enthält einen GitHub-Actions-Workflow unter `.github/workflows/deploy.yml`.

Für GitHub Pages in den Repository-Einstellungen `Settings > Pages > Source` auf **GitHub Actions** setzen. Jeder Push auf `main` baut die App, führt Tests aus und deployed den Inhalt aus `dist/`.
