import {Page, Locator} from '@playwright/test';
import {expect} from '@playwright/test';

export class InventoryPage {
    readonly title: Locator;
    readonly items: Locator;
    readonly cartBadge: Locator;
    readonly sortDropdown: Locator;
    readonly openMenu: Locator;
    readonly logOut: Locator;
    readonly itemPrices: Locator;

    constructor (private page: Page) {
        this.title = page.getByTestId('title');
        this.items = page.getByTestId('inventory-item-name');
        this.cartBadge = page.getByTestId('shopping-cart-badge');
        this.sortDropdown = page.getByTestId('product-sort-container');
        this.openMenu = page.getByRole('button', {name: 'Open Menu'});
        this.logOut = page.getByTestId('logout-sidebar-link');
        this.itemPrices = page.getByTestId('inventory-item-price');
    }

    async addToCart(productSlug: string) {
        await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
    }

}