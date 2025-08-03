import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.resolve(__dirname, 'extension/metamask');

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    use: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 10000,
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium-with-metamask',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: [
                        `--disable-extensions-except=${extensionPath}`,
                        `--load-extension=${extensionPath}`,
                    ],
                },
            },
        },
    ],
});