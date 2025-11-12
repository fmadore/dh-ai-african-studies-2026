<script lang="ts">
	import { FooterLinkGroup, FooterLink } from 'flowbite-svelte';
</script>

<footer class="mt-auto bg-page">
	<div class="w-full px-4 py-12">
		<div class="mx-auto max-w-7xl surface-panel space-y-8 overflow-hidden">
			<!-- Logos Section -->
			<div class="flex flex-wrap items-center justify-center gap-8 pb-6 pt-8 px-6 border-b border-primary-200 dark:border-primary-800">
				<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
					<img
						src="/images/logo/VWST-logo.png"
						alt="Volkswagen Foundation"
						class="h-12 md:h-16"
					/>
				</a>
				<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
					<img
						src="/images/logo/ZMO-logo.png"
						alt="Leibniz-Zentrum Moderner Orient"
						class="h-12 md:h-16"
					/>
				</a>
				<a href="https://www.kcl.ac.uk/" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
					<img
						src="/images/logo/King's_College_London_logo.svg"
						alt="King's College London"
						class="h-12 md:h-16"
					/>
				</a>
				<a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
					<img
						src="/images/logo/uni-bayreuth-africa-multiple-logo.jpeg"
						alt="Africa Multiple Cluster of Excellence"
						class="h-12 md:h-16"
					/>
				</a>
			</div>

			<!-- Footer Links and Copyright -->
			<div class="sm:flex sm:items-center sm:justify-between px-6 pb-8">
				<span class="text-sm text-gray-600 dark:text-gray-300">
					© 2025 <a href="https://www.frederickmadore.com/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Frédérick Madore</a>
					<span class="mx-1">and</span>
					<a href="https://www.vincenthiribarren.com/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Vincent Hiribarren</a>
				</span>
				<FooterLinkGroup class="flex flex-wrap items-center mt-3 text-sm sm:mt-0 gap-4 text-gray-600 dark:text-gray-300">
					<FooterLink href="/about" class="hover:text-primary-600 dark:hover:text-primary-300 transition-colors">About</FooterLink>
				</FooterLinkGroup>
			</div>
		</div>
	</div>
</footer>
