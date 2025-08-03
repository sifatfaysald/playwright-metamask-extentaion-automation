import { test, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Run Main DApp Automation with MetaMask Profile', async () => {
    const userDataDir = path.resolve(__dirname, '../../user-data/metamask-profile');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
    });

    const page = await context.newPage();
    await page.goto('https://rarible.com/');
    await page.waitForTimeout(5000);
    await context.close();
});
