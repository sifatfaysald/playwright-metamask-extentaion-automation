import { BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';
import { MetaMaskLocators as L } from '../utils/metamask.locators';

dotenv.config();

export async function getMetaMaskPage(context: BrowserContext): Promise<Page> {
    let page = context.pages().find(p => p.url().includes('chrome-extension'));
    if (!page) {
        page = await context.waitForEvent('page', { timeout: 60000 });
    }
    await page.bringToFront();
    await page.waitForLoadState('domcontentloaded');
    return page;
}

export async function importMetaMaskWallet(context: BrowserContext) {
    const seedPhrase = process.env.SEED_PHRASE;
    const password = process.env.WALLET_PASSWORD;

    if (!seedPhrase || !password) {
        throw new Error('Missing SEED_PHRASE or WALLET_PASSWORD in .env');
    }

    const page = await getMetaMaskPage(context);
    await page.waitForTimeout(3000);

    await page.click(L.import.termsCheckbox);
    await page.click(L.import.importWalletBtn);
    await page.click(L.import.agreeBtn);

    const seedWords = seedPhrase.split(' ');
    for (let i = 0; i < seedWords.length; i++) {
        await page.fill(L.import.seedInput(i), seedWords[i]);
    }

    await page.click(L.import.confirmImportBtn);
    await page.fill(L.password.new, password);
    await page.fill(L.password.confirm, password);
    await page.click(L.password.termsCheckbox);
    await page.click(L.password.importBtn);

    try {
        await page.click(L.complete.doneBtn, { timeout: 5000 });
    } catch {}

    try {
        await page.click(L.complete.pinNext, { timeout: 5000 });
        await page.click(L.complete.pinDone, { timeout: 5000 });
    } catch {}

    try {
        await page.click(L.complete.notNow, { timeout: 5000 });
    } catch {}
}

export async function unlockMetaMaskIfLocked(context: BrowserContext) {
    const page = await getMetaMaskPage(context);
    const unlockInput = await page.$('input[data-testid="unlock-password"]');
    if (unlockInput) {
        console.log('[MetaMask] Unlocking...');
        await unlockInput.fill(process.env.WALLET_PASSWORD || '');
        await page.click('button[data-testid="unlock-submit"]');
        await page.waitForTimeout(3000);
    } else {
        console.log('[MetaMask] Already unlocked.');
    }
}

export async function addCustomNetwork(context: BrowserContext) {
    const page = await getMetaMaskPage(context);
    await page.waitForTimeout(3000);

    const makeButtonVisible = async (selector: string) => {
        await page.evaluate((sel) => {
            const btn = document.querySelector(sel);
            if (btn && btn instanceof HTMLElement) {
                btn.style.display = 'flex';
            }
        }, selector);
    };

    const networkBtn = await page.$(L.network.networkButton);
    if (!networkBtn) throw new Error('Network dropdown not found!');
    if (!(await networkBtn.isVisible())) {
        await makeButtonVisible(L.network.networkButton);
    }

    await networkBtn.scrollIntoViewIfNeeded();
    await networkBtn.click();
    await page.click(L.network.addCustomNetworkBtn);

    await page.fill(L.network.networkNameInput, 'Base Sepolia Testnet');
    await page.fill(L.network.chainIdInput, '84532');
    await page.fill(L.network.symbolInput, 'ETH');

    await page.click(L.network.addRpcDropdown);
    await page.click(L.network.addRpcUrlBtn);
    await page.fill(L.network.rpcUrlInput, 'https://84532.rpc.thirdweb.com');
    await page.fill(L.network.rpcNameInput, 'Base Sepolia RPC');
    await page.click(L.network.addRpcConfirmBtn);

    await page.click(L.network.addExplorerDropdown);
    await page.click(L.network.addExplorerUrlBtn);
    await page.fill(L.network.explorerUrlInput, 'https://base-sepolia.blockscout.com');
    await page.click(L.network.addRpcConfirmBtn);

    await page.waitForSelector(L.network.saveButton, { timeout: 5000 });
    await page.click(L.network.saveButton);
    await page.waitForTimeout(3000);

    const dropdownBtn = await page.$(L.network.networkButton);
    if (dropdownBtn && !(await dropdownBtn.isVisible())) {
        await makeButtonVisible(L.network.networkButton);
    }
    await dropdownBtn?.click();

    try {
        await page.waitForSelector(L.network.networkOption, { timeout: 5000 });
        await page.click(L.network.networkOption);
        await page.waitForTimeout(2000);
        console.log('Successfully selected Base Sepolia Testnet');
    } catch (error) {
        console.error('Failed to select Base Sepolia Testnet:', error);
    }
}
