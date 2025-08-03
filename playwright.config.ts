import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionPath = path.resolve(__dirname, 'extension/metamask');
const useMetaMask = process.env.USE_METAMASK === 'true';

export default defineConfig({
    globalSetup: './setup/global.setup.ts',
    testDir: './tests',
    testMatch: ['**/*.spec.ts'],
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        storageState: './storage/auth.json',
        headless: false,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: useMetaMask ? [
                        `--disable-extensions-except=${extensionPath}`,
                        `--load-extension=${extensionPath}`,
                    ] : [],
                },
            },
        },
    ],
    outputDir: 'test-results/',
});