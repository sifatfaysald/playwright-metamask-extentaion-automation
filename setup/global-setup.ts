import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup(config: FullConfig) {
    const extensionPath = path.resolve(__dirname, '../extension/metamask');
    const userDataDir = path.resolve(__dirname, '../user-data/metamask-profile');
    const storageStatePath = path.resolve(__dirname, '../storage/auth.json');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
        ],
    });

    const page = await context.newPage();
    await page.goto('chrome://extensions');

    console.log('MetaMask Persistent Context Loaded.');

    await context.storageState({ path: storageStatePath });
    await context.close();
}

export default globalSetup;