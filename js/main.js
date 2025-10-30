// Registrierung des Service Workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker erfolgreich registriert:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}

const supabaseClient = supabase.createClient(
    'https://bllmfzpmntqhopgwvyhm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbG1menBtbnRxaG9wZ3d2eWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTk5NTcsImV4cCI6MjA3MDgzNTk1N30.cwaUVks55hMCNXw7kkHZ-eaiEElWG4bgVh-I75GFSpo' 
);

const toggleModal = (modal, show) => {
    if (show) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    } else {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

const showToast = (message) => {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.replace('bottom-[-100px]', 'bottom-10');
       setTimeout(() => {
        toast.classList.replace('bottom-10', 'bottom-[-100px]');
    }, 2500);
};

document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        pages: document.querySelectorAll('.page'),
        navButtons: document.querySelectorAll('.floating-nav-item'),
        mediaPage: {
            title: document.getElementById('media-page-title'),
            filmStrip: document.getElementById('film-strip-content'),
            addMediaFrame: document.getElementById('add-media-frame'),
            mediaUploadInput: document.getElementById('mediaUploadInput'),
            actionBtn: document.getElementById('media-page-action-btn'),
            perfTop: document.querySelector('.film-strip-top-perforations'),
            perfBottom: document.querySelector('.film-strip-bottom-perforations'),
        },
        projectsPage: {
            container: document.getElementById('projects-list-container'),
            addNewBtn: document.getElementById('add-new-project-btn'),
        },
        mapPage: {
            mapElement: document.getElementById('map'),
        },
        projectModal: {
            modal: document.getElementById('create-project-modal'),
            title: document.getElementById('modal-title'),
            id: document.getElementById('project-id'),
            projectTitle: document.getElementById('project-title'),
            description: document.getElementById('project-description'),
            modeContainer: document.getElementById('project-mode-container'),
            modeValue: document.getElementById('project-mode-value'),
            locationInput: document.getElementById('project-location-input'),
            mapElement: document.getElementById('modal-map'),
            tabDetails: document.getElementById('modal-tab-details'),
            tabLocation: document.getElementById('modal-tab-location'),
            contentDetails: document.getElementById('modal-content-details'),
            contentLocation: document.getElementById('modal-content-location'),
            searchLocationBtn: document.getElementById('location-search-btn'),
            useMyLocationBtn: document.getElementById('use-my-location-btn'),
            cancelBtn: document.getElementById('cancel-create-project'),
            confirmBtn: document.getElementById('confirm-create-project'),
            nextBtn: document.getElementById('modal-next-btn'),
            backBtn: document.getElementById('modal-back-btn'),
        },
        playbackModal: {
            modal: document.getElementById('playback-modal'),
            mediaContainer: document.getElementById('playback-media-container'),
            playPauseBtn: document.getElementById('playback-play-pause-btn'),
            prevBtn: document.getElementById('playback-prev-btn'),
            nextBtn: document.getElementById('playback-next-btn'),
            closeBtn: document.getElementById('playback-close-btn'),
            progressDots: document.getElementById('playback-progress-dots'),
            filmIntro: document.getElementById('film-intro-overlay'),
        },

        auth: {
            modal: document.getElementById('auth-modal'),
            form: document.getElementById('auth-form'),
            title: document.getElementById('auth-modal-title'),
            usernameInput: document.getElementById('auth-username'),
            passwordInput: document.getElementById('auth-password'),
            submitBtn: document.getElementById('auth-submit-btn'),
            switchBtn: document.getElementById('auth-switch-btn'),
            switchText: document.getElementById('auth-switch-text'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            closeBtn: document.getElementById('close-auth-modal'),
            userAvatar: document.getElementById('user-avatar'),
        },

    profileModal: {
    modal: document.getElementById('profile-modal'),
    closeBtn: document.getElementById('profile-modal-close'),
    imagePreview: document.getElementById('profile-image-preview'),
    usernameDisplay: document.getElementById('profile-username'),
    uploadInput: document.getElementById('avatar-upload-input'),
    uploadBtn: document.getElementById('avatar-upload-btn'),
    deleteBtn: document.getElementById('avatar-delete-btn'),
    statusText: document.getElementById('profile-upload-status'),
},

 welcomeModal: {
        modal: document.getElementById('welcome-modal'),
        closeBtn: document.getElementById('close-welcome-modal'),
    }

    };

    const state = {
        activePage: 'media-page',
        currentUser: {id: null, name: null, avatar: null},
        allProjects: [],
        currentMediaClips: [],
        isEditMode: false,
        currentlyEditingProjectId: null,
        draggedClipId: null,
        playback: {
            items: [],
            currentIndex: 0,
            isPlaying: false,
            timeout: null,
            ambilightInterval: null
        },
        maps: {
            modal: null,
            modalMarker: null,
            projectMarkers: [],
            currentPinLocation: null,
            userLocationRequested: false
        },
        MAX_FRAMES: 5,
        authMode: 'login' 
    };

    const userLocationIcon = L.divIcon({
        className: 'user-location-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    const requestUserLocation = (onSuccess) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            (error) => {
                let message = "Standort konnte nicht ermittelt werden.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Zugriff auf Standort blockiert."; break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Standortinformation ist nicht verfügbar."; break;
                    case error.TIMEOUT:
                        message = "Standortabfrage hat zu lange gedauert."; break;
                }
                console.error("Fehler bei der Standortabfrage:", error.code, error.message);
                showToast(message);
            }
        );
    } else {
        showToast("Standortabfrage wird von diesem Browser nicht unterstützt.");
    }
};

    // Switch Pages
    const switchPage = (targetId) => {
        state.activePage = targetId;
        dom.pages.forEach(page => page.classList.toggle('active', page.id === targetId));
        dom.navButtons.forEach(btn => btn.classList.toggle('active', `nav-${targetId.split('-')[0]}` === btn.id));

        // Prüfen, ob zur Kartenseite gewechselt wird
        if (targetId === 'map-page') {
            // 1. Initialisiere die Karte
            if (!state.maps.main) {
                state.maps.main = initMap(dom.mapPage.mapElement, { center: [53.551, 9.993], zoom: 13 });
                renderProjectMarkers(); // Marker jetzt hier rendern, da die Karte existiert.
            }

            // 2. WICHTIG: Gib der Karte einen Moment Zeit, um im DOM sichtbar zu werden,
            //    und erzwinge dann eine Neu-Berechnung der Größe.
            setTimeout(() => {
                state.maps.main.invalidateSize();

                // 3. Frage den Standort des Nutzers erst NACH der Größenanpassung ab
                //    und nur, wenn es noch nicht geschehen ist.
                if (!state.maps.userLocationRequested) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const userLatLng = {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude
                                };
                                state.maps.userLocation = userLatLng;

                                // Eigenes Icon für den Nutzerstandort erstellen und hinzufügen
                                const userLocationIcon = L.divIcon({
                                    className: 'user-location-icon',
                                    iconSize: [16, 16],
                                    iconAnchor: [8, 8],
                                });

                                L.marker(userLatLng, { icon: userLocationIcon })
                                    .addTo(state.maps.main)
                                    .bindPopup('Dein Standort');

                                // Karte auf den Nutzer zentrieren
                                state.maps.main.panTo(userLatLng);
                                renderProjectMarkers();
                            },
                            (error) => {
                                let message = "Standort konnte nicht ermittelt werden.";
                                switch (error.code) {
                                    case error.PERMISSION_DENIED:
                                        message = "Zugriff auf Standort blockiert.";
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        message = "Standortinformation ist nicht verfügbar.";
                                        break;
                                    case error.TIMEOUT:
                                        message = "Standortabfrage hat zu lange gedauert.";
                                        break;
                                }
                                console.error("Fehler bei der Standortabfrage:", error.code, error.message);
                                showToast(message);
                            }
                        );
                    } else {
                        showToast("Standortabfrage wird von diesem Browser nicht unterstützt.");
                    }
                    // Setze die Flag, damit nicht erneut gefragt wird.
                    state.maps.userLocationRequested = true;
                }
            }, 10); // Ein kleiner Timeout von 10ms genügt.
        }
    };

    const resetMediaPage = () => {
        state.currentMediaClips = [];
        state.isEditMode = false;
        state.currentlyEditingProjectId = null;
        dom.mediaPage.title.textContent = 'Neues Projekt';
        dom.mediaPage.actionBtn.textContent = 'Projekt erstellen';
        renderMediaClips();
        updateMediaCounter();
    };

    const getColorForUser = (username) => {
    if (!username) return '#808080'; // Standard-Grau, falls kein Name vorhanden ist

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360; // Eine Farbe auf dem 360°-Farbkreis
    // Wir halten Sättigung und Helligkeit konstant für schöne, kräftige Farben
    return `hsl(${hue}, 70%, 45%)`; 
};

