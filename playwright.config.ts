import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.resolve(__dirname, 'extension/metamask');

export default defineConfig({
    testDir: './tests',
    globalSetup: './setup/global-setup.ts',
    timeout: 30000,
    use: {
        headless: false,
        storageState: path.resolve(__dirname, 'storage/auth.json'),
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