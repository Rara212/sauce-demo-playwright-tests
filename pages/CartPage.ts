import {Page, Locator} from '@playwright/test';

export class CartPage {
    readonly items: Locator;
    readonly itemNames: Locator;
    readonly checkoutButton: Locator;
    readonly continueShoppingButton: Locator;

    constructor (private page: Page) {
        this.items = page.getByTestId('inventory-item');
        this.itemNames = page.getByTestId('inventory-item-name')
        this.checkoutButton = page.getByTestId('checkout');
        this.continueShoppingButton = page.getByTestId('continue-shopping');
    }

    async removeItem(productSlug: string) {
        await this.page.getByTestId(`remove-${productSlug}`).click();
    }
    async checkout() {
        await this.checkoutButton.click();
    }


}