const uploadFileToSupabase = async (file, userId) => {
    // NEU: Sicherheitsprüfung hinzufügen
    if (!userId) {
        showToast('Du musst angemeldet sein, um Dateien hochzuladen.');
        console.error('Upload-Versuch ohne angemeldeten Benutzer.');
        return null;
    }

    // Erstellt einen eindeutigen Dateipfad, um Konflikte zu vermeiden
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabaseClient.storage
        .from('media-clips') // Name deines Buckets
        .upload(filePath, file);

    if (error) {
        console.error('Fehler beim Upload:', error);
        return null;
    }

    // Holt die öffentliche URL der gerade hochgeladenen Datei
    const { data: urlData } = supabaseClient.storage
        .from('media-clips')
        .getPublicUrl(data.path);

    return {
        path: data.path, // Der interne Pfad zum Speichern in der DB
        publicUrl: urlData.publicUrl // Die URL zum Anzeigen
    };
};
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const { data: { user } } = await supabaseClient.auth.getUser(); 
    if (!user) return showToast('Du musst angemeldet sein.');

    dom.profileModal.statusText.textContent = 'Lade hoch...';

    // 1. Datei in den 'avatars' Bucket hochladen
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        dom.profileModal.statusText.textContent = 'Upload fehlgeschlagen.';
        return console.error('Upload-Fehler:', uploadError);
    }

// KORRIGIERTER BLOCK
// 2. Öffentliche URL der Datei holen
const { data: urlData, error: urlError } = supabaseClient.storage
    .from('avatars')
    .getPublicUrl(filePath);

if (urlError) {
    dom.profileModal.statusText.textContent = 'URL konnte nicht geholt werden.';
    return console.error('URL-Fehler:', urlError);
}

