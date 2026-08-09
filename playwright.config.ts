import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: 2,
	reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile-chromium',
			use: { ...devices['iPhone 13'], browserName: 'chromium' }
		}
	],
	webServer: {
		command: 'npm run preview -- --host 127.0.0.1 --port 4173',
		url: baseURL,
		reuseExistingServer: false,
		timeout: 30_000
	}
});
