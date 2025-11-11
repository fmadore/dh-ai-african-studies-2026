<script lang="ts">
	import type { Participant } from '$lib/types/participant';
	import { SvelteMap, createSubscriber } from 'svelte/reactivity';

	interface Props {
		participants: Participant[];
	}

	let { participants }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let tileLayer: any;

	// Create reactive dark mode detection using createSubscriber
	const darkModeSubscriber = createSubscriber((update) => {
		if (typeof window === 'undefined') return;

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					update();
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});

	// Reactive dark mode getter
	let isDarkMode = $derived.by(() => {
		if (typeof window === 'undefined') return false;
		darkModeSubscriber(); // Subscribe to changes
		return document.documentElement.classList.contains('dark');
	});

	// Group participants by coordinates
	let markerGroups = $derived.by(() => {
		const groups = new SvelteMap<string, Participant[]>();
		
		participants.forEach(participant => {
			if (participant.affiliationCoordinates) {
				const key = `${participant.affiliationCoordinates.latitude},${participant.affiliationCoordinates.longitude}`;
				if (!groups.has(key)) {
					groups.set(key, []);
				}
				groups.get(key)!.push(participant);
			}
		});
		
		return groups;
	});

	// Initialize map
	$effect(() => {
		// Dynamically import Leaflet only on client side
		if (typeof window === 'undefined') return;

		import('leaflet').then((L) => {
			if (!map && mapContainer) {
				map = L.map(mapContainer, {
					center: [20, 0],
					zoom: 2,
					zoomControl: true,
					scrollWheelZoom: true,
					// Set world bounds to prevent panning too far
					maxBounds: [
						[-90, -180], // Southwest coordinates
						[90, 180]    // Northeast coordinates
					],
					maxBoundsViscosity: 0.9, // Keep within bounds but allow slight elastic feel
					minZoom: 2, // Prevent zooming out too far
					maxZoom: 18,
					worldCopyJump: true // Ensure the map snaps to the base world copy so markers stay visible
				});

				// Add appropriate tile layer based on theme
				const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
				const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

				tileLayer = L.tileLayer(isDarkMode ? darkTiles : lightTiles, {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
					subdomains: 'abcd',
					maxZoom: 18
				}).addTo(map);

				// Add markers for each location
				markerGroups.forEach((participantsAtLocation, coordsKey) => {
					const [lat, lng] = coordsKey.split(',').map(Number);
					
					// Use default blue marker icon
					const marker = L.marker([lat, lng]).addTo(map);
					
					// Create popup content with profile photos
					const popupContent = `
						<div class="min-w-[250px]">
							<h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">${participantsAtLocation[0].affiliation}</h3>
							<p class="text-sm mb-3 text-gray-600 dark:text-gray-400"><strong>${participantsAtLocation.length}</strong> participant${participantsAtLocation.length > 1 ? 's' : ''}</p>
							<div class="space-y-3 max-h-[300px] overflow-y-auto">
								${participantsAtLocation.map(p => `
									<div class="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
										<img 
											src="${p.photoUrl}" 
											alt="${p.name}"
											class="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 flex-shrink-0"
											onerror="this.style.display='none'"
										/>
										<div class="flex-1 min-w-0">
											<p class="font-semibold text-sm text-gray-900 dark:text-gray-100">${p.name}</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">${p.country}</p>
										</div>
									</div>
								`).join('')}
							</div>
						</div>
					`;
					
					marker.bindPopup(popupContent, {
						maxWidth: 350,
						className: 'participant-popup'
					});
				});
			}

			return () => {
				// Cleanup map on component destroy
				if (map) {
					map.remove();
					map = null;
				}
			};
		});
	});

	// Update tile layer when theme changes
	$effect(() => {
		if (map && tileLayer) {
			const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
			const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
			
			tileLayer.setUrl(isDarkMode ? darkTiles : lightTiles);
		}
	});
</script>

<!-- Leaflet CSS -->
<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
</svelte:head>

<div bind:this={mapContainer} class="w-full h-[600px] rounded-lg overflow-hidden"></div>

<style>
	:global(.participant-popup .leaflet-popup-content-wrapper) {
		border-radius: 0.75rem;
		padding: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
	}
	
	:global(.participant-popup .leaflet-popup-content) {
		margin: 0;
	}

	:global(.participant-popup .leaflet-popup-tip) {
		background: white;
	}

	/* Custom scrollbar for popup */
	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.leaflet-container) {
		background: transparent !important;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-track) {
		background: #f1f1f1;
		border-radius: 3px;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb) {
		background: #888;
		border-radius: 3px;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb:hover) {
		background: #555;
	}
</style>