// 3. URL in den Metadaten des Nutzers speichern
const { error: updateUserError } = await supabaseClient.auth.updateUser({
    data: { avatar_url: urlData.publicUrl } // <-- Korrektur hier
});

    if (updateUserError) {
        dom.profileModal.statusText.textContent = 'Profil konnte nicht aktualisiert werden.';
        return console.error('Update-Fehler:', updateUserError);
    }

    // 4. UI aktualisieren und Modal schließen
    dom.profileModal.statusText.textContent = 'Upload erfolgreich!';
    await checkUser(); // Aktualisiert die UI mit dem neuen Bild
    setTimeout(() => toggleModal(dom.profileModal.modal, false), 1000);
};

    const createPerforations = (container) => {
        if (!container) return;
        container.innerHTML = '';
        const holeCount = Math.floor(container.clientWidth / 20);
        for (let i = 0; i < holeCount; i++) {
            const hole = document.createElement('div');
            hole.className = 'perforation-hole';
            container.appendChild(hole);
        }
    };

    const renderMediaClips = () => {
        dom.mediaPage.filmStrip.innerHTML = '';
        state.currentMediaClips.forEach(clip => {
            const frame = createMediaFrame(clip);
            const slot = document.createElement('div');
            slot.className = 'film-slot';
            slot.dataset.slotFor = clip.id;
            slot.appendChild(frame);
            dom.mediaPage.filmStrip.appendChild(slot);
        });

        const emptySlotsCount = state.MAX_FRAMES - state.currentMediaClips.length;
        for (let i = 0; i < emptySlotsCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'film-slot';
            dom.mediaPage.filmStrip.appendChild(slot);
        }
        updateAddMediaButton();
        updateMediaCounter();
    };

    const updateAddMediaButton = () => {
        const firstEmptySlot = Array.from(dom.mediaPage.filmStrip.children).find(slot => slot.childElementCount === 0);
        if (firstEmptySlot) {
            firstEmptySlot.appendChild(dom.mediaPage.addMediaFrame);
            dom.mediaPage.addMediaFrame.style.display = 'flex';
        } else {
            dom.mediaPage.addMediaFrame.style.display = 'none';
        }
        dom.mediaPage.actionBtn.disabled = state.currentMediaClips.length === 0;
    };

    const createMediaFrame = (clip) => {
        const frame = document.createElement('div');
        frame.className = 'film-frame-item';
        frame.dataset.id = clip.id;
        frame.draggable = true;

        let previewHtml = '';
        if (clip.type.startsWith('image')) {
            previewHtml = `<img src="${clip.src}" class="w-full h-full object-cover" draggable="false">`;
        } else if (clip.type.startsWith('video')) {
            previewHtml = `<video src="${clip.src}#t=0.5" class="w-full h-full object-cover" muted playsinline draggable="false"></video>`;
        } else {
            previewHtml = `<div class="p-2 text-center flex items-center justify-center h-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.09.21zM16.383 3.076A1 1 0 0117 4v12a1 1 0 01-1.707.707l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.09.21z" clip-rule="evenodd" /></svg></div>`;
        }

// Autoren-Label hinzufügen, wenn ein Autor vorhanden ist
let authorHtml = '';
if (clip.author) {
    // PRÜFUNG: Zeige das Avatar-Bild des aktuellen Nutzers, wenn es passt.
    if (clip.author === state.currentUser.name && state.currentUser.avatar) {
        authorHtml = `<img src="${state.currentUser.avatar}" class="author-tag is-avatar" title="Erstellt von ${clip.author}">`;
    } else {
        // FALLBACK: Zeige Initialen für andere Nutzer oder wenn kein Avatar da ist
        const initials = clip.author.substring(0, 2).toUpperCase();
        const color = getColorForUser(clip.author);
        authorHtml = `<div class="author-tag" style="background-color: ${color};" title="Erstellt von ${clip.author}">${initials}</div>`;
    }
}

        frame.innerHTML = `
        <div class="w-full h-full relative">
            ${previewHtml}
            ${authorHtml}
        </div>
        <button class="delete-media-btn absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white z-10">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>`;

        frame.querySelector('.delete-media-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            state.currentMediaClips = state.currentMediaClips.filter(c => c.id != clip.id);
            renderMediaClips();
        });

        return frame;
    };

    const renderAllProjects = () => {
        dom.projectsPage.container.innerHTML = '';
        if (state.allProjects.length === 0) {
            dom.projectsPage.container.innerHTML = `<p class="text-center text-gray-500">Noch keine Projekte erstellt.</p>`;
            return;
        }
        state.allProjects.forEach(p => dom.projectsPage.container.appendChild(createProjectCard(p)));
        renderProjectMarkers();
    };


    const createProjectCard = (project) => {
        const card = document.createElement('div');
        card.className = 'project-card flex flex-col items-stretch';

        // HTML für einen flexiblen Medien-Container generieren
        let mediaPreviewsHTML;
        if (project.media && project.media.length > 0) {
            const mediaItemsHTML = project.media.map((mediaItem, index) => {
                // Jedes Element ist ein flexibler Container, der wächst, um den Platz zu füllen.
                // Eine dünne weiße Linie trennt die Elemente.
                const itemContainerClasses = `flex-1 relative overflow-hidden ${index < project.media.length - 1 ? 'border-r-2 border-white' : ''}`;
                const mediaElementClasses = "w-full h-full object-cover absolute inset-0";
                let previewElement = '';

                if (mediaItem.type.startsWith('image')) {
                    previewElement = `<img src="${mediaItem.src}" alt="Vorschau" class="${mediaElementClasses}">`;
                } else if (mediaItem.type.startsWith('video')) {
                    previewElement = `
                    <video class="${mediaElementClasses}" src="${mediaItem.src}#t=0.5" preload="metadata"></video>
                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                    </div>`;
                } else { // Fallback für Audio oder andere Typen
                    previewElement = `
                    <div class="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg class="w-10 h-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
                        </svg>
                    </div>`;
                }
                return `<div class="${itemContainerClasses}">${previewElement}</div>`;
            }).join('');

            // Der Hauptcontainer ist nun ein Flex-Container anstelle eines Scroll-Containers.
            mediaPreviewsHTML = `
            <div class="media-previews-container cursor-pointer w-full h-32 flex bg-gray-100">
                ${mediaItemsHTML}
            </div>`;
        } else {
            // Der Platzhalter bleibt unverändert.
            mediaPreviewsHTML = `
            <div class="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                Keine Medien vorhanden
            </div>`;
        }

        // HTML-Struktur für die Karte
        card.innerHTML = `
        ${mediaPreviewsHTML}

        <div class="p-4 flex-grow flex flex-col">
            <h4 class="title font-bold text-lg text-gray-800 mb-2">${project.title}</h4>
            <p class="text-sm text-gray-600 mb-3 flex-grow">${project.description.substring(0, 80)}${project.description.length > 80 ? '...' : ''}</p>
            
            <div class="flex items-center gap-4 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.223.654-.369.395-.226.86-.52 1.358-.863.564-.406 1.258-1.002 1.927-1.762C15.93 13.36 17 11.45 17 9.5 17 5.91 13.866 3 10 3S3 5.91 3 9.5c0 1.95.932 3.86 2.565 5.408.67.76 1.363 1.356 1.927 1.762.498.343.963.637 1.358.863.254.146.468.27.654.369a5.745 5.745 0 00.28.14l.025.011.006.003zM10 11.25a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5z" clip-rule="evenodd" /></svg>
                    <span>${project.address ? project.address.split(',')[0] : 'Kein Ort'}</span>
                </div>
                <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.586a1.5 1.5 0 01-.44 1.06L9.5 9.586V16.5a1.5 1.5 0 01-3 0V9.586L3.44 6.146A1.5 1.5 0 013 4.586V3.5z" /></svg>
                    <span>${project.media.length}/5 Medien</span>
                </div>
            </div>
        </div>
        
        <div class="flex-shrink-0 flex items-center justify-end gap-1 p-2 bg-gray-50 border-t border-gray-100">
            <button data-action="edit-info" title="Infos bearbeiten" class="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h4l-2 2H7v5H5z"></path></svg>
            </button>
            <button data-action="edit-clips" title="Clips bearbeiten" class="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
            </button>
            <button data-action="delete" title="Löschen" class="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
    `;

        // Event-Listener für die neuen Elemente zuweisen
        const mediaContainer = card.querySelector('.media-previews-container');
        if (mediaContainer) {
            mediaContainer.addEventListener('click', () => openPlayback(project.media));
        }
        card.querySelector('[data-action="edit-info"]').addEventListener('click', () => openProjectModal(project));
        card.querySelector('[data-action="edit-clips"]').addEventListener('click', () => handleEditClips(project));
        card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            if (confirm(`Möchtest du das Projekt "${project.title}" wirklich löschen?`)) {
                 // Projekt aus der Supabase-Datenbank löschen
                const { error } = await supabaseClient
                    .from('projects')
                    .delete()
                    .eq('id', project.id);

                // Prüfen, ob beim Löschen ein Fehler aufgetreten ist
                if (error) {
                    console.error('Fehler beim Löschen des Projekts:', error);
                    showToast('Projekt konnte nicht gelöscht werden.');
                    return; // Abbrechen, wenn ein Fehler auftritt
                }

                       // 2. NEU: Marker von der Karte entfernen
                if (state.maps.main) {
                    const markerIndex = state.maps.projectMarkers.findIndex(m => m.projectId === project.id);
                    if (markerIndex > -1) {
                        state.maps.projectMarkers[markerIndex].marker.remove(); // Vom Leaflet Layer entfernen
                        state.maps.projectMarkers.splice(markerIndex, 1);       // Aus dem state-Array entfernen
                    }
                }

                // Lokalen Zustand aktualisieren und UI neu rendern
                state.allProjects = state.allProjects.filter(p => p.id !== project.id);
                renderAllProjects();
                showToast("Projekt endgültig gelöscht.");
            }
        });

        return card;
    };

    // Bearbeiten
    const handleEditClips = (project) => {
        state.isEditMode = true;
        state.currentlyEditingProjectId = project.id;
        state.currentMediaClips = JSON.parse(JSON.stringify(project.media));
        dom.mediaPage.title.textContent = `Bearbeite: ${project.title}`;
        dom.mediaPage.actionBtn.textContent = 'Änderungen speichern';
        renderMediaClips();
        switchPage('media-page');
    };

    // Änderungen speichern
    const handleSaveClipChanges = () => {
        const projectIndex = state.allProjects.findIndex(p => p.id === state.currentlyEditingProjectId);
        if (projectIndex > -1) {
            state.allProjects[projectIndex].media = state.currentMediaClips;
            if (state.currentMediaClips.length > 0) {
                state.allProjects[projectIndex].thumbnail = state.currentMediaClips[0].src;
            } else {
                state.allProjects[projectIndex].thumbnail = 'https://placehold.co/80x80/e0e0e0/333?text=leer';
            }
        }
        showToast("Änderungen gespeichert!");
        renderAllProjects();
        switchPage('projects-page');
    };

    // Karte initialisieren
    const initMap = (mapElement, options) => {
        const map = L.map(mapElement, { scrollWheelZoom: true }).setView(options.center, options.zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

        // Legende zur Karte hinzufügen
        const legend = L.control({ position: 'topright' });
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML =
                '<h4>Legende</h4>' +
                '<i style="background: var(--secondary-color)"></i> Solo-Projekt<br>' +
                '<i style="background: var(--accent-color)"></i> Collab-Projekt';
            return div;
        };
        legend.addTo(map);

        return map;
    };

    // Funktion zum Auf und Zuklappen der Beschreibung im Popup
    function toggleDescription(button, elementId) {
        const descriptionDiv = document.getElementById(elementId);
        if (!descriptionDiv) return;

        const isHidden = descriptionDiv.style.display === 'none';

        // SVG-Icon für "Zuklappen" (Chevron nach oben)
        const chevronUp = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>';

        // SVG-Icon für "Aufklappen" (Chevron nach unten)
        const chevronDown = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>';

        if (isHidden) {
            descriptionDiv.style.display = 'block';
            button.innerHTML = chevronUp;
        } else {
            descriptionDiv.style.display = 'none';
            button.innerHTML = chevronDown;
        }
    }

    const renderProjectMarkers = () => {
        if (!state.maps.main) return;
        // Bisherige Marker von der Karte entfernen
        state.maps.projectMarkers.forEach(markerObj => markerObj.marker.remove());
        state.maps.projectMarkers = [];

        const formatDistance = (meters) => {
            if (meters < 1000) return `${Math.round(meters)} m`;
            return `${(meters / 1000).toFixed(1)} km`;
        };

        const userLatLng = state.maps.userLocation ? L.latLng(state.maps.userLocation.lat, state.maps.userLocation.lng) : null;

        state.allProjects.filter(p => p.location).forEach(project => {
            const markerClass = project.mode === 'together' ? 'marker-collab' : 'marker-single';
            const customIcon = L.divIcon({
                className: `walkby-marker-icon ${markerClass}`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([project.location.lat, project.location.lng], { icon: customIcon }).addTo(state.maps.main);

            // Daten für das Popup sammeln
            const authorInfo = project.createdBy ? `<div class="popup-info-row"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg><span>Erstellt von <strong>${project.createdBy}</strong></span></div>` : '';
            const mediaCount = project.media.length;
            const mediaInfo = `<div class="popup-info-row"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2-2H4a2 2 0 01-2-2v-4z" /></svg><span>${mediaCount} von ${state.MAX_FRAMES} Medien</span></div>`;
            const creationDate = new Date(project.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const dateInfo = `<div class="popup-info-row"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg><span>${creationDate}</span></div>`;

            let distanceInfo = '';
            if (userLatLng) {
                const projectLatLng = L.latLng(project.location.lat, project.location.lng);
                distanceInfo = `<div class="popup-info-row"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg><span>ca. ${formatDistance(userLatLng.distanceTo(projectLatLng))} entfernt</span></div>`;
            }

            let thumbnailElementHTML;
            if (project.media && project.media.length > 0) {
                const firstMedia = project.media[0];
                if (firstMedia.type.startsWith('video')) {
                    // Create a <video> element for video previews
                    thumbnailElementHTML = `<video src="${firstMedia.src}#t=0.5" class="w-full h-full object-cover" muted preload="metadata"></video>`;
                } else {
                    // Create an <img> element for images
                    thumbnailElementHTML = `<img src="${firstMedia.src}" alt="Vorschau für ${project.title}" class="w-full h-full object-cover">`;
                }
            } else {
                // Fallback if there is no media
                thumbnailElementHTML = `<img src="https://placehold.co/200x100/e0e0e0/666?text=Vorschau" alt="Keine Vorschau" class="w-full h-full object-cover">`;
            }

            const descriptionId = `desc-${project.id}`;
            const popupContent = `
    <div class="walkby-popup w-56">
        <div class="h-24 bg-gray-200">
            ${thumbnailElementHTML}
        </div>
        <div class="p-3">
            <div class="popup-title-container">
                <h3 class="font-bold text-base">${project.title}</h3>
                ${project.description ? `
                <button class="toggle-description-btn" onclick="toggleDescription(this, '${descriptionId}'); event.stopPropagation();">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                ` : ''}
            </div>
            <div id="${descriptionId}" class="description-content" style="display: none;">
                <p>${project.description}</p>
            </div>
            <div class="space-y-1.5 text-sm text-gray-700 mt-3">
                ${authorInfo}
                ${mediaInfo}
                ${dateInfo} 
                ${distanceInfo}
            </div>
        </div>
        <div class="px-3 pb-2 pt-2 border-t border-gray-100 flex justify-end items-center">
      ${project.mode === 'together'
                    ? `<button class="popup-btn popup-btn-collab" onclick="handleJoinProject(${project.id})">Mitmachen!</button>`
                    : `<button class="popup-btn popup-btn-solo" onclick="viewProjectById(${project.id})">Ansehen</button>`
                }
        </div>
    </div>`;

            marker.bindPopup(popupContent, { className: 'custom-walkby-popup' });
            // Speichern des Markers als Objekt mit seiner ID
            state.maps.projectMarkers.push({ projectId: project.id, marker: marker });
        });
    };

    // Die Funktion für den "Mitmachen"-Button
    const handleJoinProject = (projectId) => {
        if (state.maps.main) {
            state.maps.main.closePopup();
        }
        const project = state.allProjects.find(p => p.id === projectId);
        if (project) {
            showToast(`Du bearbeitest jetzt das Projekt: "${project.title}"`);
            handleEditClips(project);
        }
    };

    // ==== JS MODIFICATION HELPER FUNCTION ====
    const updateModeSelection = (selectedMode) => {
        dom.projectModal.modeValue.value = selectedMode;
        dom.projectModal.modeContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === selectedMode);
        });
    };
    // ==== END JS MODIFICATION ====

    const openProjectModal = (project = null) => {
        const isEditing = project !== null;
        dom.projectModal.title.textContent = isEditing ? "Projekt bearbeiten" : "Neues Projekt erstellen";
        dom.projectModal.id.value = isEditing ? project.id : '';
        dom.projectModal.projectTitle.value = isEditing ? project.title : '';
        dom.projectModal.description.value = isEditing ? project.description : '';
        dom.projectModal.locationInput.value = isEditing ? project.address || '' : '';
        state.maps.currentPinLocation = isEditing ? project.location : null;

        // ==== JS MODIFICATION ====
        const mode = isEditing ? project.mode : 'single';
        updateModeSelection(mode);
        // ==== END JS MODIFICATION ====

        switchModalTab('details');
        toggleModal(dom.projectModal.modal, true);
    };

   // in main.js
