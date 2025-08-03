import { BrowserContext, chromium } from '@playwright/test';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { importMetaMaskWallet, addCustomNetwork, unlockMetaMaskIfLocked } from '../helpers/metamask.helper';
import { appAuthSetup } from '../helpers/auth.helper';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.resolve(__dirname, '../storage');
const storagePath = path.join(storageDir, 'auth.json'); // Combined auth + metamask state
const userDataDir = path.join(storageDir, 'user-data-dir');
const extensionPath = path.resolve(__dirname, '../extension/metamask');

const ensureDir = (dir: string) => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`[Setup] Created directory: ${dir}`);
    }
};

async function setupMetaMask(context: BrowserContext) {
    if (existsSync(storagePath)) {
        console.log('[Setup] MetaMask already configured, trying to unlock...');
        await unlockMetaMaskIfLocked(context);
    } else {
        const extensionPage = context.pages().find(p => p.url().includes('chrome-extension'))
            ?? await context.waitForEvent('page');

        await extensionPage.bringToFront();
        await extensionPage.waitForLoadState('domcontentloaded');
        await extensionPage.waitForTimeout(4000);

        console.log('[Setup] Importing MetaMask wallet...');
        await importMetaMaskWallet(context);

        console.log('[Setup] Adding custom network...');
        await addCustomNetwork(context);

        await unlockMetaMaskIfLocked(context);

        console.log('[Setup] MetaMask setup complete.');
    }
}

export default async function globalSetup() {
    ensureDir(userDataDir);
    ensureDir(storageDir);

    const args = [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--remote-debugging-port=9222'
    ];

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: process.env.HEADLESS === 'true',
        args,
    });

    try {
        if (!existsSync(storagePath)) {
            console.log('[Setup] Running app auth setup...');
            await appAuthSetup(context);
            await context.storageState({ path: storagePath });
        }

        await setupMetaMask(context);

        await context.storageState({ path: storagePath });
        console.log(`[Setup] Saved combined auth & MetaMask state to ${storagePath}`);
    } finally {
        await context.close();
    }
}