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
					
					// Custom marker icon
					const customIcon = L.divIcon({
						className: 'custom-map-marker',
						html: `<div class="marker-pin"></div>`,
						iconSize: [30, 30],
						iconAnchor: [15, 30],
						popupAnchor: [0, -30]
					});

					const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
					
					// Create popup content with profile photos
					const popupContent = `
						<div class="popup-card">
							<h3 class="popup-title">${participantsAtLocation[0].affiliation}</h3>
							<p class="popup-meta"><strong>${participantsAtLocation.length}</strong> participant${participantsAtLocation.length > 1 ? 's' : ''}</p>
							<div class="popup-list">
								${participantsAtLocation.map((p) => `
									<div class="popup-participant">
										<img 
											src="${p.photoUrl}" 
											alt="${p.name}"
											class="popup-avatar"
											onerror="this.style.display='none'"
										/>
										<div class="popup-details">
											<p class="popup-name">${p.name}</p>
											<p class="popup-country">${p.country}</p>
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

<div class="card-surface surface-padding-xs w-full">
	<div bind:this={mapContainer} class="map-canvas"></div>
</div>

<style>
	:global(.map-canvas) {
		height: clamp(24rem, 55vw, 36rem);
		width: 100%;
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--color-surface-100);
	}

	:global(.dark .map-canvas) {
		background: var(--color-surface-dark-base);
	}

	:global(.participant-popup .leaflet-popup-content-wrapper) {
		border-radius: var(--radius-lg);
		padding: var(--space-sm);
		background: var(--color-surface-0);
		color: var(--color-gray-900);
		border: 1px solid color-mix(in srgb, var(--color-gray-400) 40%, transparent);
		box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
	}

	:global(.dark .participant-popup .leaflet-popup-content-wrapper) {
		background: var(--color-surface-dark-elevated);
		color: var(--color-secondary-50);
		border-color: color-mix(in srgb, var(--color-gray-400) 28%, transparent);
		box-shadow: 0 14px 32px -18px rgba(2, 6, 23, 0.75);
	}

	:global(.participant-popup .leaflet-popup-content) {
		margin: 0;
	}

	:global(.participant-popup .leaflet-popup-tip) {
		background: var(--color-surface-0);
		border: 1px solid color-mix(in srgb, var(--color-gray-400) 40%, transparent);
	}

	:global(.dark .participant-popup .leaflet-popup-tip) {
		background: var(--color-surface-dark-elevated);
		border-color: color-mix(in srgb, var(--color-gray-400) 28%, transparent);
	}

	/* Custom scrollbar for popup */
	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.leaflet-container) {
		background: transparent !important;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-track) {
		background: var(--color-gray-100);
		border-radius: 3px;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb) {
		background: var(--color-gray-400);
		border-radius: 3px;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb:hover) {
		background: var(--color-gray-500);
	}

	:global(.participant-popup .popup-card) {
		min-width: 260px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	:global(.participant-popup .popup-title) {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0;
		color: inherit;
	}

	:global(.dark .participant-popup .popup-title) {
		color: var(--color-secondary-50, #f0f9ff);
	}

	:global(.participant-popup .popup-meta) {
		font-size: 0.875rem;
		margin: 0;
		color: color-mix(in srgb, var(--color-gray-600) 85%, transparent);
	}

	:global(.dark .participant-popup .popup-meta) {
		color: color-mix(in srgb, var(--color-gray-200) 75%, transparent);
	}

	:global(.participant-popup .popup-list) {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 300px;
		overflow-y: auto;
	}

	:global(.participant-popup .popup-participant) {
		display: flex;
		gap: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid color-mix(in srgb, var(--color-gray-200) 60%, transparent);
		align-items: flex-start;
	}

	:global(.participant-popup .popup-participant:last-child) {
		border-bottom: none;
		padding-bottom: 0;
	}

	:global(.dark .participant-popup .popup-participant) {
		border-color: color-mix(in srgb, var(--color-gray-500) 35%, transparent);
	}

	:global(.participant-popup .popup-avatar) {
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
		object-fit: cover;
		border: 2px solid var(--color-primary-200);
		flex-shrink: 0;
	}

	:global(.dark .participant-popup .popup-avatar) {
		border-color: var(--color-primary-700);
	}

	:global(.participant-popup .popup-details) {
		flex: 1;
		min-width: 0;
	}

	:global(.participant-popup .popup-name) {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-gray-900);
	}

	:global(.dark .participant-popup .popup-name) {
		color: var(--color-secondary-50);
	}

	:global(.participant-popup .popup-country) {
		margin: 0.15rem 0 0;
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--color-gray-600) 75%, transparent);
	}

	:global(.dark .participant-popup .popup-country) {
		color: color-mix(in srgb, var(--color-gray-200) 70%, transparent);
	}

	/* Custom Marker Styles */
	:global(.custom-map-marker) {
		background: transparent;
		border: none;
	}
	
	:global(.marker-pin) {
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 0;
		background: var(--color-primary-500);
		position: absolute;
		transform: rotate(-45deg);
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
		box-shadow: 0 3px 10px rgba(0,0,0,0.3);
		border: 2px solid white;
	}

	:global(.marker-pin::after) {
		content: '';
		width: 14px;
		height: 14px;
		margin: 6px 0 0 6px;
		background: white;
		position: absolute;
		border-radius: 50%;
	}
	
	:global(.dark .marker-pin) {
		border-color: var(--color-gray-800);
	}
	
	:global(.dark .marker-pin::after) {
		background: var(--color-gray-800);
	}
</style>
