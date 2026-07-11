<script lang="ts">
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

	const aboutHref = resolveAppPath('/about');
	const foundationLogo = resolveAssetPath('/images/logo/VWST-logo.jpg');
	const zmoLogo = resolveAssetPath('/images/logo/ZMO-logo.png');
	const kclLogo = resolveAssetPath("/images/logo/King's_College_London_logo.svg");
	const bayreuthLogo = resolveAssetPath('/images/logo/uni-bayreuth-africa-multiple-logo.jpeg');
</script>

<footer class="bg-page padding-block-xl padding-inline-lg relative mt-auto overflow-hidden">
	<!-- Grid mesh background -->
	<div class="bg-grid-mesh opacity-40"></div>
	<!-- Subtle radial glow accent -->
	<div class="bg-radial-glow-bottom"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative overflow-hidden">
		<!-- Logos Section — each logo sits on a light chip so dark-on-transparent
		     logos stay legible in dark mode -->
		<div
			class="surface-padding-xs divider-primary flex flex-wrap items-center justify-center gap-6"
		>
			<a
				href="https://www.volkswagenstiftung.de/en"
				target="_blank"
				rel="noopener noreferrer"
				class="logo-link logo-chip"
			>
				<img src={foundationLogo} alt="Volkswagen Foundation" class="logo-image" />
			</a>
			<a
				href="https://www.zmo.de/en"
				target="_blank"
				rel="noopener noreferrer"
				class="logo-link logo-chip"
			>
				<img src={zmoLogo} alt="Leibniz-Zentrum Moderner Orient" class="logo-image" />
			</a>
			<a
				href="https://www.kcl.ac.uk/"
				target="_blank"
				rel="noopener noreferrer"
				class="logo-link logo-chip"
			>
				<img src={kclLogo} alt="King's College London" class="logo-image" />
			</a>
			<a
				href="https://www.africamultiple.uni-bayreuth.de/en/index.html"
				target="_blank"
				rel="noopener noreferrer"
				class="logo-link logo-chip"
			>
				<img src={bayreuthLogo} alt="Africa Multiple Cluster of Excellence" class="logo-image" />
			</a>
		</div>

		<!-- Footer Links -->
		<div
			class="surface-padding-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<span class="body-text-muted text-sm"
				>© 2026 <a
					href="https://www.frederickmadore.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="link-subtle">Frédérick Madore</a
				>
				and
				<a
					href="https://www.vincenthiribarren.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="link-subtle">Vincent Hiribarren</a
				></span
			>
			<nav class="body-text flex flex-wrap items-center gap-4 text-sm" aria-label="Footer">
				<a href={aboutHref} class="link-subtle">About</a>
			</nav>
		</div>
	</div>
</footer>

<style>
	.logo-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-md);
		background: #ffffff;
		border: 1px solid var(--border-subtle);
		opacity: 0.92;
		transition:
			opacity var(--transition-micro),
			box-shadow var(--transition-micro);
	}

	.logo-chip:hover {
		opacity: 1;
		box-shadow: var(--shadow-sm);
	}
</style>
