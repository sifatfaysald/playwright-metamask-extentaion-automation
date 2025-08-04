import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

import { setupMetaMask, addCustomNetwork } from '../helpers/metamask.helper';
import { performAuthLogin } from '../helpers/auth.helper';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToExtension = path.resolve(__dirname, '../extension/metamask');
const userDataDir = path.resolve(__dirname, '../storage/user-data-dir');
const authStoragePath = path.resolve(__dirname, '../storage/auth.json');
const setupFlagFile = path.join(userDataDir, 'metamask-setup-done');

export default async function globalSetup() {
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ],
    });

    try {
        // MetaMask Setup and Network Add
        if (!fs.existsSync(setupFlagFile)) {
            await setupMetaMask(context);
            await addCustomNetwork(context);
            fs.writeFileSync(setupFlagFile, 'done');
            console.log('MetaMask setup & network added successfully!');
        } else {
            console.log('MetaMask already setup, skipping setup');
        }

        // Auth Login & Storage Save
        if (!fs.existsSync(authStoragePath)) {
            await performAuthLogin(context);
            await context.storageState({ path: authStoragePath });
            console.log(`Auth storage saved at: ${authStoragePath}`);
        } else {
            console.log('Auth storage already exists, skipping auth login');
        }
    } catch (error) {
        console.error('Global setup failed:', error);
        throw error;
    } finally {
        await context.close();
    }
}