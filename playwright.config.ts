import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    globalSetup: './setup/global.setup.ts',
    testDir: './tests',
    testMatch: ['**/*.spec.ts'],
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        // storageState: './storage/auth.json',
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
            },
        },
    ],
    outputDir: 'test-results/',
});