const switchModalTab = (tabName) => {
    const isDetails = tabName === 'details';

    // Tab-Buttons und Inhalte umschalten (wie bisher)
    dom.projectModal.tabDetails.classList.toggle('active', isDetails);
    dom.projectModal.tabLocation.classList.toggle('active', !isDetails);
    dom.projectModal.contentDetails.classList.toggle('hidden', !isDetails);
    dom.projectModal.contentLocation.classList.toggle('hidden', isDetails);

    // NEU: Sichtbarkeit der Navigations-Buttons steuern
    dom.projectModal.nextBtn.classList.toggle('hidden', !isDetails);   // Zeige "Weiter" nur bei Details
    dom.projectModal.backBtn.classList.toggle('hidden', isDetails);    // Zeige "Zurück" nur bei Ort
    dom.projectModal.confirmBtn.classList.toggle('hidden', isDetails); // Zeige "Speichern" nur bei Ort

    // Kartenlogik
    if (!isDetails) {
        if (!state.maps.modal) {
            state.maps.modal = initMap(dom.projectModal.mapElement, { center: [53.55, 9.99], zoom: 12 });
            state.maps.modal.on('click', (e) => updateModalPin(e.latlng, true));
        }
        setTimeout(() => {
            state.maps.modal.invalidateSize();
            if (state.maps.currentPinLocation) {
                updateModalPin(state.maps.currentPinLocation);
            }
        }, 10);
    }
};

    const updateModalPin = (latlng, fromClick = false) => {
        state.maps.currentPinLocation = { lat: latlng.lat, lng: latlng.lng };
        if (!state.maps.modalMarker) {
            state.maps.modalMarker = L.marker(latlng).addTo(state.maps.modal);
        } else {
            state.maps.modalMarker.setLatLng(latlng);
        }
        state.maps.modal.panTo(latlng);

        if (fromClick) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
                .then(res => res.json()).then(data => {
                    if (data && data.display_name) dom.projectModal.locationInput.value = data.display_name;
                });
        }
    };

    // Hilfsfunktion, um das Ambilight zu stoppen und zurückzusetzen
    const stopAndResetAmbilight = () => {
        if (state.playback.ambilightInterval) {
            clearInterval(state.playback.ambilightInterval);
            state.playback.ambilightInterval = null;
        }
        // Setzt den Schein auf einen neutralen Standardwert zurück
        dom.playbackModal.mediaContainer.style.boxShadow = '0 0 300px 100px rgba(255, 255, 255, 0.1)';
    };

    /**
     * Wendet eine Farbe als "Ambilight" Schein an.
     * @param {{r: number, g: number, b: number}} color - Das RGB-Farbobjekt.
     * @param {number} opacity - Die gewünschte Deckkraft des Scheins (0 bis 1).
     */
    const applyAmbilight = (color, opacity = 0.5) => {
        if (color) {
            const glowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            // Format: box-shadow: [Unschärfe] [Ausdehnung] [Farbe]
            dom.playbackModal.mediaContainer.style.boxShadow = `0 0 300px 100px ${glowColor}`;
        }
    };

