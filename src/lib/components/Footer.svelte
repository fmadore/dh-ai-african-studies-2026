<script lang="ts">
	import { FooterLinkGroup, FooterLink } from 'flowbite-svelte';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

	const aboutHref = resolveAppPath('/about');
	const foundationLogo = resolveAssetPath('/images/logo/VWST-logo.png');
	const zmoLogo = resolveAssetPath('/images/logo/ZMO-logo.png');
	const kclLogo = resolveAssetPath("/images/logo/King's_College_London_logo.svg");
	const bayreuthLogo = resolveAssetPath('/images/logo/uni-bayreuth-africa-multiple-logo.jpeg');
</script>

<footer class="mt-auto bg-page py-16 px-4">
	<div class="content-width-wide surface-panel surface-padding stack-lg overflow-hidden">
		<!-- Logos Section -->
		<div class="surface-padding-xs border-b border-primary-200 dark:border-primary-800 flex flex-wrap items-center justify-center gap-8">
			<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-80">
				<img src={foundationLogo} alt="Volkswagen Foundation" class="h-12 md:h-16" />
			</a>
			<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-80">
				<img src={zmoLogo} alt="Leibniz-Zentrum Moderner Orient" class="h-12 md:h-16" />
			</a>
			<a href="https://www.kcl.ac.uk/" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-80">
				<img src={kclLogo} alt="King's College London" class="h-12 md:h-16" />
			</a>
			<a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-80">
				<img src={bayreuthLogo} alt="Africa Multiple Cluster of Excellence" class="h-12 md:h-16" />
			</a>
		</div>

		<!-- Footer Links -->
		<div class="surface-padding-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<span class="body-text-muted text-sm">
				© 2025 <a href="https://www.frederickmadore.com/" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-primary-600 hover:underline dark:hover:text-primary-300">Frédérick Madore</a>
				<span class="mx-1">and</span>
				<a href="https://www.vincenthiribarren.com/" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-primary-600 hover:underline dark:hover:text-primary-300">Vincent Hiribarren</a>
			</span>
			<FooterLinkGroup class="body-text flex flex-wrap items-center gap-4 text-sm">
				<FooterLink href={aboutHref} class="transition-colors hover:text-primary-600 dark:hover:text-primary-300">About</FooterLink>
			</FooterLinkGroup>
		</div>
	</div>
</footer>
