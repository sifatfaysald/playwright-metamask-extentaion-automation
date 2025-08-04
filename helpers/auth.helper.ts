import { BrowserContext } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export async function performAuthLogin(context: BrowserContext) {
    const page = context.pages()[0] || await context.newPage();

    await page.goto(`${process.env.BASE_URL}/sign-in`, { waitUntil: 'domcontentloaded' });

    await page.fill('#email', process.env.LOGIN_EMAIL || '');
    await page.fill('#password', process.env.LOGIN_PASSWORD || '');

    await Promise.all([
        page.waitForURL('**/user/dashboard'),
        page.click('button[type=submit]'),
    ]);

    console.log('[Auth] Login successful');
}
