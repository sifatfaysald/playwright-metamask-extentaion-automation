import { test, expect } from '../../../fixtures/extension.fixture';

test('SauceDemo login and take screenshot', async ({ context }) => {
    const page = await context.newPage();

    await page.goto('https://www.saucedemo.com/');
    await page.fill('input[data-test="username"]', 'standard_user');
    await page.fill('input[data-test="password"]', 'secret_sauce');
    await page.click('input[data-test="login-button"]');

    await page.waitForSelector('.inventory_list');
    await page.screenshot({ path: 'screenshot/products-list.png' });

    expect(page.url()).toContain('/inventory.html');
    await page.waitForTimeout(6000)
});