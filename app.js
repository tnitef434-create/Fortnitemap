// Fortnite Interactive Loot Map (Helios Map)
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
    
    // Add real Fortnite Chapter 5 Season 1 map image from CDN
    const mapOverlay = L.imageOverlay('https://static.wikia.nocookie.net/fortnite/images/2/21/Helios_%28Update_v28.00%29_-_Island_-_Fortnite.png/revision/latest?cb=20231206212959', bounds).addTo(map);
    map.fitBounds(bounds);

    // Track active marker clicked coordinates for the "Add Marker" flow
    let tempClickLatLng = null;
    let selectedMarker = null;

    // -------------------------------------------------------------
    // 2. Real Fortnite Map Loot Spawns (Helios Map)
    // -------------------------------------------------------------
    const defaultMarkers = [
        // Mythic Bosses
        {
            id: 'boss-oscar',
            type: 'boss',
            title: 'Oscar (Boss)',
            coords: [1417.5, 940.5],
            desc: 'Located inside the main mansion at Lavish Lair. Defeat him to get Oscar\'s Frenzy Auto Shotgun (Mythic) and his Society Medallion.',
            votes: 512,
            rate: 100,
            comments: [
                { author: 'ShottyGod', text: 'His auto shotgun is insane for close combat. Try to keep distance.', time: '2 hours ago' },
                { author: 'LootGamer', text: 'Spawns in the central ballroom floor.', time: '1 day ago' }
            ]
        },
        {
            id: 'boss-valeria',
            type: 'boss',
            title: 'Valeria (Boss)',
            coords: [1097.5, 1343.7],
            desc: 'Located in the grand railway station at Reckless Railways. Defeat her to get Valeria\'s Hyper SMG (Mythic) and her Society Medallion.',
            votes: 418,
            rate: 100,
            comments: [
                { author: 'Speedy', text: 'She throws firefly jars. Watch out for fire damage!', time: '4 hours ago' }
            ]
        },
        {
            id: 'boss-peter-griffin',
            type: 'boss',
            title: 'Peter Griffin (Boss)',
            coords: [441.6, 535.6],
            desc: 'Located at the estate house in Snooty Steppes. Defeat him to get Peter Griffin\'s Hammer Pump Shotgun (Mythic) and his Society Medallion.',
            votes: 789,
            rate: 100,
            comments: [
                { author: 'FamilyGuyFan', text: 'He does the bird is the word dance if you get knocked! Hilarious.', time: '10 mins ago' }
            ]
        },
        {
            id: 'boss-nisha',
            type: 'boss',
            title: 'Nisha (Boss)',
            coords: [675.3, 922.7],
            desc: 'Located in the gardens of Fencing Fields. Defeat her to get Nisha\'s Striker Assault Rifle (Mythic) and her Society Medallion.',
            votes: 611,
            rate: 100,
            comments: [
                { author: 'StrikerLover', text: 'Best AR in the game right now. She has really good aim, use cover.', time: '3 hours ago' }
            ]
        },
        {
            id: 'boss-montague',
            type: 'boss',
            title: 'Montague (Boss)',
            coords: [1082.6, 1716.1],
            desc: 'Located inside the Grand Glacier hotel. Defeat him to get Montague\'s Enforcer Assault Rifle (Mythic) and his Society Medallion.',
            votes: 356,
            rate: 100,
            comments: [
                { author: 'SniperScope', text: 'He spawns on the top floor of the hotel balcony.', time: '12 hours ago' }
            ]
        },

        // Vaults (Guaranteed high tier weapons and rare chests)
        {
            id: 'vault-lavish',
            type: 'vault',
            title: 'Lavish Lair Society Vault',
            coords: [1425.0, 955.0],
            desc: 'Requires Oscar\'s Medallion to unlock. Contains multiple rare chests, weapon mod bench, and guaranteed legendary items.',
            votes: 450,
            rate: 100,
            comments: [
                { author: 'ModderX', text: 'Has a weapon modification bench inside. Mod your weapons here!', time: '1 hour ago' }
            ]
        },
        {
            id: 'vault-fencing',
            type: 'vault',
            title: 'Fencing Fields Society Vault',
            coords: [690.0, 930.0],
            desc: 'Requires Nisha\'s Medallion to unlock. Down in the basement wine cellar. Contains high tier loot chest spawns.',
            votes: 399,
            rate: 100,
            comments: [
                { author: 'WineCellar', text: 'Behind the brick wall in the main cellar room.', time: '5 hours ago' }
            ]
        },
        {
            id: 'vault-grand',
            type: 'vault',
            title: 'Grand Glacier Society Vault',
            coords: [1090.0, 1730.0],
            desc: 'Requires Montague\'s Medallion to unlock. Located in the hotel basement.',
            votes: 211,
            rate: 100,
            comments: [
                { author: 'SnowyLoot', text: 'Perfect setup after killing Montague.', time: '3 days ago' }
            ]
        },

        // Rare Chests (Confirmed Spawns)
        {
            id: 'rare-chest-ruined',
            type: 'rare-chest',
            title: 'Guaranteed Rare Chest (Ruined Reels)',
            coords: [960.0, 915.0],
            desc: 'Hidden inside the brick tunnel beneath the main amphitheater screen structure.',
            votes: 342,
            rate: 98,
            comments: [
                { author: 'RuinsExplorer', text: 'Under the floorboards in the projector room.', time: '20 mins ago' }
            ]
        },
        {
            id: 'rare-chest-roost',
            type: 'rare-chest',
            title: 'Rebel\'s Roost Attic Rare Chest',
            coords: [1610.0, 608.0],
            desc: 'Located at the very top attic space in the main ruined mansion. Break the wooden ceiling to climb up.',
            votes: 195,
            rate: 92,
            comments: [
                { author: 'RebelLoot', text: 'Highly active landing spot, but guaranteed high tier sniper or shield.', time: '8 hours ago' }
            ]
        },
        {
            id: 'rare-chest-yacht',
            type: 'rare-chest',
            title: 'The Marigold Yacht Rare Chest',
            coords: [992.2, 321.6],
            desc: 'Located in the captain\'s cabin room on the second deck of The Marigold yacht.',
            votes: 289,
            rate: 94,
            comments: [
                { author: 'Sailor', text: 'Right next to the golden vault door.', time: '4 hours ago' }
            ]
        },

        // Exotic / Legendary Weapon Sellers
        {
            id: 'exotic-chug-cannon',
            type: 'exotic-weapon',
            title: 'Chug Cannon Exotic Spawn',
            coords: [822.0, 546.8],
            desc: 'Can be purchased from the NPC at Pleasant Piazza for 600 Gold bars.',
            votes: 412,
            rate: 96,
            comments: [
                { author: 'Medic', text: 'Best item for support players. Heals 15 shield/health per shot!', time: '1 hour ago' }
            ]
        },
        {
            id: 'legendary-grapple-blade',
            type: 'legendary-weapon',
            title: 'Grapple Blade (Legendary Rarity)',
            coords: [1569.8, 1375.7],
            desc: 'Can be purchased from the Trainer NPC at Classy Courts for 400 Gold bars.',
            votes: 219,
            rate: 100,
            comments: [
                { author: 'SpiderMan', text: 'Infinite mobility, great for getting up the steep mountains.', time: '3 hours ago' }
            ]
        }
    ];

    // POIs list for search auto-complete/navigation
    const pois = [
        { name: 'Lavish Lair', coords: [1417.5, 940.5] },
        { name: 'Reckless Railways', coords: [1097.5, 1343.7] },
        { name: 'Snooty Steppes', coords: [441.6, 535.6] },
        { name: 'Fencing Fields', coords: [675.3, 922.7] },
        { name: 'Grand Glacier', coords: [1082.6, 1716.1] },
        { name: 'Ruined Reels', coords: [960.0, 915.0] },
        { name: 'Rebel\'s Roost', coords: [1610.0, 608.0] },
        { name: 'Classy Courts', coords: [1569.8, 1375.7] }
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
