import { BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authStoragePath = path.resolve(__dirname, '../storage/auth.json');

export async function appAuthSetup(context: BrowserContext) {
    if (existsSync(authStoragePath)) {
        console.log('[Auth] Auth storage already exists. Skipping auth setup.');
        return;
    }

    const page: Page = context.pages()[0] || await context.newPage();
    await page.goto(`${process.env.BASE_URL}/sign-in`);

    await page.fill('#email', process.env.LOGIN_EMAIL || '');
    await page.fill('#password', process.env.LOGIN_PASSWORD || '');

    await Promise.all([
        page.waitForURL('**/user/dashboard'),
        page.click('button[type=submit]'),
    ]);

    await context.storageState({ path: authStoragePath });
    console.log('[Auth] Auth state saved at:', authStoragePath);
}