/**
 * Analysiert ein Bild oder Video und findet die dominanteste (gesättigtste) Farbe.
 * @param {HTMLImageElement|HTMLVideoElement} mediaElement - Das zu analysierende Medium.
 * @returns {Promise<{r: number, g: number, b: number} | null>} - Ein Promise mit der dominantesten Farbe.
 */
const getDominantColor = (mediaElement) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const width = 50;
        const height = 50;
        canvas.width = width;
        canvas.height = height;

        try {
            ctx.drawImage(mediaElement, 0, 0, width, height);
            const data = ctx.getImageData(0, 0, width, height).data;
            
            let dominantColor = null;
            let maxSaturation = -1;

            for (let i = 0; i < data.length; i += 4 * 10) { // Wir prüfen jeden 10. Pixel
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Überspringe sehr dunkle oder sehr helle Pixel
                if (r < 15 && g < 15 && b < 15) continue;
                if (r > 240 && g > 240 && b > 240) continue;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max - min;

                // Wir suchen nach der Farbe mit der höchsten Sättigung
                if (saturation > maxSaturation) {
                    maxSaturation = saturation;
                    dominantColor = { r, g, b };
                }
            }
            
            // Gib die dominanteste Farbe zurück, die wir gefunden haben
            resolve(dominantColor);

        } catch (e) {
            console.error("Fehler bei der Farbanalyse (möglicherweise CORS-Problem):", e);
            resolve(null);
        }
    });
};

