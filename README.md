# walkby-app

WalkBy ist eine interaktive Progressive Web App, mit der Benutzer ortsbasierte, multimediale Geschichten erstellen und entdecken können. Lade Bilder, Videos oder Audio-Clips hoch, platziere sie an einem Ort auf der Karte und teile deine Geschichte mit anderen.

Folge diesem Link für die **➡️ Live-Demo:** [**extraordinary-caramel-d5019a.netlify.app**](https://extraordinary-caramel-d5019a.netlify.app/)

## Features

-   **Medien-Upload**: Erstelle Projekte mit bis zu 5 Medien-Clips (Bilder, Videos, Audio).
-   **Interaktive Karte**: Entdecke Projekte von anderen Nutzern in deiner Umgebung auf einer Leaflet-basierten Karte.
-   **Projekt-Modi**: Erstelle ein "Solo-Projekt" oder ein "Collab-Projekt", bei dem andere mitmachen können.
-   **Benutzer-Authentifizierung**: Sicherer Login und Registrierung über Supabase, inklusive Profilbild-Upload.
-   **Drag & Drop**: Sortiere deine Medien-Clips einfach per Drag & Drop im Filmstreifen-Editor.
-   **Kino-Modus**: Spiele Medien-Clips in einem immersiven Playback-Modus mit Ambilight-Effekt ab.

## Verwendete Technologien

-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
-   **Backend & Datenbank**: [Supabase](https://supabase.io/) (Authentifizierung, Datenbank, Storage)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/) für das UI-Design.
-   **Karten**: [Leaflet.js](https://leafletjs.com/) zur Darstellung der interaktiven Karte.
-   **Geocoding**: [Nominatim (OpenStreetMap)](https://nominatim.org/) zur Adresssuche.

## Setup

### Klonen des Repositories

Um das Projekt lokal auszuführen, befolge diese Schritte:

1.  **Klone das Repository:**
    ```bash
    git clone [https://github.com/whiskyboi/walkby-app.git](https://github.com/whiskyboi/walkby-app.git)
    cd walkby-app
    ```

2.  **Starte einen lokalen Webserver:**
    Am einfachsten geht das mit `npx` (Teil von Node.js):
    ```bash
    npx serve

3.  **Öffne die Anwendung im Browser:**
    Öffne die Adresse, die der Server anzeigt (z. B. `http://localhost:3000` oder `http://localhost:8000`).

## Lizenz

Dieses Projekt ist unter der **MIT License** lizenziert. Siehe die [LICENSE](LICENSE)-Datei für weitere Details.