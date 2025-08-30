# walkby-app

Walkby ist eine interaktive Web-Anwendung, mit der Benutzer ortsbasierte, multimediale Geschichten – sogenannte "Walkbys" – erstellen und entdecken können. Lade Bilder, Videos oder Audio-Clips hoch, platziere sie an einem Ort auf der Karte und teile deine Geschichte mit anderen.

**➡️ Live-Demo:** [**extraordinary-caramel-d5019a.netlify.app**](https://extraordinary-caramel-d5019a.netlify.app/)

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

Um das Projekt lokal auszuführen, befolge diese Schritte:

1.  **Klone das Repository:**
    ```bash
    git clone [https://github.com/dein-username/walkby-app.git](https://github.com/dein-username/walkby-app.git)
    ```

2.  **Öffne die `index.html`:**
    Da das Projekt keine Build-Schritte benötigt, kannst du die `index.html`-Datei direkt in deinem Webbrowser öffnen, um die Anwendung zu starten.

3.  **Supabase-Konfiguration (Optional):**
    Die App ist mit einem öffentlichen Supabase-Projekt verbunden. Wenn du dein eigenes Backend aufsetzen möchtest, musst du ein neues Projekt bei Supabase erstellen und die URL sowie den `anon key` in der `js/main.js`-Datei ersetzen.

    ```javascript
    const supabaseClient = supabase.createClient(
        'DEINE_SUPABASE_URL',
        'DEIN_SUPABASE_ANON_KEY'
    );
    ```

## Lizenz

Dieses Projekt ist unter der **MIT License** lizenziert. Siehe die [LICENSE](LICENSE)-Datei für weitere Details.