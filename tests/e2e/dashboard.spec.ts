import { test, expect } from '@playwright/test';

test('Dashboard page loads', async ({ page }) => {
    await page.goto('/user/dashboard');
    await expect(page).toHaveTitle('User Dashboard - IDEEZA | AI Based SAAS');
});