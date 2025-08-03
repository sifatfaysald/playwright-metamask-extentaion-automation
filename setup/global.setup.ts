import { BrowserContext, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { importMetaMaskWallet, addCustomNetwork } from '../helpers/metamask.helper';
import { appAuthSetup } from '../helpers/auth.helper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.resolve(__dirname, '../storage');
const metamaskStoragePath = path.join(storageDir, 'metamask.json');
const userDataDir = path.join(storageDir, 'user-data-dir');
const extensionPath = path.resolve(__dirname, '../extension/metamask');

const ensureDir = (dir: string) => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`[Setup] Created directory: ${dir}`);
    }
};

async function setupMetaMask(context: BrowserContext) {
    if (existsSync(metamaskStoragePath)) {
        console.log('[Setup] MetaMask already configured.');
        return;
    }

    const extensionPage = context.pages().find(p => p.url().includes('chrome-extension'))
        ?? await context.waitForEvent('page');

    await extensionPage.bringToFront();
    await extensionPage.waitForLoadState('domcontentloaded');
    await extensionPage.waitForTimeout(4000);

    console.log('[Setup] Importing MetaMask wallet...');
    await importMetaMaskWallet(context);

    console.log('[Setup] Adding custom network...');
    await addCustomNetwork(context);

    await context.storageState({ path: metamaskStoragePath });
    console.log('[Setup] MetaMask setup complete.');
}

export default async function globalSetup() {
    ensureDir(userDataDir);

    const args = [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--remote-debugging-port=9222',
    ];

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: process.env.HEADLESS === 'true',
        args,
    });

    try {
        await setupMetaMask(context);
        await appAuthSetup(context);
    } finally {
        await context.close();
    }
}