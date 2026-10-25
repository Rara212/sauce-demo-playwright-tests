# Dev Log

Problems hit while building the Sauce Demo Playwright suite, with what caused
them and what I learned. Entries are grouped by phase.

## Setup and config

### 2026-10-22: `process` not found, then deprecated `tsc`
**Symptom:** TS error on `process.env.CI` in `playwright.config.ts`, even after installing `@types/node`. Later, `npx tsc --noEmit` printed "This is not the tsc command you are looking for".
**Cause:** (1) Newer TypeScript doesn't auto-load `@types` packages, so `tsconfig.json` needed `"types": ["node"]`. (2) `typescript` wasn't installed locally, so `npx` ran an unrelated deprecated package named `tsc`.
**Fix:** Installed `@types/node` and `typescript` as dev dependencies and added `"types": ["node"]` to `tsconfig.json`.
**Lesson:** Read the whole error message (the part I skipped was the fix). Install tools explicitly instead of letting `npx` guess.

### 2026-10-24: `getByTestId('Username')` timed out
**Symptom:** Test failed after 30s with "waiting for getByTestId('Username')".
**Cause:** Test IDs are case-sensitive and must match the `data-test` value exactly. I used `Username`/`Login` instead of `username`/`login-button`.
**Fix:** Inspected the page in DevTools and used the real attribute values.
**Lesson:** Verify test IDs in DevTools instead of guessing from visible text.

## Test writing

### 2026-10-24: Logout test timed out at 30s
**Symptom:** Test timed out, and the page snapshot showed the inventory page with the menu still closed.
**Cause:** A menu locator in `InventoryPage` was wrong, so an action waited 30s for an element that never became clickable. (Exact original value not recorded.)
**Fix:** Corrected the menu locators in `InventoryPage`.
**Lesson:** A timeout with no locator in the message means an action was waiting. The Test Steps list shows which one.

### 2026-10-24: Sort test failed because option and comparator disagreed
**Symptom:** `toEqual` failed. Received was ascending, expected was descending.
**Cause:** The test selected `'az'` but compared against a descending sort (`b.localeCompare(a)`). The app was right.
**Fix:** Selected `'za'` for descending and kept `'az'` for ascending.
**Lesson:** When a test computes its own expected value, a mismatch between the action and the expectation looks like an app bug. Check which side is wrong first.

### 2026-10-24: Wrong error text for missing zip
**Symptom:** `toHaveText` failed after 5s. Expected `"Error: Zip/Postal Code is required"`, received `"Error: Postal Code is required"`.
**Cause:** I assumed the wording instead of triggering the error by hand first. The locator resolved fine (`<h3 role="alert" data-test="error">`), so only the expected string was wrong.
**Fix:** Copied the exact text from the page snapshot in the report.
**Lesson:** Take expected strings from the real app, not from memory. The Received line and the YAML snapshot show exactly what to use.

### 2026-10-24: `' '` is not the same as an empty field
**Symptom:** (Caught in review before running.) The "missing first name" and "missing last name" tests filled the field with a single space.
**Cause:** A space is a value, so the form may not show "First Name is required". The zip test also had a stray trailing space in `'Doe '`.
**Fix:** Passed `''` for the field under test and removed the trailing space.
**Lesson:** To test a missing field, leave it empty. Whitespace-only input is a separate behaviour worth its own test.

### 2026-10-24: `${productSlug}` never interpolated
**Symptom:** (Caught in review before running.) `removeItem` would have timed out looking for a test ID literally named `remove-${productSlug}`.
**Cause:** `${}` only interpolates inside backticks. In single quotes it is plain text, and TypeScript can't flag it because both are valid strings.
**Fix:** Used a template literal: `` `remove-${productSlug}` ``.
**Lesson:** The compiler can't catch this. Only a test that actually calls the method will.

### 2026-10-24: `expect(cartPage).toHaveURL(...)` didn't compile
**Symptom:** TypeScript error on the URL assertion in the checkout step of the cart test.
**Cause:** `toHaveURL` works on Playwright's `Page`, not on my page object class. Page objects wrap a page, they aren't one.
**Fix:** Requested the `page` fixture in the test and asserted on that.
**Lesson:** Keep URL checks in the test, using `page`. Page objects hold locators and actions only.

## Reliability and speed

