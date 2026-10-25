import {test as setup, expect} from '@playwright/test';

setup('authenticate', async ({page}) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/inventory/);
    await page.context().storageState({path: '.auth/user.json'});
});