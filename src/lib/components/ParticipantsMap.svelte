<script lang="ts">
	import type { Participant } from '$lib/types/participant';
	import type * as Leaflet from 'leaflet';
	// maplibre-gl is pinned to v5 on purpose. @maplibre/maplibre-gl-leaflet@0.1.4
	// added v6 support against 6.3.0, and something in 6.4-6.6 broke the pairing:
	// the style, sprite and TileJSON all resolve, but the map never marks its
	// sources dirty, so it renders the style's background colour and requests not
	// one tile. Symptom is a blank coloured rectangle with the markers on top and
	// no console error. Re-test with a real render before widening this range.
	import type { Map as MaplibreMap } from 'maplibre-gl';
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

	// $state because the element now lives in an {#if} branch: the binding can
	// come and go, and a plain let would not re-run anything that reads it.
	let mapContainer = $state<HTMLDivElement | undefined>(undefined);
	let map: Leaflet.Map | null = null;
	let glMap: MaplibreMap | null = null;
	// Which style URL the GL map is currently showing. Plain `let`, not $state:
	// the theme effect writes it, and making it reactive would re-trigger that
	// effect. setStyle() tears down and refetches the whole style, so calling it
	// with the style already in place is not a no-op — it re-enters the load
	// while the first one is still settling and the map ends up clean-but-empty,
	// never requesting a single tile.
	let appliedStyle: string | null = null;
	let mapReady = $state(false);
	let mapFailed = $state(false);

	// OpenFreeMap vector styles. CARTO began watermarking keyless raster tiles
	// and is considering freezing that endpoint entirely; OpenFreeMap needs no
	// key and no account, and its Positron/Dark pair is the same cartography
	// this map was already borrowing.
	const STYLE_URLS = {
		light: 'https://tiles.openfreemap.org/styles/positron',
		dark: 'https://tiles.openfreemap.org/styles/dark'
	} as const;

	// The style JSON carries no attribution of its own, so OpenFreeMap's
	// required credit is stated on Leaflet's control instead.
	const ATTRIBUTION =
		'<a href="https://openfreemap.org">OpenFreeMap</a> ' +
		'<a href="https://www.openmaptiles.org/">&copy; OpenMapTiles</a> ' +
		'Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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

		Promise.all([import('leaflet'), import('@maplibre/maplibre-gl-leaflet')])
			.then(([L, { maplibreGL }]) => {
				if (destroyed || map || !mapContainer) return;
				map = L.map(mapContainer, {
					center: [20, 0],
					zoom: 2,
					zoomControl: true,
					scrollWheelZoom: true,
					// Set world bounds to prevent panning too far. Web Mercator
					// tops out near +/-85.05 degrees: MapLibre clamps there while
					// Leaflet would happily pan to the poles, which slides the GL
					// canvas out from under the markers.
					maxBounds: [
						[-85, -180], // Southwest coordinates
						[85, 180] // Northeast coordinates
					],
					maxBoundsViscosity: 0.9, // Keep within bounds but allow slight elastic feel
					minZoom: 2, // Prevent zooming out too far
					maxZoom: 18,
					worldCopyJump: true // Ensure the map snaps to the base world copy so markers stay visible
				});

				// Add the vector basemap for the current theme. MapLibre would
				// draw its own attribution inside the canvas; suppressed so the
				// credit sits in Leaflet's control with the rest of the chrome.
				appliedStyle = initialDark ? STYLE_URLS.dark : STYLE_URLS.light;
				glMap = maplibreGL({
					style: appliedStyle,
					attributionControl: false
				})
					.addTo(map)
					.getMaplibreMap();
				map.attributionControl.addAttribution(ATTRIBUTION);

				// Add markers for each location
				groups.forEach((participantsAtLocation, coordsKey) => {
					const [lat, lng] = coordsKey.split(',').map(Number);
					const affiliation = participantsAtLocation[0].affiliation;
					const participantCount = participantsAtLocation.length;
					const markerLabel = `Show ${participantCount} participant${participantCount === 1 ? '' : 's'} from ${affiliation}`;

					// The visual pin stays compact while its surrounding Leaflet icon offers a
					// 44px target for touch and keyboard users.
					const customIcon = L.divIcon({
						className: 'custom-map-marker',
						html: '<span class="marker-hit-area"><span class="marker-pin"></span></span>',
						iconSize: [44, 44],
						iconAnchor: [22, 43],
						popupAnchor: [0, -43]
					});

					const marker = L.marker([lat, lng], {
						icon: customIcon,
						keyboard: true,
						title: markerLabel,
						alt: markerLabel
					});

					marker.on('add', () => {
						const element = marker.getElement();
						element?.setAttribute('aria-label', markerLabel);
						element?.setAttribute('title', markerLabel);
						element?.setAttribute('role', 'button');
					});

					marker.addTo(map!);

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
											width="40"
											height="40"
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
						marker.on('click', () => onselectlocation(affiliation));
					}
				});

				mapReady = true;
			})
			.catch(() => {
				// A failed chunk load (flaky network) should degrade to a stated
				// alternative, not an empty grey rectangle.
				if (!destroyed) mapFailed = true;
			});

		return () => {
			// Cleanup map on component destroy
			destroyed = true;
			if (map) {
				map.remove();
				map = null;
				glMap = null;
				mapReady = false;
			}
		};
	});

	// Update basemap when theme changes
	$effect(() => {
		const nextStyle = isDarkMode ? STYLE_URLS.dark : STYLE_URLS.light;
		if (mapReady && glMap && appliedStyle !== nextStyle) {
			appliedStyle = nextStyle;
			glMap.setStyle(nextStyle);
		}
	});