### 2026-10-24: Login test received `about:blank`
**Symptom:** `toHaveURL(/inventory/)` failed, received `"about:blank"`.
**Cause:** I removed the `goto`/`login` lines from the login test while cleaning up for storageState. Login tests must still log in through the UI.
**Fix:** Restored the two lines.
**Lesson:** `about:blank` means the test never navigated.

### 2026-10-24: storageState gave no speedup
**What I did:** Added a setup project that logs in once and saves the session. Cart, checkout and inventory tests reuse it.
**Result:** `--repeat-each=10` took 1.0m (220 passed) before and 1.1m (221 passed, including setup) after. The plain `npx playwright test` baseline was not recorded.
**Cause:** Sauce Demo's login is a fast client-side form, and each test still needs a full page load.
**Lesson:** Measure before assuming an optimization helps. storageState pays off when login is slow (APIs, SSO, MFA). Here it mainly removes repeated login steps from the test bodies.

## CI

### 2026-10-24: First CI run
**Result:** Green on the first push, 46s total (tests 13s).
**Annotations:** Node 20 deprecation warning for the actions, and a notice that `ubuntu-latest` is migrating to Ubuntu 26.
**Lesson:** A green first run doesn't make the pipeline trustworthy yet. I still needed to prove it can fail and that I can debug a failure from the artifact alone.

### 2026-10-24: Debugging a deliberate CI failure
**What I did:** Changed the login test's expected URL to `/checkout/` and pushed.
**Where the cause showed up:** The downloaded HTML report: Expected `/checkout/`, Received `inventory.html`, with a page snapshot showing the Products page.
**What I saw:** CI retried the test twice (`retries: 2`), and the report included a trace from the first retry.
**Lesson:** The Actions annotation only said "exit code 1". The step log and the report artifact held the real cause, so uploading the report with `!cancelled()` matters.

## Deliberate experiments

Failures I caused on purpose to learn how Playwright reports them.

### 2026-10-22: Wrong URL assertion
**What I did:** Changed `toHaveURL(/inventory/)` to `/checkout/`.
**What I saw:** Failed after 5000ms. Expected `/checkout/`, received `inventory.html`.
**Lesson:** The call log shows the assertion retried 14 times. The snapshot showed login had worked, so the test was wrong, not the app.

### 2026-10-22: Wrong password
**What I did:** Used a wrong password.
**What I saw:** `toHaveURL(/inventory/)` failed, received `https://www.saucedemo.com/` (still on login). The snapshot showed the alert "Username and password do not match any user in this service".
**Lesson:** The snapshot shows page state at failure, so I can diagnose without re-running. That alert text is what my negative login test asserts on.

### 2026-10-22: Locator typo
**What I did:** Misspelled the placeholder as `'Usernamee'`.
**What I saw:** Failed after 30s: "locator.fill: Test timeout of 30000ms exceeded. waiting for getByPlaceholder('Usernamee')".
**Lesson:** Actions (`fill`/`click`) wait up to the 30s test timeout, while assertions wait 5s. The snapshot showed the form was fine, so the locator was the problem.

### 2026-10-24: Removing `testIdAttribute`
**What I did:** Commented out `testIdAttribute: 'data-test'` in the config.
**What I saw:** `getByTestId('username')` timed out after 30s, because Playwright defaults to `data-testid`.
**Lesson:** One config line decides whether every `getByTestId` locator works.

### 2026-10-24: Trace viewer
**What I did:** Ran with `CI=true` so retries were enabled, then opened the trace for the failed retry.
**What I saw:** A timeline of actions with DOM snapshots, network requests and console output for each step.
**Lesson:** Traces are only recorded on retry, which is why CI debugging relies on them.

### 2026-10-24: Breaking a locator inside a page object
**What I did:** Broke the `login-button` ID inside `LoginPage` on purpose.
**What I saw:** The test file hadn't changed, but it failed. One fix in the page object repaired every test using it.
**Lesson:** Locators live in one place, so a UI change is a one-file fix.

### 2026-10-24: `cartPage` not found even though the fixture existed
**What I did:** Ran `tsc` after registering the fixture.
**What I saw:** TS2304 on `cartPage` in `cart.spec.ts`, though `fixtures/index.ts` was correct.
**Cause:** Registering a fixture isn't enough. The test must also list it in its destructured arguments.
**Lesson:** Read the file and line number in the error first. It pointed at the test, not the fixtures.