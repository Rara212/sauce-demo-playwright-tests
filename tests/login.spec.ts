import {test, expect} from '../fixtures';

test.use({storageState: {cookies: [], origins: []}});

test('standard user can login', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/checkout/);
});

test('locked out user sees an error', async ({loginPage}) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.error).toContainText('locked out');
});

test('empty username shows an error', async ({loginPage}) => {
    await loginPage.goto();
    await loginPage.login('', 'secret_sauce');
    await expect(loginPage.error).toContainText('Epic sadface: Username is required');
});

test('wrong password shows an error', async ({loginPage}) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong');
    await expect(loginPage.error).toContainText('do not match');
});

test('empty password shows an error', async ({loginPage}) => {
    await loginPage.goto();
    await loginPage.login('standard_user', '');
    await expect(loginPage.error).toContainText('Epic sadface: Password is required');
});

test('logout user redirected to loginpage', async ({page, loginPage, inventoryPage}) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.openMenu.click();
    await inventoryPage.logOut.click();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
}); 

test('make sure unable to access inventory without login', async ({page, loginPage}) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toContainText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
});