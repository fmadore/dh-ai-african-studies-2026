<script lang="ts">
	import type { Participant } from '$lib/types/participant';
	import type * as Leaflet from 'leaflet';
	import { useDarkMode } from '$lib/utils/dark-mode.svelte';
	import 'leaflet/dist/leaflet.css';

	interface Props {
		participants: Participant[];
		/**
		 * Called with an institution name when its pin is clicked, so a host
		 * page can filter a directory below the map. The map is the most
		 * compelling artefact on the participants page; making it a control
		 * rather than an illustration is most of its value.
		 */
		onselectlocation?: (_affiliation: string) => void;
	}

	let { participants, onselectlocation }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: Leaflet.Map | null = null;
	let tileLayer: Leaflet.TileLayer | null = null;
	let mapReady = $state(false);

	const TILE_URLS = {
		light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
		dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
	} as const;

	const darkMode = useDarkMode();
	let isDarkMode = $derived(darkMode.isDark);

	function escapeHtml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	// Group participants by coordinates. A plain Map is intentional: markers
	// are only built once at init, so reactive tracking would be wasted.
	let markerGroups = $derived.by(() => {
		const groups = new Map<string, Participant[]>(); // eslint-disable-line svelte/prefer-svelte-reactivity

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

		// Snapshot reactive values synchronously so the effect tracks them
		const groups = markerGroups;
		const initialDark = isDarkMode;
		let destroyed = false;

		import('leaflet').then((L) => {
			if (destroyed || map || !mapContainer) return;
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
			tileLayer = L.tileLayer(initialDark ? TILE_URLS.dark : TILE_URLS.light, {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 18
			}).addTo(map);

			// Add markers for each location
			groups.forEach((participantsAtLocation, coordsKey) => {
				const [lat, lng] = coordsKey.split(',').map(Number);

				// Custom marker icon
				const customIcon = L.divIcon({
					className: 'custom-map-marker',
					html: `<div class="marker-pin"></div>`,
					iconSize: [30, 30],
					iconAnchor: [15, 30],
					popupAnchor: [0, -30]
				});

				const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map!);

				// Create popup content with profile photos
				const popupContent = `
						<div class="popup-card">
							<h3 class="popup-title">${escapeHtml(participantsAtLocation[0].affiliation)}</h3>
							<p class="popup-meta"><strong>${participantsAtLocation.length}</strong> participant${participantsAtLocation.length > 1 ? 's' : ''}</p>
							<div class="popup-list">
								${participantsAtLocation
									.map(
										(p) => `
									<div class="popup-participant">
										${
											p.photoUrl
												? `<img
											src="${escapeHtml(p.photoUrl)}"
											alt="${escapeHtml(p.name)}"
											class="popup-avatar"
											loading="lazy"
											onerror="this.style.display='none'"
										/>`
												: ''
										}
										<div class="popup-details">
											${
												p.website
													? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener noreferrer" class="popup-name popup-name-link">${escapeHtml(p.name)}</a>`
													: `<p class="popup-name">${escapeHtml(p.name)}</p>`
											}
											<p class="popup-country">${escapeHtml(p.country)}</p>
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

				if (onselectlocation) {
					const affiliation = participantsAtLocation[0].affiliation;
					marker.on('click', () => onselectlocation(affiliation));
				}
			});

			mapReady = true;
		});

		return () => {
			// Cleanup map on component destroy
			destroyed = true;
			if (map) {
				map.remove();
				map = null;
				tileLayer = null;
				mapReady = false;
			}
		};
	});

	// Update tile layer when theme changes
	$effect(() => {
		if (mapReady && tileLayer) {
			tileLayer.setUrl(isDarkMode ? TILE_URLS.dark : TILE_URLS.light);
		}
	});
</script>

<div bind:this={mapContainer} class="map-canvas"></div>

<style>
	:global(.map-canvas) {
		height: clamp(22rem, 48vw, 32rem);
		width: 100%;
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
