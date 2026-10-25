import {Page, Locator} from '@playwright/test';

export class CheckoutPage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly postalCodeInput: Locator;
    readonly continueButton: Locator;
    readonly cancelButton: Locator;
    readonly finishButton: Locator;
    readonly errorMessage: Locator;
    readonly completeHeader: Locator;
    readonly subtotalLabel: Locator;
    readonly taxLabel: Locator;
    readonly totalLabel: Locator;


    constructor (private page: Page) {
        this.firstNameInput = page.getByTestId('firstName');
        this.lastNameInput = page.getByTestId('lastName');
        this.postalCodeInput = page.getByTestId('postalCode');
        this.continueButton = page.getByTestId('continue');
        this.cancelButton = page.getByTestId('cancel');
        this.finishButton = page.getByTestId('finish');
        this.errorMessage = page.getByTestId('error');
        this.completeHeader = page.getByTestId('complete-header');
        this.subtotalLabel = page.getByTestId('subtotal-label');
        this.taxLabel = page.getByTestId('tax-label');
        this.totalLabel = page.getByTestId('total-label');
    }

    async fillCheckoutForm(firstName: string, lastName: string, postalCode: string) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
    }

    async continue() {
        await this.continueButton.click();
    }

    async cancel() {
        await this.cancelButton.click();
    }

    async finish () {
        await this.finishButton.click();
    }

}