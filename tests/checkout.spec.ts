import { test, expect } from '../fixtures';

test.beforeEach(async ({ page, loginPage, inventoryPage, cartPage }) => {
    await page.goto('/inventory.html');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.cartBadge.click();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);
});

test('user can complete a purchase', async ({ page, checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('John', 'Doe', '12345');
    await checkoutPage.continue();
    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(page).toHaveURL(/checkout-complete/);
});

test('user cancel from step 1', async ({ page, checkoutPage }) => {
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/cart/);
});

test('user successfully cancels checkout from step 2', async ({ page, checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('John', 'Doe', '12345');
    await checkoutPage.continue();
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/inventory/);
});

test('user missing first name shows error', async ({ checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('', 'Doe', '12345');
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
});

test('user missing last name shows error', async ({ checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('John', '', '12345');
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toHaveText('Error: Last Name is required');
});

test('user missing zip code shows error', async ({ checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('John', 'Doe', '');
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toHaveText('Error: Postal Code is required');
});

const toNumber = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));

test('make sure order total is correct', async ({ checkoutPage }) => {
    await checkoutPage.fillCheckoutForm('John', 'Doe', '12345');
    await checkoutPage.continue();
    await expect(checkoutPage.finishButton).toBeVisible();

    const subtotal = toNumber(await checkoutPage.subtotalLabel.innerText());
    const tax = toNumber(await checkoutPage.taxLabel.innerText());
    const total = toNumber(await checkoutPage.totalLabel.innerText());

    expect(subtotal + tax).toBeCloseTo(total, 2);
    expect(subtotal).toBeCloseTo(29.99, 2);   // the backpack's price
});