</script>

{#if mapFailed}
	<div class="map-canvas map-canvas--failed" role="status">
		<p class="map-failed__lead">The interactive map could not be loaded.</p>
		<p class="map-failed__body">
			The directory above lists every participant with their affiliation and country.
		</p>
	</div>
{:else}
	<div bind:this={mapContainer} class="map-canvas"></div>
{/if}

<style>
	:global(.map-canvas) {
		height: clamp(22rem, 48vw, 32rem);
		width: 100%;
		overflow: hidden;
		background: var(--bg-sunken);
	}

	/* Leaflet ships 30px zoom buttons; DESIGN.md puts map chrome on the same
	   2.75rem coarse-pointer floor as every other control. */
	@media (pointer: coarse) {
		:global(.map-canvas .leaflet-control-zoom a) {
			width: 2.75rem;
			height: 2.75rem;
			line-height: 2.75rem;
			font-size: 1.25rem;
		}
	}

	/* Same footprint as the map it replaces, in the system's empty-state
	   silhouette, so a failed chunk load doesn't collapse the page rhythm. */
	.map-canvas--failed {
		display: grid;
		place-content: center;
		gap: var(--space-2xs);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-xl);
		text-align: center;
		padding: var(--space-lg);
	}

	.map-failed__lead {
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.map-failed__body {
		font-size: var(--text-sm);
		color: var(--text-muted);
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

	/* maplibre-gl.css is 83 KB of control, popup, marker and gesture rules for
	   chrome this layer never renders: the GL map is created non-interactive
	   with its attribution control off, so Leaflet owns every gesture and every
	   piece of visible UI. These are the two rules that actually position the
	   canvas, lifted from that stylesheet rather than shipping all of it. */
	:global(.maplibregl-map) {
		position: relative;
		overflow: hidden;
	}

	:global(.maplibregl-canvas) {
		position: absolute;
		top: 0;
		left: 0;
	}

	/* Leaflet's translucent white attribution plate blends into dark map tiles,
	   dropping its default blue links below AA contrast. Use the site's semantic
	   surface and link tokens so the legal attribution remains readable in both
	   themes. */
	:global(.leaflet-control-attribution) {
		background: var(--bg-raised) !important;
		color: var(--text-muted);
	}

	:global(.leaflet-control-attribution a) {
		color: var(--text-link);
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

	:global(.marker-hit-area) {
		display: block;
		width: 44px;
		height: 44px;
		position: relative;
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
		box-shadow: var(--shadow-md);
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
