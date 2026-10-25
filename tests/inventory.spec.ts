import { test, expect } from '../fixtures';

test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
});

test('inventory shows 6 products', async ({ loginPage, inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
})

test('sort by price low to high', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.sortDropdown.selectOption('lohi');

    const prices = await inventoryPage.itemPrices.allTextContents();
    const numbers = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
});

test('sort by price high to low', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.sortDropdown.selectOption('hilo');

    const prices = await inventoryPage.itemPrices.allTextContents();
    const numbers = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...numbers].sort((a, b) => b - a);
    expect(numbers).toEqual(sorted);
});

test('sort item names based descending', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.sortDropdown.selectOption('za');

    const names = await inventoryPage.items.allTextContents();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
});

