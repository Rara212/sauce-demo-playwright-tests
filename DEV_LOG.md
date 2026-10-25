21/10/25
Error: browserType.launch: Executable doesn't exist at /Users/mac/Library/Caches/ms-

22/10/25
## Experiment 1: wrong URL assertion
**Symptom:** toHaveURL failed after 5000ms. Expected /checkout/, received inventory.html.
**Cause:** I changed the assertion on purpose.
**What I learned:** The call log shows the assertion retried 14 times before failing. The page snapshot showed login had worked, so the test was wrong, not the app.

## Experiment 2: wrong password
**Symptom:** toHaveURL(/inventory/) failed. Received https://www.saucedemo.com/ (still on login).
**Cause:** I used a wrong password on purpose. The page snapshot showed the error alert "Username and password do not match any user in this service".
**What I learned:** The snapshot shows the page state at failure, so I can diagnose without re-running. That alert text is what my negative login test will assert on.

## Experiment 3: locator typo
**Symptom:** Test failed after 30s with "locator.fill: Test timeout of 30000ms exceeded. waiting for getByPlaceholder('Usernamee')".
**Cause:** I misspelled the placeholder on purpose. Playwright kept waiting for an element that never existed.
**What I learned:** Action failures (fill/click) wait up to the 30s test timeout, while assertion failures wait 5s. The page snapshot showed the form was fine, so the locator was the problem.

## Phase 2: "Cannot find name 'process'"
**Symptom:** TS error on `process.env.CI` in playwright.config.ts, even after installing @types/node.
**Cause:** Newer TypeScript doesn't auto-load @types packages, so `types: ["node"]` must be set in tsconfig.json.
**Fix:** Installed @types/node and added a tsconfig.json with `"types": ["node"]`.
**Lesson:** Read the whole error message. The part I first skipped was the actual fix.

## Phase 2: "Cannot find name 'process'" + deprecated tsc
**Symptom:** TS error on `process.env.CI`; later, `npx tsc` showed "This is not the tsc command you are looking for".
**Cause:** (1) Newer TypeScript doesn't auto-load @types packages, so tsconfig needed `types: ["node"]`. (2) `typescript` wasn't installed locally, so npx ran an unrelated deprecated package named `tsc`.
**Fix:** Installed @types/node and typescript as dev dependencies, added `types: ["node"]` to tsconfig.json.
**Lesson:** Read the whole error message, and install tools explicitly instead of relying on npx to guess.

24/10/2026
## Phase 2: getByTestId('Username') timed out
**Symptom:** Test failed after 30s, "waiting for getByTestId('Username')".
**Cause:** Test IDs are case-sensitive and must match the `data-test` value exactly. I used 'Username'/'Login' instead of 'username'/'login-button'.
**Fix:** Inspected the page and used the real attribute values.
**Lesson:** Verify test IDs in DevTools instead of guessing from visible text.

## Phase 2: Removing testIdAttribute
**Symptom:** With `testIdAttribute: 'data-test'` commented out, `getByTestId('username')` timed out after 30s.
**Cause:** Playwright defaults to `data-testid`, but Sauce Demo uses `data-test`, so no element matched.
**Fix:** Restored the config line.
**Lesson:** One config line decides whether every getByTestId locator works. Confirmed by removing it and watching the whole suite fail.

## Phase 2: Trace viewer
**What I did:** Ran with CI=true so retries were enabled, then opened the trace for the failed retry.
**What I saw:** Timeline of actions with DOM snapshots, network requests, and console output for each step.
**Lesson:** Traces are only recorded on retry, which is why CI debugging relies on them.

## Phase 3: Page objects
**What I did:** Broke the login-button ID inside LoginPage on purpose.
**What I saw:** The test file hadn't changed, but it failed. One fix in the page object repaired every test using it.
**Lesson:** Locators live in one place, so UI changes are a one-file fix.

## Phase 3: "Cannot find name 'cartPage'" even though the fixture existed
**Symptom:** tsc reported TS2304 on `cartPage` in cart.spec.ts, though fixtures/index.ts was correct.
**Cause:** Registering a fixture isn't enough. The test must also list it in its destructured arguments.
**Fix:** Added `cartPage` to `async ({ loginPage, inventoryPage, cartPage })`.
**Lesson:** Read the file and line number in the error first. It pointed at the test, not the fixtures.

## Phase 4: Logout test timed out at 30s
**Symptom:** Test timed out, page snapshot showed the inventory with the menu still closed.
**Cause:** (fill in once you've found it: wrong locator or hidden link)
**Fix:** (fill in)
**Lesson:** A timeout with no locator in the message means an action was waiting. The Test Steps list shows which one.

## Phase 4: Sort test failed, option and comparator disagreed
**Symptom:** toEqual failed. Received was ascending, expected was descending.
**Cause:** The test selected 'az' but compared against a descending sort (b.localeCompare(a)). The app was right.
**Fix:** Selected 'za' for descending and kept 'az' for ascending.
**Lesson:** In a test that computes its own expected value, a mismatch between the action and the expectation looks like an app bug. Read which side is wrong first.

## Phase 5: Baseline timings (before storageState)
- `npx playwright test`: ____ (22 tests)
- `npx playwright test --repeat-each=10`: 1.0m (220 executions)

## Phase 5: Login test received about:blank
**Symptom:** toHaveURL(/inventory/) failed, received "about:blank".
**Cause:** I removed the goto/login lines from the login test while cleaning up for storageState. Login tests must still log in through the UI.
**Fix:** Restored the two lines.
**Lesson:** about:blank means the test never navigated.

## Phase 5: storageState
**What I did:** Added a setup project that logs in once and saves the session; cart, checkout and inventory tests reuse it.
**Result:** 220 passed (1.0m) before, 221 passed (1.1m) after, so no meaningful speedup.
**Cause:** Sauce Demo's login is a fast client-side form, and each test still needs a full page load.
**Lesson:** Measure before assuming an optimization helps. storageState pays off when login is slow (APIs, SSO, MFA). Here it mainly removes repeated login steps from the test bodies.

## Phase 6: First CI run
**Result:** Green on the first push, 46s total (tests 13s).
**Annotations:** Node 20 deprecation warning for the actions, plus a notice that ubuntu-latest is migrating to Ubuntu 26.
**Lesson:** A green first run doesn't mean the pipeline is trustworthy yet. I still need to prove it can fail and that I can debug a failure from the artifact alone.