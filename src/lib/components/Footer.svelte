<script lang="ts">
	import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from 'flowbite-svelte';
</script>

<Footer class="mt-auto bg-transparent">
	<div class="w-full px-4 py-12">
		<div class="mx-auto max-w-7xl surface-panel surface-padding space-y-8">
			<!-- Logos Section -->
			<div class="flex flex-wrap items-center justify-center gap-8 pb-6 border-b border-primary-200 dark:border-primary-800">
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
			</div>

			<!-- Footer Links and Copyright -->
			<div class="sm:flex sm:items-center sm:justify-between">
				<span class="text-sm text-gray-600 dark:text-gray-300">
					© 2025 <a href="https://www.frederickmadore.com/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Frédérick Madore</a>
				</span>
				<FooterLinkGroup class="flex flex-wrap items-center mt-3 text-sm sm:mt-0 gap-4 text-gray-600 dark:text-gray-300">
					<FooterLink href="/about" class="hover:text-primary-600 dark:hover:text-primary-300 transition-colors">About</FooterLink>
					<FooterLink href="/contact" class="hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Contact</FooterLink>
					<FooterLink href="/privacy" class="hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Privacy Policy</FooterLink>
				</FooterLinkGroup>
			</div>
		</div>
	</div>
</Footer>