const createAudioVisualizer = (audioElement, container) => {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Nur einen AudioContext pro Wiedergabe-Session erstellen
    if (!state.playback.audioContext) {
        state.playback.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Alte Verbindung trennen, falls vorhanden
    if (state.playback.audioSource) {
        state.playback.audioSource.disconnect();
    }

    const source = state.playback.audioContext.createMediaElementSource(audioElement);
    state.playback.audioSource = source; // Quelle für späteres Trennen speichern

    const analyser = state.playback.audioContext.createAnalyser();
    
    source.connect(analyser);
    analyser.connect(state.playback.audioContext.destination);
    
    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const barWidth = (canvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;

    const renderFrame = () => {
        if (!state.playback.isPlaying || audioElement.paused) {
             return; // Stoppt die Animation, wenn die Wiedergabe pausiert oder beendet wird
        }

        requestAnimationFrame(renderFrame);
        x = 0;
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#1A1A1A"; // Dunkler Hintergrund aus der Palette
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * (canvas.height / 200); // Etwas übersteuerter Effekt
            
            // Petrol: #1D4A59 -> rgb(29, 74, 89)
            // Gold: #F2C14E -> rgb(242, 193, 78)
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            gradient.addColorStop(0, `rgb(29, 74, 89)`);   // Petrol
            gradient.addColorStop(1, `rgb(242, 193, 78)`); // Gold
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 2; // 2px Abstand
        }
    };
    
    audioElement.onplay = () => {
        state.playback.audioContext.resume(); // Wichtig für Browser
        renderFrame();
    };

    return canvas; // Gibt das Canvas-Element zurück
};

    const openPlayback = (mediaItems) => {
        if (!mediaItems || mediaItems.length === 0) return;

        state.playback = { items: mediaItems, currentIndex: 0, isPlaying: true, timeout: null };

        // Setzt die Animation zurück und startet sie
        const { modal, filmIntro } = dom.playbackModal;
        filmIntro.classList.remove('is-playing');
        modal.classList.remove('is-playing');
        filmIntro.style.display = 'block';
        const leader = filmIntro.querySelector('.film-leader');
        const newLeader = leader.cloneNode(true);
        leader.parentNode.replaceChild(newLeader, leader);

        toggleModal(modal, true);

        // Löst die CSS-Übergänge aus
        setTimeout(() => {
            filmIntro.classList.add('is-playing');
            modal.classList.add('is-playing');
        }, 10);

        // Startet die eigentliche Medienwiedergabe NACH der Intro-Animation
        setTimeout(() => {
            if (state.playback.isPlaying) {
                renderProgressDots();
                playCurrentItem();
            }
        }, 2500);
    };


const closePlayback = () => {
        clearTimeout(state.playback.timeout);
        stopAndResetAmbilight(); // <<< NEU: Stellt sicher, dass alles sauber beendet wird.

            // NEU: Audio Context explizit schließen
    if (state.playback.audioContext && state.playback.audioContext.state !== 'closed') {
        state.playback.audioContext.close();
    }

        // NEU: Audio-Properties im State zurücksetzen
        state.playback = { ...state.playback, isPlaying: false, audioContext: null, audioSource: null };

        const { modal, filmIntro, mediaContainer } = dom.playbackModal;
        mediaContainer.innerHTML = '';
        filmIntro.style.display = 'none';
        modal.classList.remove('is-playing');

        toggleModal(modal, false);
    };

    const playCurrentItem = () => {
        clearTimeout(state.playback.timeout);
        stopAndResetAmbilight(); // Ambilight stoppen & zurücksetzen

    if (state.playback.audioContext) {
        state.playback.audioContext.close();
        state.playback.audioContext = null;
    }

        // NEU: Stoppt zuverlässig vorherige Medien
        dom.playbackModal.mediaContainer.innerHTML = ''; 

        const item = state.playback.items[state.playback.currentIndex];
        const container = dom.playbackModal.mediaContainer;

        let element;
        if (item.type.startsWith('image')) {
            element = document.createElement('img');

            /// Diese Zeile verhindert Sicherheitsfehler beim Canvas
            element.crossOrigin = 'anonymous';
            // Ambilight für Bilder: Farbe einmalig nach dem Laden ermitteln
            element.onload = () => {
                if (state.playback.isPlaying) {
                    getDominantColor(element).then(color => applyAmbilight(color, 0.6));
                }
            };
            state.playback.timeout = setTimeout(playNext, 4000);
        } else if (item.type.startsWith('video')) {
            element = document.createElement('video');
            element.crossOrigin = 'anonymous';
            element.autoplay = true;
            element.onended = playNext;

            // Ambilight für Videos: Farbe kontinuierlich während der Wiedergabe ermitteln
            element.onplay = () => {
                state.playback.ambilightInterval = setInterval(() => {
                    if (!element.paused) {
                        getDominantColor(element).then(color => applyAmbilight(color, 0.45));
                    }
                }, 750); // Farbe alle 750ms neu berechnen für einen sanften Wechsel
            };

        } else if (item.type.startsWith('audio')) {
            element = document.createElement('audio');
        element.crossOrigin = 'anonymous';
        element.autoplay = true;
        element.onended = playNext;
        
        // NEU: Ruft den Audio-Visualizer auf
        visualElement = createAudioVisualizer(element, container);
        
        // NEU: Ambilight reagiert jetzt auf den Visualizer
        state.playback.ambilightInterval = setInterval(() => {
             if (element && !element.paused) {
                  getDominantColor(visualElement).then(color => applyAmbilight(color, 0.5));
             }
        }, 750);
    }

        if (element) {
            element.src = item.src;
            element.className = 'max-w-full max-h-full object-contain animate-fade-in rounded-lg shadow-2xl';
            if (!item.type.startsWith('audio')) container.appendChild(element);
            if (state.playback.isPlaying && (element.play || item.type.startsWith('audio'))) element.play().catch(() => { });
        }
        renderProgressDots();
    };

    const setIsPlaying = (playing) => {
        state.playback.isPlaying = playing;
        dom.playbackModal.playPauseBtn.innerHTML = playing
            ? `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.25 2.25c-1.04 0-1.9.8-1.9 1.75v16.5c0 .95.86 1.75 1.9 1.75s1.9-.8 1.9-1.75V4c0-.95-.86-1.75-1.9-1.75zm-8.5 0c-1.04 0-1.9.8-1.9 1.75v16.5c0 .95.86 1.75 1.9 1.75s1.9-.8 1.9-1.75V4c0-.95-.86-1.75-1.9-1.75z"></path></svg>`
            : `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21.572 10.368l-15-8.25A2.25 2.25 0 003 4v16.5a2.25 2.25 0 003.572 1.882l15-8.25a2.25 2.25 0 000-3.764z"></path></svg>`;
    };
    const playNext = () => {
        if (!state.playback.isPlaying) return;
        state.playback.currentIndex = (state.playback.currentIndex + 1) % state.playback.items.length;
        playCurrentItem();
    };

    const playPrev = () => {
        if (!state.playback.isPlaying) return;
        state.playback.currentIndex = (state.playback.currentIndex - 1 + state.playback.items.length) % state.playback.items.length;
        playCurrentItem();
    };

    const renderProgressDots = () => {
        setIsPlaying(state.playback.isPlaying);
        dom.playbackModal.progressDots.innerHTML = state.playback.items.map((_, i) =>
            `<div class="w-2 h-2 rounded-full ${i === state.playback.currentIndex ? 'bg-[var(--brand-orange)]' : 'bg-gray-400'}"></div>`
        ).join('');
    };

const handleSaveProject = async () => {
    const title = dom.projectModal.projectTitle.value.trim();
    if (!title) return showToast("Bitte gib einen Projekttitel an.");

    const location = dom.projectModal.locationInput.value.trim();
    if (!location) return showToast("Bitte wähle einen Ort aus");

    const editingId = dom.projectModal.id.value ? parseInt(dom.projectModal.id.value) : null;

    // Projektdaten für die Datenbank vorbereiten
    const projectData = {
        title,
        description: dom.projectModal.description.value.trim(),
        mode: dom.projectModal.modeValue.value,
        location: state.maps.currentPinLocation,
        address: dom.projectModal.locationInput.value,
        user_id: state.currentUser.id,            // (UUID)
        created_by_name: state.currentUser.name   // (Name als Cache)
    };

    if (editingId) {
        // ---- UPDATE LOGIK (für später) ----
        const { error } = await supabaseClient.from('projects').update(projectData).eq('id', editingId);
        if (error) {
            console.error('Fehler beim Aktualisieren:', error);
            showToast("Projekt konnte nicht gespeichert werden.");
            return;
        }
    } else {
        // ---- NEUES PROJEKT ERSTELLEN ----
        if (state.currentMediaClips.length === 0) return alert("Bitte füge mindestens einen Clip hinzu.");

        // 1. Projekt in 'projects' Tabelle einfügen
        const { data: newProject, error: projectError } = await supabaseClient
            .from('projects')
            .insert(projectData)
            .select()
            .single(); // .select().single() gibt das erstellte Objekt zurück

        if (projectError) {
            console.error('Fehler beim Erstellen des Projekts:', projectError);
            showToast("Projekt konnte nicht erstellt werden.");
            return;
        }

        // 2. Mediendaten für die 'media_clips' Tabelle vorbereiten
        const clipsToInsert = state.currentMediaClips.map((clip, index) => ({
            project_id: newProject.id, // Die ID des gerade erstellten Projekts
            file_path: clip.path,      // Der private Pfad aus dem Storage-Upload
            type: clip.type,
            user_id: clip.user_id,          // (UUID)
            author_name: clip.author_name,  // (Name als Cache)
            sort_order: index          // Reihenfolge speichern
        }));

        // 3. Alle Clips auf einmal in die 'media_clips' Tabelle einfügen
        const { error: clipsError } = await supabaseClient.from('media_clips').insert(clipsToInsert);

        if (clipsError) {
            console.error('Fehler beim Speichern der Medien:', clipsError);
            // Hier könntest du das gerade erstellte Projekt wieder löschen, um Datenmüll zu vermeiden
            await supabaseClient.from('projects').delete().eq('id', newProject.id);
            showToast("Medien konnten nicht gespeichert werden.");
            return;
        }

        resetMediaPage();
    }

    showToast("Projekt erfolgreich gespeichert!");
    await loadProjectsFromSupabase(); // Neu laden, um alles anzuzeigen
    renderAllProjects();
    toggleModal(dom.projectModal.modal, false);
    switchPage('projects-page');
};

const updateAuthForm = () => {
    const isLogin = state.authMode === 'login';

    // Titel des Modals aktualisieren
    dom.auth.title.textContent = isLogin ? 'Login' : 'Registrieren';

    // Text des Hauptbuttons aktualisieren
    dom.auth.submitBtn.textContent = isLogin ? 'Einloggen' : 'Konto erstellen';

    // Text und Button zum Wechseln aktualisieren
    dom.auth.switchText.textContent = isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?';
    dom.auth.switchBtn.textContent = isLogin ? 'Registrieren' : 'Einloggen';
};

    const setupEventListeners = () => {
        dom.navButtons.forEach(button => button.addEventListener('click', () => {
            const pageId = button.id.replace('nav-', '') + '-page';
            if (document.getElementById(state.activePage).id === 'media-page' && state.isEditMode) {
                if (!confirm("Du hast ungespeicherte Änderungen. Willst du wirklich die Seite verlassen?")) return;
            }
            if (pageId === 'media-page') resetMediaPage();
            switchPage(pageId);
        }));

        dom.projectsPage.addNewBtn.addEventListener('click', () => {
            resetMediaPage();
            switchPage('media-page');
        });

        dom.mediaPage.actionBtn.addEventListener('click', () => {
            state.isEditMode ? handleSaveClipChanges() : openProjectModal();
        });

        dom.auth.loginBtn.addEventListener('click', () => {
            toggleModal(dom.auth.modal, true);
        });
    

        dom.auth.logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            updateUserUI(null); // Setzt currentUser auf null
            showToast('Erfolgreich ausgeloggt.');

            // 1. Lokale Projektdaten leeren
            state.allProjects = [];
            
            // 2. Projektliste und Kartenmarker aktualisieren (leeren)
            renderAllProjects(); 
            renderProjectMarkers(); // Stellt sicher, dass Marker verschwinden

            // 3. Zur Medienseite wechseln und diese zurücksetzen
            resetMediaPage();
            switchPage('media-page');
        });
    
        dom.auth.switchBtn.addEventListener('click', () => {
            state.authMode = state.authMode === 'login' ? 'register' : 'login';
            updateAuthForm();
        });
    
