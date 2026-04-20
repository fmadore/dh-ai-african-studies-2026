<script lang="ts">
	import type { Participant } from '$lib/types/participant';
	import { SvelteMap } from 'svelte/reactivity';
	import { useDarkMode } from '$lib/utils/dark-mode.svelte';

	interface Props {
		participants: Participant[];
	}

	let { participants }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let tileLayer: any;
	let mapReady = $state(false);

	const darkMode = useDarkMode();
	let isDarkMode = $derived(darkMode.isDark);

	// Group participants by coordinates
	let markerGroups = $derived.by(() => {
		const groups = new SvelteMap<string, Participant[]>();

		participants.forEach((participant) => {
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
						[90, 180] // Northeast coordinates
					],
					maxBoundsViscosity: 0.9, // Keep within bounds but allow slight elastic feel
					minZoom: 2, // Prevent zooming out too far
					maxZoom: 18,
					worldCopyJump: true // Ensure the map snaps to the base world copy so markers stay visible
				});

				// Add appropriate tile layer based on theme
				const lightTiles =
					'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
				const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

				tileLayer = L.tileLayer(isDarkMode ? darkTiles : lightTiles, {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
								${participantsAtLocation
									.map(
										(p) => `
									<div class="popup-participant">
										<img
											src="${p.photoUrl}"
											alt="${p.name}"
											class="popup-avatar"
											onerror="this.style.display='none'"
										/>
										<div class="popup-details">
											${
												p.website
													? `<a href="${p.website}" target="_blank" rel="noopener noreferrer" class="popup-name popup-name-link">${p.name}</a>`
													: `<p class="popup-name">${p.name}</p>`
											}
											<p class="popup-country">${p.country}</p>
										</div>
									</div>
								`
									)
									.join('')}
							</div>
						</div>
					`;

					marker.bindPopup(popupContent, {
						maxWidth: 350,
						className: 'participant-popup'
					});
				});

				mapReady = true;
			}

			return () => {
				// Cleanup map on component destroy
				if (map) {
					map.remove();
					map = null;
					mapReady = false;
				}
			};
		});
	});

	// Update tile layer when theme changes
	$effect(() => {
		if (mapReady && tileLayer) {
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

<div class="card-surface surface-padding-xs glow-border w-full">
	<div bind:this={mapContainer} class="map-canvas"></div>
</div>

<style>
	:global(.map-canvas) {
		height: clamp(24rem, 55vw, 36rem);
		width: 100%;
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--bg-sunken);
	}

	:global(.participant-popup .leaflet-popup-content-wrapper) {
		border-radius: var(--radius-lg);
		padding: var(--space-sm);
		background: var(--bg-raised);
		color: var(--text-primary);
		border: 1px solid var(--border-default);
		box-shadow: var(--shadow-lg);
	}

	:global(.participant-popup .leaflet-popup-content) {
		margin: 0;
	}

	:global(.participant-popup .leaflet-popup-tip) {
		background: var(--bg-raised);
		border: 1px solid var(--border-default);
	}

	/* Custom scrollbar for popup */
	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.leaflet-container) {
		background: transparent !important;
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-track) {
		background: var(--bg-sunken);
		border-radius: var(--radius-sm);
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb) {
		background: var(--border-strong);
		border-radius: var(--radius-sm);
	}

	:global(.participant-popup .leaflet-popup-content div::-webkit-scrollbar-thumb:hover) {
		background: var(--text-subtle);
	}

	:global(.participant-popup .popup-card) {
		min-width: 260px;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	:global(.participant-popup .popup-title) {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-bold);
		margin: 0;
		color: var(--text-primary);
	}

	:global(.participant-popup .popup-meta) {
		font-size: var(--text-sm);
		margin: 0;
		color: var(--text-muted);
	}

	:global(.participant-popup .popup-list) {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-height: 300px;
		overflow-y: auto;
	}

	:global(.participant-popup .popup-participant) {
		display: flex;
		gap: var(--space-sm);
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--border-subtle);
		align-items: flex-start;
	}

	:global(.participant-popup .popup-participant:last-child) {
		border-bottom: none;
		padding-bottom: 0;
	}

	:global(.participant-popup .popup-avatar) {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 2px solid var(--border-accent);
		flex-shrink: 0;
	}

	:global(.participant-popup .popup-details) {
		flex: 1;
		min-width: 0;
	}

	:global(.participant-popup .popup-name) {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	:global(.participant-popup .popup-name-link) {
		display: block;
		color: var(--text-link);
		text-decoration: none;
		transition: color var(--transition-micro);
	}

	:global(.participant-popup .popup-name-link:hover) {
		color: var(--text-link-hover);
		text-decoration: underline;
	}

	:global(.participant-popup .popup-country) {
		margin: 0.125rem 0 0;
		font-size: var(--text-xs);
		color: var(--text-muted);
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
		background: var(--accent);
		position: absolute;
		transform: rotate(-45deg);
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
		box-shadow:
			var(--shadow-md),
			0 0 12px -2px rgba(13, 148, 136, 0.4);
		border: 2px solid var(--bg-raised);
	}

	:global(.marker-pin::after) {
		content: '';
		width: 14px;
		height: 14px;
		margin: 6px 0 0 6px;
		background: var(--bg-raised);
		position: absolute;
		border-radius: 50%;
	}
</style>
