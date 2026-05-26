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
        // Mythic Bosses (Confirmed Spawns & Drops)
        {
            id: 'boss-ice-king',
            type: 'boss',
            title: 'The Ice King (Mythic Boss)',
            coords: [1369.1, 1004.4],
            desc: 'Spawns at the peak of Frigid Fortress. Defeat him to drop Ice King\'s Gauntlets (Mythic) and the Ice King Vault Keycard.',
            votes: 845,
            rate: 100,
            comments: [
                { author: 'FrostyPro', text: 'Gauntlets let you do a huge frost jump and slam. Watch out for his ice freeze blast!', time: '2 hours ago' },
                { author: 'NinjaFans', text: 'Spawns inside the fortress throne room on the top level.', time: '1 day ago' }
            ]
        },
        {
            id: 'boss-dark-voyager',
            type: 'boss',
            title: 'Dark Voyager (Mythic Boss)',
            coords: [1025.0, 891.8],
            desc: 'Located inside the command deck at Dark Dominion. Drops Dark Voyager\'s Obliterator (Mythic Shotgun) and Vault Keycard.',
            votes: 792,
            rate: 100,
            comments: [
                { author: 'ShottyGod', text: 'The shotgun hits for 120 body damage. Aim for the head!', time: '5 hours ago' }
            ]
        },
        {
            id: 'boss-squibbly',
            type: 'boss',
            title: 'Squibbly (Mythic Boss)',
            coords: [1020.4, 557.9],
            desc: 'Patrols the beachfront boardwalk at Squibbly Shores. Drops Squibbly\'s Combat Assault Rifle (Mythic).',
            votes: 624,
            rate: 100,
            comments: [
                { author: 'AssaultMain', text: 'His AR has zero recoil. Super easy to laser people at long range.', time: '3 hours ago' }
            ]
        },
        {
            id: 'boss-zadie',
            type: 'boss',
            title: 'Zadie (Mythic Boss)',
            coords: [950.0, 700.0],
            desc: 'Patrols the forests north of Squibbly Shores. Drops Zadie\'s Suppressed SMG (Mythic).',
            votes: 388,
            rate: 100,
            comments: [
                { author: 'CamoHunter', text: 'She uses active camouflage, look for a slight shimmer in the trees!', time: '12 hours ago' }
            ]
        },

        // High-Tier Vaults
        {
            id: 'vault-ice-king',
            type: 'vault',
            title: 'Ice King Vault (Frigid Fortress)',
            coords: [1204.6, 1004.4],
            desc: 'Underground dungeon vault at Frigid Fortress. Requires the Ice King\'s Vault Keycard. Contains 3 guaranteed Rare Chests, legendary weapon drops, and 4 Slurp Barrels.',
            votes: 654,
            rate: 100,
            comments: [
                { author: 'LootSeeker', text: 'The entrance is down the spiral stairs in the central courtyard.', time: '1 hour ago' }
            ]
        },
        {
            id: 'vault-sanctuary',
            type: 'vault',
            title: 'New Sanctuary Sub-Vault',
            coords: [640.0, 1285.0],
            desc: 'Requires Sanctuary security keycard to scan. Holds 2 Rare Chests, 4 normal chests, and a Weapon Mod Bench.',
            votes: 512,
            rate: 100,
            comments: [
                { author: 'ModGod', text: 'Great spot to add thermal scopes and drum mags to your weapons.', time: '8 hours ago' }
            ]
        },
        {
            id: 'vault-order-crash',
            type: 'vault',
            title: 'Seven Compound Vault (Crash Site)',
            coords: [505.6, 1230.7],
            desc: 'Located inside the cargo hold of the crashed Seven ship. Requires dual scan or keycard to open. Guaranteed exotics.',
            votes: 295,
            rate: 95,
            comments: [
                { author: 'SevenLore', text: 'Usually spawns a legendary sniper and lots of shields.', time: '2 days ago' }
            ]
        },

        // Confirmed Rare Chests (Secret Rooms & Bunkers)
        {
            id: 'rare-chest-piano',
            type: 'rare-chest',
            title: 'Guaranteed Rare Chest (Mezzo-Piano Tunnel)',
            coords: [1073.7, 1022.1],
            desc: 'Secret room inside the Mezzo-Piano Tunnel. Break the fake brick wall behind the coral buddies sitting on crates to access.',
            votes: 912,
            rate: 100,
            comments: [
                { author: 'CoralFan', text: 'Easiest guaranteed rare chest spawn in Chapter 7. High-density loot spot!', time: '15 mins ago' },
                { author: 'TfueFan', text: 'Always has a gold weapon. Safe landing if you drop early.', time: '2 hours ago' }
            ]
        },
        {
            id: 'rare-chest-carmine',
            type: 'rare-chest',
            title: 'Carmine Lodge Dresser Rare Chest',
            coords: [982.2, 1015.2],
            desc: 'Second floor of Carmine Lodge. It is disguised as a dresser. Break the picture frame next to it to open the dresser.',
            votes: 472,
            rate: 94,
            comments: [
                { author: 'LodgeLoot', text: 'Very hidden! Do not pickaxe the dresser itself or it destroys the chest.', time: '3 hours ago' }
            ]
        },
        {
            id: 'rare-chest-bigfoot',
            type: 'rare-chest',
            title: 'Bigfoot\'s Cave Hidden Rare Chest',
            coords: [1412.8, 576.3],
            desc: 'Located at the very back of Bigfoot\'s Cave behind a stack of sleeping bags. Destroy the sleeping bags to reveal the chest.',
            votes: 310,
            rate: 90,
            comments: [
                { author: 'MythHunter', text: 'Also spawns a few slurp mushrooms on the floor.', time: '5 hours ago' }
            ]
        },
        {
            id: 'rare-chest-trog',
            type: 'rare-chest',
            title: 'Trog\'s Ice Cave Rare Chest',
            coords: [1289.9, 1139.3],
            desc: 'Frozen inside a block of ice in Trog\'s Cave. Hit the ice block 5 times with your pickaxe to thaw and open it.',
            votes: 245,
            rate: 92,
            comments: [
                { author: 'IceBreaker', text: 'Located in the frozen ravine area under Frigid Fortress.', time: '1 day ago' }
            ]
        },
        {
            id: 'rare-chest-frozen-shard',
            type: 'rare-chest',
            title: 'Frozen Crystal Rare Chest',
            coords: [1364.0, 902.9],
            desc: 'Buried under a glowing blue crystal shard near the frozen lake. Break the crystal shard to open.',
            votes: 189,
            rate: 85,
            comments: [
                { author: 'CrystalCollect', text: 'Make sure you have full health, breaking the shard inflicts minor cold damage.', time: '12 hours ago' }
            ]
        },
        {
            id: 'rare-chest-lighthouse',
            type: 'rare-chest',
            title: 'Squibbly Shores Lighthouse Rare Chest',
            coords: [984.3, 412.2],
            desc: 'Spawns at the very top of Squibbly Shores Lighthouse behind the searchlight controls.',
            votes: 504,
            rate: 95,
            comments: [
                { author: 'BeaconLoot', text: 'Land here directly from the bus. Great starting vantage point.', time: '4 hours ago' }
            ]
        },

        // Exotic / Legendary Weapon Drops & Sellers
        {
            id: 'exotic-chug-cannon',
            type: 'exotic-weapon',
            title: 'Chug Cannon (Exotic Seller)',
            coords: [530.0, 1010.0],
            desc: 'Sold by the Fisherman NPC on the pier at Squibbly Shores for 600 Gold.',
            votes: 592,
            rate: 100,
            comments: [
                { author: 'Chugger', text: 'Heals shields for your entire squad, has a 20s cooldown per charge.', time: '2 hours ago' }
            ]
        },
        {
            id: 'legendary-sniper-seller',
            type: 'legendary-weapon',
            title: 'Legendary Heavy Sniper / Grapple Blade',
            coords: [1538.3, 1224.0],
            desc: 'Sold by the Tactical NPC at Latte Landing for 400 Gold.',
            votes: 418,
            rate: 100,
            comments: [
                { author: 'GrappleKing', text: 'Get the grapple blade here, it makes navigating the cliffs extremely easy.', time: '1 hour ago' }
            ]
        },
        {
            id: 'legendary-lightning-gun',
            type: 'legendary-weapon',
            title: 'Guaranteed Arc Lightning Gun (Area 51 Bunker)',
            coords: [1371.5, 430.3],
            desc: 'Hidden inside the pyramid bunker basement. Activate the red blast door switch to open the vault containing this legendary gun.',
            votes: 629,
            rate: 95,
            comments: [
                { author: 'TeslaFan', text: 'Shoots chain lightning that damages multiple enemies. Awesome for squad matches!', time: '30 mins ago' }
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