dom.auth.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = dom.auth.usernameInput.value;
    const password = dom.auth.passwordInput.value;

    dom.auth.submitBtn.disabled = true;
    dom.auth.submitBtn.textContent = 'Wird bearbeitet...';

    // Rufe die Edge Function auf
    const { data, error } = await supabaseClient.functions.invoke('auth-username', {
        body: {
            username: username,
            password: password,
            mode: state.authMode // 'login' oder 'register'
        },
    });

    if (error || data.error) {
        showToast(error?.message || data.error);
    } else {
        // Setze die Session, die wir von der Funktion zurückbekommen haben
        await supabaseClient.auth.setSession(data.session);
        
        toggleModal(dom.auth.modal, false);
        updateUserUI(data.user);
        showToast(state.authMode === 'login' ? 'Erfolgreich eingeloggt.' : 'Konto erfolgreich erstellt!');
    }
    
    dom.auth.submitBtn.disabled = false;
    updateAuthForm();
});

        dom.mediaPage.addMediaFrame.addEventListener('click', () => dom.mediaPage.mediaUploadInput.click());
dom.mediaPage.mediaUploadInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);
    const availableSlots = state.MAX_FRAMES - state.currentMediaClips.length;

    if (files.length > availableSlots) {
        let message = `Limit von ${state.MAX_FRAMES} Medien erreicht.`;
        if (availableSlots > 0) {
            message += ` Nur die ersten ${availableSlots} Dateien wurden hinzugefügt.`;
        }
        showToast(message);
    }

    // Zeige einen Lade-Indikator
    showToast('Lade Medien hoch...');

    const newClipsPromises = files.slice(0, availableSlots).map(async (file) => {
        const uploadResult = await uploadFileToSupabase(file, state.currentUser.id);
        if (uploadResult) {
            return {
                id: Date.now() + Math.random(), // Temporäre Client-ID
                src: uploadResult.publicUrl,    // Öffentliche URL für die Vorschau
                path: uploadResult.path,        // Interner Pfad für die DB
                type: file.type,
                author: state.currentUser.name, // Name für die Anzeige
                user_id: state.currentUser.id      // UUID für die DB
            };
        }
        return null;
    });

    const newClips = (await Promise.all(newClipsPromises)).filter(Boolean); // filter(Boolean) entfernt null-Werte
    state.currentMediaClips.push(...newClips);

    if (newClips.length > 0) {
        showToast(`${newClips.length} Medien erfolgreich hochgeladen!`);
    }

    renderMediaClips();
    event.target.value = '';
});

        const filmStrip = dom.mediaPage.filmStrip;
        filmStrip.addEventListener('dragstart', (e) => {
            const frame = e.target.closest('.film-frame-item');
            if (frame) {
                state.draggedClipId = frame.dataset.id;
                setTimeout(() => frame.classList.add('dragging'), 0);
            }
        });

        filmStrip.addEventListener('dragend', (e) => {
            const frame = e.target.closest('.film-frame-item');
            if (frame) frame.classList.remove('dragging');
            state.draggedClipId = null;
        });

        filmStrip.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetSlot = e.target.closest('.film-slot');
            if (!targetSlot || !state.draggedClipId) return;

            const droppedOnClipId = targetSlot.dataset.slotFor;
            const fromIndex = state.currentMediaClips.findIndex(c => c.id == state.draggedClipId);
            let toIndex = state.currentMediaClips.findIndex(c => c.id == droppedOnClipId);

            if (toIndex === -1) {
                const slots = Array.from(filmStrip.children);
                toIndex = slots.indexOf(targetSlot);
            }

            if (fromIndex > -1 && toIndex > -1 && fromIndex !== toIndex) {
                const [item] = state.currentMediaClips.splice(fromIndex, 1);
                state.currentMediaClips.splice(toIndex, 0, item);
                renderMediaClips();
            }
        });

        filmStrip.addEventListener('dragover', (e) => e.preventDefault());

        dom.projectModal.cancelBtn.addEventListener('click', () => toggleModal(dom.projectModal.modal, false));
        dom.projectModal.confirmBtn.addEventListener('click', handleSaveProject);
        dom.projectModal.tabDetails.addEventListener('click', () => switchModalTab('details'));
        dom.projectModal.tabLocation.addEventListener('click', () => switchModalTab('location'));
        dom.projectModal.nextBtn.addEventListener('click', () => switchModalTab('location'));
        dom.projectModal.backBtn.addEventListener('click', () => switchModalTab('details'));

        dom.projectModal.modeContainer.addEventListener('click', (e) => {
            const selectedButton = e.target.closest('.mode-selector-btn');
            if (selectedButton) {
                const mode = selectedButton.dataset.mode;
                updateModeSelection(mode);
            }
        });

        dom.projectModal.searchLocationBtn.addEventListener('click', async () => {
            const query = dom.projectModal.locationInput.value;
            if (!query) return;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=de&limit=1`);
                if (!response.ok) {
                    throw new Error('Netzwerk-Antwort war nicht ok.');
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    const latlng = { lat: data[0].lat, lng: data[0].lon };
                    updateModalPin(latlng);
                    dom.projectModal.locationInput.value = data[0].display_name;
                } else {
                    showToast("Adresse konnte nicht gefunden werden.");
                }
            } catch (error) {
                console.error("Fehler bei der Adresssuche:", error);
                showToast("Ein Fehler ist aufgetreten.");
            }
        });

        dom.projectModal.useMyLocationBtn.addEventListener('click', () => {
    showToast("Standort wird ermittelt...");
    requestUserLocation((position) => {
        const userLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        // Standort im state speichern, falls die Hauptkarte ihn noch nicht hat
        state.maps.userLocation = userLatLng;
        // Pin aktualisieren und die Adresse per Reverse-Geocoding holen
        updateModalPin(userLatLng, true);
        showToast("Standort gefunden!");
    });
});

        dom.playbackModal.closeBtn.addEventListener('click', closePlayback);
        dom.playbackModal.nextBtn.addEventListener('click', playNext);
        dom.playbackModal.prevBtn.addEventListener('click', playPrev);
        dom.playbackModal.playPauseBtn.addEventListener('click', () => {
            setIsPlaying(!state.playback.isPlaying);
            const mediaElement = dom.playbackModal.mediaContainer.querySelector('video, audio');
            if (state.playback.isPlaying) {
                if (mediaElement) mediaElement.play();
                else playNext();
            } else {
                clearTimeout(state.playback.timeout);
                if (mediaElement) mediaElement.pause();
            }
        });

dom.auth.userAvatar.addEventListener('click', async () => { // <-- Funktion async machen
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return; // Nur für eingeloggte Nutzer
    
    const avatarUrl = user.user_metadata?.avatar_url;
    dom.profileModal.usernameDisplay.textContent = state.currentUser.name || 'Benutzer';
    dom.profileModal.imagePreview.src = avatarUrl || 'https://placehold.co/128x128/e0e0e0/777?text=Avatar';
    dom.profileModal.statusText.textContent = '';
    toggleModal(dom.profileModal.modal, true);
});
dom.auth.closeBtn.addEventListener('click', () => toggleModal(dom.auth.modal, false));

dom.profileModal.closeBtn.addEventListener('click', () => toggleModal(dom.profileModal.modal, false));
dom.profileModal.uploadBtn.addEventListener('click', () => dom.profileModal.uploadInput.click());
dom.profileModal.uploadInput.addEventListener('change', handleAvatarUpload);
dom.profileModal.deleteBtn.addEventListener('click', handleAvatarDelete); 

// HINZUGEFÜGT
dom.welcomeModal.closeBtn.addEventListener('click', () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    dom.welcomeModal.modal.classList.remove('visible');
    setTimeout(() => {
        dom.welcomeModal.modal.classList.add('hidden');
    }, 300);
});
    };
    
const checkUser = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUserUI(session?.user);

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!session && !hasSeenWelcome) {
        setTimeout(() => {
            // Überprüfen, ob das Element existiert, bevor darauf zugegriffen wird
            if (dom.welcomeModal.modal) { 
                dom.welcomeModal.modal.classList.remove('hidden');
                setTimeout(() => {
                    dom.welcomeModal.modal.classList.add('visible');
                }, 10);
            }
        }, 500);
    }
};

const updateUserUI = (user) => {
    if (user) {
        state.currentUser.id = user.id;
        state.currentUser.name = user.user_metadata?.username;
        state.currentUser.avatar = user.user_metadata?.avatar_url;

        dom.auth.userAvatar.title = state.currentUser.name;

        dom.auth.loginBtn.classList.add('hidden');
        dom.auth.logoutBtn.classList.remove('hidden');
        dom.auth.userAvatar.classList.remove('hidden');

        // Logik: Zeige Bild ODER Initialen
        if (state.currentUser.avatar) {
            dom.auth.userAvatar.innerHTML = `<img src="${state.currentUser.avatar}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
            dom.auth.userAvatar.style.backgroundColor = 'transparent';
        } else {
            dom.auth.userAvatar.innerHTML = ''; // Leert evtl. altes Bild
            const username = state.currentUser.name || 'U';
            dom.auth.userAvatar.textContent = username.substring(0, 2).toUpperCase();
            dom.auth.userAvatar.style.backgroundColor = getColorForUser(username);
        }
    } else {
        state.currentUser = { id: null, name: null, avatar: null };

        dom.auth.userAvatar.title = '';
        dom.auth.loginBtn.classList.remove('hidden');
        dom.auth.logoutBtn.classList.add('hidden');
        dom.auth.userAvatar.classList.add('hidden');
    }
};


