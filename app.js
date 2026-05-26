// Fortnite Chapter 7 Season 2 Interactive Loot Map
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
    
    // Add custom generated Fortnite map
    const mapOverlay = L.imageOverlay('fortnite_map_chapter7.png', bounds).addTo(map);
    map.fitBounds(bounds);

    // Track active marker clicked coordinates for the "Add Marker" flow
    let tempClickLatLng = null;
    let selectedMarker = null;

    // -------------------------------------------------------------
    // 2. Mock & Default Spawns (Chapter 7 Season 2 "Showdown")
    // -------------------------------------------------------------
    const defaultMarkers = [
        // Mythic Bosses
        {
            id: 'boss-ice-king',
            type: 'boss',
            title: 'The Ice King (Boss)',
            coords: [1600, 500],
            desc: 'Resides at the center of Frigid Fortress. Drops Ice King\'s Gauntlets (Mythic) and Vault Keycard.',
            votes: 215,
            rate: 100,
            comments: [
                { author: 'LootSeeker', text: 'Spawns inside the main throne hall. Bring shields!', time: '2 hours ago' },
                { author: 'NinjaFan99', text: 'Confirmed. Very high HP but gauntlets are overpowered.', time: '1 day ago' }
            ]
        },
        {
            id: 'boss-dark-voyager',
            type: 'boss',
            title: 'Dark Voyager (Boss)',
            coords: [600, 1500],
            desc: 'Located deep inside Dark Dominion. Drops Dark Voyager\'s Obliterator (Mythic Shotgun) and Vault Keycard.',
            votes: 189,
            rate: 100,
            comments: [
                { author: 'ChampsPlayer', text: 'Usually wanders near the reactor core in the lower decks.', time: '5 hours ago' }
            ]
        },
        {
            id: 'boss-squibbly',
            type: 'boss',
            title: 'Squibbly (Boss)',
            coords: [450, 600],
            desc: 'Wanders the boardwalk at Squibbly Shores. Drops Squibbly\'s Combat Assault Rifle (Mythic).',
            votes: 147,
            rate: 100,
            comments: [
                { author: 'TfueClon', text: 'Easiest boss to snipe from the ocean hills.', time: '3 days ago' }
            ]
        },
        {
            id: 'boss-zadie',
            type: 'boss',
            title: 'Zadie (Boss)',
            coords: [1000, 800],
            desc: 'Patrols the dense woodlands north of Squibbly Shores. Drops Zadie\'s Suppressed SMG (Mythic).',
            votes: 94,
            rate: 100,
            comments: [
                { author: 'ShadowX', text: 'Hard to locate, she uses active camo.', time: '12 hours ago' }
            ]
        },

        // Rare Chests
        {
            id: 'rare-chest-piano',
            type: 'rare-chest',
            title: 'Guaranteed Rare Chest (Piano Room)',
            coords: [1100, 1300],
            desc: 'Located underground in the New Sanctuary tunnels. Break the bookshelf in the piano parlor room to access.',
            votes: 310,
            rate: 98,
            comments: [
                { author: 'FortniteGG_enjoyer', text: '100% spawn rate in my last 15 games.', time: '30 mins ago' },
                { author: 'Valkyrie', text: 'Watch out, lots of players land here now.', time: '4 hours ago' }
            ]
        },
        {
            id: 'rare-chest-clawsy',
            type: 'rare-chest',
            title: 'Drawer Rare Chest (Clawsy Lodge)',
            coords: [350, 1100],
            desc: 'Disguised as a dresser/drawer on the second floor of Clawsy Lodge south house. Destroy the painting next to it to open.',
            votes: 172,
            rate: 85,
            comments: [
                { author: 'SlickRick', text: 'Sometimes it spawns as a normal chest, but rare chest rate is very high.', time: '2 days ago' }
            ]
        },
        {
            id: 'rare-chest-tower',
            type: 'rare-chest',
            title: 'Fortress Peak Rare Chest',
            coords: [1750, 420],
            desc: 'At the very top of the watchtower in Frigid Fortress, buried under a snow pile. Use your pickaxe to clear the snow.',
            votes: 245,
            rate: 90,
            comments: [
                { author: 'ColdZone', text: 'Great start spot if you can glide straight to the tower peak.', time: '1 day ago' }
            ]
        },

        // Legendary Drops / Exotics
        {
            id: 'legendary-weapon-barracks',
            type: 'legendary-weapon',
            title: 'Confirmed Legendary Heavy Sniper Spawn',
            coords: [1300, 1650],
            desc: 'Found inside the central hangar box at Builder\'s Barracks. Can be purchased from the Weapon Omat NPC for 400 gold.',
            votes: 183,
            rate: 92,
            comments: [
                { author: 'ScopeGod', text: 'NPC spawns there consistently unless killed by storm.', time: '1 day ago' }
            ]
        },
        {
            id: 'exotic-weapon-fisherman',
            type: 'exotic-weapon',
            title: 'Chug Cannon (Exotic)',
            coords: [280, 520],
            desc: 'Sold by the Fisherman NPC on the pier at Squibbly Shores for 600 Gold.',
            votes: 202,
            rate: 95,
            comments: [
                { author: 'SupportMain', text: 'Crucial for squad heals. Best rotation drop.', time: '6 hours ago' }
            ]
        },
        {
            id: 'exotic-weapon-shadow',
            type: 'exotic-weapon',
            title: 'Shadow Tracker Pistol (Exotic)',
            coords: [1050, 1450],
            desc: 'Sold by Agent Jonesy NPC inside the sanctuary main hall for 400 gold.',
            votes: 121,
            rate: 100,
            comments: [
                { author: 'PistolPete', text: 'Extremely good for pinging opponents through walls.', time: '8 hours ago' }
            ]
        },

        // Vaults
        {
            id: 'vault-sanctuary',
            type: 'vault',
            title: 'New Sanctuary High-Tier Vault',
            coords: [1020, 1200],
            desc: 'Base level of New Sanctuary. Requires Vault Keycard dropped by the woodland bosses, or a teammate to dual-scan.',
            votes: 388,
            rate: 100,
            comments: [
                { author: 'VaultHunter', text: 'Contains 3 Rare Chests and 4 Normal Chests inside!', time: '1 hour ago' }
            ]
        },
        {
            id: 'vault-frigid',
            type: 'vault',
            title: 'Frigid Fortress Vault',
            coords: [1550, 580],
            desc: 'Sub-level dungeon under the Frigid Fortress. Needs the Ice King\'s keycard.',
            votes: 290,
            rate: 100,
            comments: [
                { author: 'IceCap', text: 'Guaranteed 2 Legendary items inside standard chests.', time: '3 days ago' }
            ]
        }
    ];

    // POIs list for search auto-complete/navigation
    const pois = [
        { name: 'Frigid Fortress', coords: [1600, 500] },
        { name: 'Dark Dominion', coords: [600, 1500] },
        { name: 'Squibbly Shores', coords: [450, 600] },
        { name: 'New Sanctuary', coords: [1100, 1300] },
        { name: 'Builder\'s Barracks', coords: [1300, 1650] },
        { name: 'Clawsy Lodge', coords: [350, 1100] }
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
