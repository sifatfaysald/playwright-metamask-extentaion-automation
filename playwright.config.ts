import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, 'extension/metamask');

export default defineConfig({
    globalSetup: './setup/global.setup.ts',
    testDir: './tests',
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        headless: false,
        storageState: './storage/auth.json',
        launchOptions: {
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
                '--remote-debugging-port=9222'
            ],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],
});