const init = async () => { // Mache die Funktion async
    setupEventListeners();
    resetMediaPage();
    
    await checkUser();
    await loadProjectsFromSupabase(); // Projekte aus Supabase laden
    //renderAllProjects(); // Projekte rendern
    
    switchPage('media-page');

    createPerforations(dom.mediaPage.perfTop);
    createPerforations(dom.mediaPage.perfBottom);
    new ResizeObserver(() => {
        createPerforations(dom.mediaPage.perfTop);
        createPerforations(dom.mediaPage.perfBottom);
    }).observe(dom.mediaPage.perfTop);

    window.viewProjectById = (id) => {
        const project = state.allProjects.find(p => p.id === id);
        if (project) openPlayback(project.media);
    };

    window.handleJoinProject = handleJoinProject;
    window.toggleDescription = toggleDescription;
};

const loadProjectsFromSupabase = async () => {
    // Lädt Projekte und die zugehörigen Medien-Clips in einer einzigen Abfrage
    const { data, error } = await supabaseClient
        .from('projects')
        .select(`
            id,
            created_at,
            title,
            description,
            mode,
            location,
            address,
            created_by_name,
            user_id,
            media_clips (
                file_path,
                type,
                author_name,
                user_id,
                sort_order
            )
        `)
        .order('created_at', { ascending: false }); // Neueste zuerst

    if (error) {
        console.error("Fehler beim Laden der Projekte:", error);
        showToast(`Projekte konnten nicht geladen werden: ${error.message}`);
        return;
    }

    // Daten in das Format umwandeln, das deine App erwartet
    state.allProjects = data.map(project => {
        const media = project.media_clips
            .sort((a, b) => a.sort_order - b.sort_order) // Sortieren sicherstellen
            .map(clip => ({
                id: clip.file_path, // Eindeutige ID
                src: supabaseClient.storage.from('media-clips').getPublicUrl(clip.file_path).data.publicUrl,
                type: clip.type,
                author: clip.author_name
            }));

        return {
            id: project.id,
            title: project.title,
            description: project.description,
            location: project.location,
            address: project.address,
            mode: project.mode,
            createdBy: project.created_by_name,
            createdAt: project.created_at,
            media: media
        };
    });
    renderAllProjects(); // <<< DIESE ZEILE HINZUFÜGEN!
    renderProjectMarkers(); // <<< UND DIESE! (Marker auch neu zeichnen)
};

const handleAvatarDelete = async () => {
    if (!confirm('Möchten Sie Ihr Profilbild wirklich entfernen?')) return;

    // Setze die avatar_url in den Metadaten des Nutzers auf null
    const { error } = await supabaseClient.auth.updateUser({
        data: { avatar_url: null }
    });

    if (error) {
        showToast('Avatar konnte nicht entfernt werden.');
        return console.error('Fehler beim Löschen des Avatars:', error);
    }

    // UI aktualisieren, Erfolgsmeldung anzeigen und Modal schließen
    await checkUser();
    showToast('Avatar erfolgreich entfernt.');
    toggleModal(dom.profileModal.modal, false);
};

    // Medien Zähler
    const updateMediaCounter = () => {
        const counterElement = document.getElementById('media-counter');
        const currentCount = state.currentMediaClips.length;
        counterElement.textContent = `${currentCount}/${state.MAX_FRAMES} Medien`;
    };

    init();
});