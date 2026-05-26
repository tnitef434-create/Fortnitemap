// Fortnite Interactive Loot Map (Golden Coast Map)
// Powered by Leaflet.js

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Initial Map Setup (CRS.Simple for custom image overlay)
    // -------------------------------------------------------------
    const mapContainer = document.getElementById('map');
    const mapWidth = 2048;
    const mapHeight = 2048;

    const map = L.map('map', {
        minZoom: -2,
        maxZoom: 2,
        center: [mapHeight / 2, mapWidth / 2],
        zoom: -1,
        crs: L.CRS.Simple,
        zoomControl: false // Positioned manually later
    });

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Map bounds
    const bounds = [[0, 0], [mapHeight, mapWidth]];
    
    // Add real Fortnite Chapter 7 Season 2 (Golden Coast) map image from CDN
    const mapOverlay = L.imageOverlay('https://static.wikia.nocookie.net/fortnite/images/d/d7/Golden_Coast_%28Update_v40.00%29_-_Island_-_Fortnite.png/revision/latest?cb=20260319135747', bounds).addTo(map);
    map.fitBounds(bounds);

    // Track active marker clicked coordinates for the "Add Marker" flow
    let tempClickLatLng = null;
    let selectedMarker = null;

    // -------------------------------------------------------------
    // 2. Real Fortnite Map Loot Spawns (Chapter 7 Season 2 - Showdown)
    // -------------------------------------------------------------
    const defaultMarkers = [
        // Mythic Bosses
        {
            id: 'boss-ice-king',
            type: 'boss',
            title: 'The Ice King (Boss)',
            coords: [1369.1, 1004.4],
            desc: 'Spawns at the center of Frigid Fortress. Defeat him to get Ice King\'s Gauntlets (Mythic) and a Vault Keycard.',
            votes: 488,
            rate: 100,
            comments: [
                { author: 'ChampsIce', text: 'Drops the gauntlets which grant frost jump and slam. Very OP!', time: '1 hour ago' },
                { author: 'LootSeeker', text: 'His fortress has a lot of verticality. Watch out for snipers.', time: '1 day ago' }
            ]
        },
        {
            id: 'boss-dark-voyager',
            type: 'boss',
            title: 'Dark Voyager (Boss)',
            coords: [1025.0, 891.8],
            desc: 'Located inside the main reactor core at Dark Dominion. Drops Dark Voyager\'s Obliterator (Mythic Shotgun) and Vault Keycard.',
            votes: 521,
            rate: 100,
            comments: [
                { author: 'ShottyMain', text: 'Drops the best shotgun this season. Spawns in the basement control room.', time: '4 hours ago' }
            ]
        },
        {
            id: 'boss-squibbly',
            type: 'boss',
            title: 'Squibbly (Boss)',
            coords: [1020.4, 557.9],
            desc: 'Wanders the pier boardwalk at Squibbly Shores. Drops Squibbly\'s Combat Assault Rifle (Mythic).',
            votes: 395,
            rate: 100,
            comments: [
                { author: 'BeachGlide', text: 'Keep distance; his rifle has laser accuracy.', time: '12 hours ago' }
            ]
        },
        {
            id: 'boss-zadie',
            type: 'boss',
            title: 'Zadie (Boss)',
            coords: [950.0, 700.0],
            desc: 'Patrols the dense woodlands north of Squibbly Shores. Drops Zadie\'s Suppressed SMG (Mythic).',
            votes: 219,
            rate: 100,
            comments: [
                { author: 'Ghosty', text: 'She uses active camo! Listen for the low humming sound.', time: '8 hours ago' }
            ]
        },

        // Vaults
        {
            id: 'vault-sanctuary',
            type: 'vault',
            title: 'New Sanctuary Vault',
            coords: [640.0, 1285.0],
            desc: 'Located at the subterranean base of New Sanctuary. Requires finding a Sanctuary Keycard. Contains 3 Rare Chests.',
            votes: 412,
            rate: 100,
            comments: [
                { author: 'VaultCracker', text: 'Inside the tunnel network. High tier loot benchmark.', time: '2 hours ago' }
            ]
        },
        {
            id: 'vault-frigid',
            type: 'vault',
            title: 'Frigid Fortress Vault',
            coords: [1350.0, 950.0],
            desc: 'South of Frigid Fortress. Needs the Ice King\'s keycard to open. Guaranteed 2 Legendary items.',
            votes: 304,
            rate: 100,
            comments: [
                { author: 'ColdVault', text: 'Usually spawns with 3 shield barrels outside the door.', time: '2 days ago' }
            ]
        },

        // Rare Chests (Confirmed Spawns)
        {
            id: 'rare-chest-piano',
            type: 'rare-chest',
            title: 'Secret Piano Room Rare Chest',
            coords: [600.0, 1200.0],
            desc: 'Access by breaking a fake wall in the underground bunker network near New Sanctuary.',
            votes: 567,
            rate: 100,
            comments: [
                { author: 'PianoMan', text: '100% spawn rate. Break the bookshelf next to the piano.', time: '30 mins ago' }
            ]
        },
        {
            id: 'rare-chest-carmine',
            type: 'rare-chest',
            title: 'Carmine Lodge Drawer Rare Chest',
            coords: [982.1, 1015.2],
            desc: 'Disguised as a dresser/drawer on the second floor of Carmine Lodge. Destroy the picture frame next to it to unlock.',
            votes: 283,
            rate: 88,
            comments: [
                { author: 'LodgeHunter', text: 'Super easy drop spot. Almost always a gold weapon inside.', time: '3 hours ago' }
            ]
        },

        // Exotic / Legendary Weapon Sites
        {
            id: 'exotic-chug-cannon',
            type: 'exotic-weapon',
            title: 'Chug Cannon (Exotic)',
            coords: [1010.0, 530.0],
            desc: 'Purchased from the Fisherman NPC on the pier at Squibbly Shores for 600 Gold.',
            votes: 442,
            rate: 100,
            comments: [
                { author: 'SquadHealer', text: 'Essential for heals, recharging is fairly quick.', time: '1 hour ago' }
            ]
        },
        {
            id: 'legendary-sniper',
            type: 'legendary-weapon',
            title: 'Legendary Heavy Sniper / Grapple Blade',
            coords: [1538.3, 1224.0],
            desc: 'Sold by the Tactical NPC at Latte Landing for 400 Gold.',
            votes: 319,
            rate: 95,
            comments: [
                { author: 'SniperAim', text: 'Easy rotation. Buy the Grapple Blade for mountain climbing.', time: '5 hours ago' }
            ]
        }
    ];

    // POIs list for search auto-complete/navigation
    const pois = [
        { name: 'New Sanctuary', coords: [1285.0, 624.0] },
        { name: 'Squibbly Shores', coords: [557.9, 1020.4] },
        { name: 'Dark Dominion', coords: [891.8, 1025.0] },
        { name: 'Frigid Fortress', coords: [1004.4, 1369.1] },
        { name: 'Battlewood Boulevard', coords: [754.5, 555.1] },
        { name: 'Sandy Strip', coords: [1324.1, 1115.1] },
        { name: 'Sus Studios', coords: [1043.0, 668.6] },
        { name: 'Ripped Tides', coords: [386.1, 613.1] },
        { name: 'Humble Hills', coords: [562.9, 824.5] },
        { name: 'Fore Fields', coords: [1565.0, 1062.5] },
        { name: 'Painted Palms', coords: [1392.5, 1386.8] },
        { name: 'Latte Landing', coords: [1224.0, 1538.3] },
        { name: 'Wonkeeland', coords: [695.5, 1437.5] },
        { name: 'Tiptop Terrace', coords: [430.3, 1371.5] }
    ];

    // Initialize local storage markers list if not present
    let activeFilters = {
        'all': true,
        'rare-chest': true,
        'legendary-weapon': true,
        'exotic-weapon': true,
        'boss': true,
        'vault': true
    };

    let userMarkers = JSON.parse(localStorage.getItem('fortnite_user_markers')) || [];
    let allMarkers = [...defaultMarkers, ...userMarkers];
    let markerInstances = {}; // Store reference to Leaflet marker objects

    // -------------------------------------------------------------
    // 3. Icon Generator Helper
    // -------------------------------------------------------------
    function createMarkerIcon(type) {
        let iconHtml = '';
        switch(type) {
            case 'rare-chest':
                iconHtml = '<div class="marker-pin-outer rare-chest"><i class="fa-solid fa-gem"></i></div>';
                break;
            case 'legendary-weapon':
                iconHtml = '<div class="marker-pin-outer legendary-weapon"><i class="fa-solid fa-gun"></i></div>';
                break;
            case 'exotic-weapon':
                iconHtml = '<div class="marker-pin-outer exotic-weapon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>';
                break;
            case 'boss':
                iconHtml = '<div class="marker-pin-outer boss"><i class="fa-solid fa-skull"></i></div>';
                break;
            case 'vault':
                iconHtml = '<div class="marker-pin-outer vault"><i class="fa-solid fa-vault"></i></div>';
                break;
        }

        return L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    }

    // -------------------------------------------------------------
    // 4. Render Markers on Map
    // -------------------------------------------------------------
    function renderMarkers() {
        // Clear existing markers from map first
        Object.values(markerInstances).forEach(marker => map.removeLayer(marker));
        markerInstances = {};

        allMarkers.forEach(data => {
            // Apply filter rules
            if (!activeFilters['all'] && !activeFilters[data.type]) return;
            if (activeFilters['all'] && !activeFilters[data.type]) return;

            const marker = L.marker(data.coords, { icon: createMarkerIcon(data.type) });
            
            // Marker click handler
            marker.on('click', () => {
                showMarkerDetails(data);
            });

            marker.addTo(map);
            markerInstances[data.id] = marker;
        });
    }

    // -------------------------------------------------------------
    // 5. Show Side-panel Loot Details
    // -------------------------------------------------------------
    function showMarkerDetails(data) {
        selectedMarker = data;
        
        document.getElementById('detailsPanel').querySelector('.panel-placeholder').classList.add('hidden');
        const content = document.getElementById('panelContent');
        content.classList.remove('hidden');

        // Update elements
        const badge = document.getElementById('lootBadge');
        badge.className = `loot-badge ${data.type}`;
        badge.innerText = data.type.replace('-', ' ');

        document.getElementById('lootTitle').innerText = data.title;
        document.getElementById('lootCoords').innerText = `[LAT: ${data.coords[0].toFixed(1)}, LNG: ${data.coords[1].toFixed(1)}]`;
        document.getElementById('lootDesc').innerText = data.desc;
        document.getElementById('spawnRate').innerText = `${data.rate}%`;
        document.getElementById('votesCount').innerText = data.votes;

        // Render comments
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        if (data.comments && data.comments.length > 0) {
            data.comments.forEach(comment => {
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `
                    <div class="comment-meta">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${comment.time}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                `;
                commentsList.appendChild(item);
            });
        } else {
            commentsList.innerHTML = '<p style="font-size: 12px; color: var(--text-secondary); text-align: center; padding: 10px;">No reviews yet. Be the first!</p>';
        }

        // Scroll sidebar to show details
        document.querySelector('.sidebar').scrollTop = document.getElementById('detailsPanel').offsetTop;
    }

    // -------------------------------------------------------------
    // 6. Map Interactivity & Custom Markers Submission
    // -------------------------------------------------------------
    map.on('mousemove', (e) => {
        document.getElementById('hudLat').innerText = e.latlng.lat.toFixed(1);
        document.getElementById('hudLng').innerText = e.latlng.lng.toFixed(1);
    });

    map.on('click', (e) => {
        // If clicking map outside markers, open add marker flow
        tempClickLatLng = [e.latlng.lat, e.latlng.lng];
        
        document.getElementById('addMarkerFormContainer').classList.remove('hidden');
        document.getElementById('markerTitle').focus();
        
        // Temporarily put cursor coordinates in placeholders
        document.getElementById('markerDesc').placeholder = `Drop details at coordinates [${e.latlng.lat.toFixed(1)}, ${e.latlng.lng.toFixed(1)}]`;
    });

    // Form cancellation
    document.getElementById('btnCancelMarker').addEventListener('click', () => {
        document.getElementById('addMarkerFormContainer').classList.add('hidden');
        document.getElementById('addMarkerForm').reset();
        tempClickLatLng = null;
    });

    // Handle Custom Marker Submit
    document.getElementById('addMarkerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!tempClickLatLng) return;

        const newMarker = {
            id: `user-${Date.now()}`,
            type: document.getElementById('markerType').value,
            title: document.getElementById('markerTitle').value,
            coords: tempClickLatLng,
            desc: document.getElementById('markerDesc').value,
            votes: 1,
            rate: 100,
            comments: [
                { author: 'You', text: 'Submitted this spawn spot!', time: 'Just now' }
            ]
        };

        userMarkers.push(newMarker);
        localStorage.setItem('fortnite_user_markers', JSON.stringify(userMarkers));
        allMarkers.push(newMarker);

        // Re-render
        renderMarkers();
        showMarkerDetails(newMarker);

        // Reset form
        document.getElementById('addMarkerForm').reset();
        document.getElementById('addMarkerFormContainer').classList.add('hidden');
        tempClickLatLng = null;
    });

    // -------------------------------------------------------------
    // 7. Verify / Flag Actions
    // -------------------------------------------------------------
    document.getElementById('btnVerify').addEventListener('click', () => {
        if (!selectedMarker) return;

        selectedMarker.votes += 1;
        // recalculate rate slightly as positive vote
        if (selectedMarker.rate < 100) {
            selectedMarker.rate = Math.min(100, selectedMarker.rate + 1);
        }
        
        updateSelectedMarkerInStore();
    });

    document.getElementById('btnFlag').addEventListener('click', () => {
        if (!selectedMarker) return;

        selectedMarker.votes += 1;
        selectedMarker.rate = Math.max(0, selectedMarker.rate - 5); // reduce spawn credibility rate
        
        updateSelectedMarkerInStore();
    });

    function updateSelectedMarkerInStore() {
        document.getElementById('votesCount').innerText = selectedMarker.votes;
        document.getElementById('spawnRate').innerText = `${selectedMarker.rate}%`;

        // Save back to userMarkers or default edits
        const userIdx = userMarkers.findIndex(m => m.id === selectedMarker.id);
        if (userIdx > -1) {
            userMarkers[userIdx] = selectedMarker;
            localStorage.setItem('fortnite_user_markers', JSON.stringify(userMarkers));
        } else {
            // Edit default markers in memory
            const defaultIdx = defaultMarkers.findIndex(m => m.id === selectedMarker.id);
            if (defaultIdx > -1) {
                defaultMarkers[defaultIdx] = selectedMarker;
            }
        }
    }

    // -------------------------------------------------------------
    // 8. Custom Comments Submission
    // -------------------------------------------------------------
    document.getElementById('commentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedMarker) return;

        const commentInput = document.getElementById('commentInput');
        const text = commentInput.value.trim();
        if (!text) return;

        const newComment = {
            author: 'AnonymousPlayer',
            text: text,
            time: 'Just now'
        };

        if (!selectedMarker.comments) {
            selectedMarker.comments = [];
        }
        selectedMarker.comments.push(newComment);

        updateSelectedMarkerInStore();
        showMarkerDetails(selectedMarker); // refresh comments list
        commentInput.value = '';
    });

    // -------------------------------------------------------------
    // 9. Filters Handling
    // -------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.dataset.filter;

            if (filterVal === 'all') {
                const willBeActive = !btn.classList.contains('active');
                filterButtons.forEach(b => {
                    if (willBeActive) {
                        b.classList.remove('inactive');
                        b.classList.add('active');
                        activeFilters[b.dataset.filter] = true;
                    } else {
                        b.classList.remove('active');
                        b.classList.add('inactive');
                        activeFilters[b.dataset.filter] = false;
                    }
                });
            } else {
                btn.classList.toggle('active');
                btn.classList.toggle('inactive');
                activeFilters[filterVal] = btn.classList.contains('active');

                // If any filter is disabled, "All" filter button is unchecked
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                const anyInactive = Array.from(filterButtons).some(b => b.dataset.filter !== 'all' && b.classList.contains('inactive'));
                if (anyInactive) {
                    allBtn.classList.remove('active');
                    allBtn.classList.add('inactive');
                    activeFilters['all'] = false;
                } else {
                    allBtn.classList.add('active');
                    allBtn.classList.remove('inactive');
                    activeFilters['all'] = true;
                }
            }

            renderMarkers();
        });
    });

    // -------------------------------------------------------------
    // 10. POI Search & Pan
    // -------------------------------------------------------------
    const poiSearch = document.getElementById('poiSearch');
    poiSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;

        const foundPoi = pois.find(poi => poi.name.toLowerCase().includes(query));
        if (foundPoi) {
            map.panTo(foundPoi.coords);
            map.setZoom(0);
        }
    });

    // Initial render
    renderMarkers();
});
