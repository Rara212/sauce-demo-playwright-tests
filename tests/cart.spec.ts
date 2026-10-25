import {test, expect} from '../fixtures';

test.beforeEach(async ({page}) => {
    await page.goto('/inventory.html');
});

test('adding two items and updates the cart badge', async ({inventoryPage}) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await expect(inventoryPage.cartBadge).toHaveText('2'); 
});

test('cart lists the items that were added', async ({page, inventoryPage, cartPage}) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.cartBadge.click();
    await expect(page).toHaveURL(/cart/);
    await expect(cartPage.items).toHaveCount(2);
});

test('removing an item from the cart and check the cart badge updates', async ({inventoryPage, cartPage}) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.cartBadge.click();
    await cartPage.removeItem('sauce-labs-backpack');
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText('Sauce Labs Bike Light');
});

test('checkout button opens checkout step one', async ({page, inventoryPage, cartPage}) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.cartBadge.click();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);

});