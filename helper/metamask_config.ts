import { BrowserContext } from '@playwright/test';
import dotenv from 'dotenv';
import { MetaMaskLocators as L } from '../utils/metamask.locators';

dotenv.config();

export const setupMetaMask = async (context: BrowserContext) => {
    const seedPhrase = process.env.SEED_PHRASE;
    const password = process.env.WALLET_PASSWORD;

    if (!seedPhrase) throw new Error('SEED_PHRASE missing in .env');
    if (!password) throw new Error('WALLET_PASSWORD missing in .env');

    const extensionPage = context.pages().find(p => p.url().includes('chrome-extension'))
        ?? await context.waitForEvent('page');

    await extensionPage.waitForTimeout(3000);

    // Import wallet flow
    await extensionPage.click(L.import.termsCheckbox);
    await extensionPage.click(L.import.importWalletBtn);
    await extensionPage.click(L.import.agreeBtn);

    const seedWords = seedPhrase.split(' ');
    for (let i = 0; i < seedWords.length; i++) {
        await extensionPage.fill(L.import.seedInput(i), seedWords[i]);
    }

    await extensionPage.click(L.import.confirmImportBtn);
    await extensionPage.fill(L.password.new, password);
    await extensionPage.fill(L.password.confirm, password);
    await extensionPage.click(L.password.termsCheckbox);
    await extensionPage.click(L.password.importBtn);

    try {
        await extensionPage.click(L.complete.doneBtn, { timeout: 5000 });
    } catch {
        console.log('All Done button skipped');
    }

    try {
        await extensionPage.click(L.complete.pinNext, { timeout: 5000 });
        await extensionPage.click(L.complete.pinDone, { timeout: 5000 });
    } catch {
        console.log('Pin extension flow skipped');
    }

    try {
        await extensionPage.click(L.complete.notNow, { timeout: 5000 });
    } catch {
        console.log('Not Now button skipped');
    }
};

export const addCustomNetwork = async (context: BrowserContext) => {
    const extensionPage = context.pages().find(p => p.url().includes('chrome-extension'))
        ?? await context.waitForEvent('page');

    await extensionPage.bringToFront();
    await extensionPage.waitForTimeout(3000);

    const makeButtonVisible = async (selector: string) => {
        await extensionPage.evaluate((sel) => {
            const btn = document.querySelector(sel);
            if (btn && btn instanceof HTMLElement) {
                btn.style.display = 'flex';
            }
        }, selector);
    };

    const networkBtn = await extensionPage.$(L.network.networkButton);
    if (!networkBtn) throw new Error('Network dropdown not found!');
    if (!(await networkBtn.isVisible())) {
        await makeButtonVisible(L.network.networkButton);
    }

    await networkBtn.scrollIntoViewIfNeeded();
    await networkBtn.click();
    await extensionPage.click(L.network.addCustomNetworkBtn);

    await extensionPage.fill(L.network.networkNameInput, 'Base Sepolia Testnet');
    await extensionPage.fill(L.network.chainIdInput, '84532');
    await extensionPage.fill(L.network.symbolInput, 'ETH');

    await extensionPage.click(L.network.addRpcDropdown);
    await extensionPage.click(L.network.addRpcUrlBtn);
    await extensionPage.fill(L.network.rpcUrlInput, 'https://84532.rpc.thirdweb.com');
    await extensionPage.fill(L.network.rpcNameInput, 'Base Sepolia RPC');
    await extensionPage.click(L.network.addRpcConfirmBtn);

    await extensionPage.click(L.network.addExplorerDropdown);
    await extensionPage.click(L.network.addExplorerUrlBtn);
    await extensionPage.fill(L.network.explorerUrlInput, 'https://base-sepolia.blockscout.com');
    await extensionPage.click(L.network.addRpcConfirmBtn);

    await extensionPage.waitForSelector(L.network.saveButton, { timeout: 5000 });
    await extensionPage.click(L.network.saveButton);
    await extensionPage.waitForTimeout(3000);

    const dropdownBtn = await extensionPage.$(L.network.networkButton);
    if (dropdownBtn && !(await dropdownBtn.isVisible())) {
        await makeButtonVisible(L.network.networkButton);
    }
    await dropdownBtn?.click();

    try {
        await extensionPage.waitForSelector(L.network.networkOption, { timeout: 5000 });
        await extensionPage.click(L.network.networkOption);
        await extensionPage.waitForTimeout(2000);
        console.log('Successfully selected Base Sepolia Testnet');
    } catch (error) {
        console.error('Failed to select Base Sepolia Testnet:', error);
    }
};
