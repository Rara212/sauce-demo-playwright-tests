# Sauce Demo Playwright Suite

<img src="https://playwright.dev/img/playwright-logo.svg" alt="Playwright" width="140">

![Playwright Tests](https://github.com/Rara212/saucedemo-playwright-tests/actions/workflows/playwright.yml/badge.svg)

End-to-end UI tests for [Sauce Demo](https://www.saucedemo.com), written in
TypeScript with Playwright, using page objects and fixtures, and run on every
push through GitHub Actions.

## What it covers

23 tests across four areas:

- **Login (7):** valid login, locked-out user, wrong password, empty username,
  empty password, logout, blocked direct access
- **Inventory (5):** product count, four sort orders (verified by reading the page, not hardcoded)
- **Cart (4):** badge count, cart contents, removing an item, proceeding to checkout
- **Checkout (7):** full purchase, three validation errors, two cancel paths,
  order total arithmetic

CI (GitHub Actions, Ubuntu, Chromium) runs type checking, then the suite, in
about 1 minute end to end. It uploads the HTML report (with traces on retry)
as an artifact, even when tests fail.

## Run it locally

```bash
npm ci
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## Project structure

```
pages/       page objects (locators + actions, no assertions)
fixtures/    custom fixtures that provide page objects to tests
tests/       spec files, plus auth.setup.ts for saved login state
.github/workflows/playwright.yml
```

## What broke and why

- **Type-check tooling:** `process` was flagged even after installing
  `@types/node`, because newer TypeScript doesn't auto-load `@types`
  packages. `npx tsc` then ran an unrelated deprecated package, since
  `typescript` wasn't installed locally. Fixed with `types: ["node"]` in
  tsconfig and an explicit `typescript` dev dependency.
- **Sort test that couldn't pass:** it selected A→Z but compared against a
  descending sort. The app was right, and the test contradicted itself.
- **storageState gave no speedup:** 1.0m vs 1.1m over 220 runs. Sauce Demo's
  login is already cheap, so the value is simpler tests, not speed.
- **CI failure debugged from the artifact:** I broke an assertion on purpose,
  and the run's annotation only said "exit code 1". The downloaded report
  showed Expected vs Received and the page snapshot.