import { test, expect } from '@playwright/test';

test('Open rarible and take screenshot', async ({ page }) => {
    await page.goto('https://rarible.com/', { waitUntil: 'networkidle', timeout: 30000 }); // open URL and wait till network is idle
    await page.waitForLoadState('load');   // ensure full page load
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true }); // save full-page screenshot
    await expect(page).toHaveTitle(/Rarible — aggregated NFT marketplace with rewards/i); // confirm page title includes expected text
});