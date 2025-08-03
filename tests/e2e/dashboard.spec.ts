import { test, expect } from '@playwright/test';

test('Dashboard page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/user/dashboard`);
    await expect(page).toHaveTitle('User Dashboard - IDEEZA | AI Based SAAS');
});
