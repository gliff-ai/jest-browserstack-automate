Wrapper to setup broswer stack and run Selenium tests with Jest

To Use:

```javascript
// Replaces the Jest global `test` with our function, which has a selenium driver as an arg. This handles sending pass/failure status to Browserstack.
const {
  wrapper,
  test,
  webdriver,
} = require("@gliff-ai/jest-browserstack-automate")();

const { TARGET_URL = "http://localhost:3000/" } = process.env;

// Wrappper is a jest describe with before/after hooks to setup browserstack and the local tunnel
wrapper(() => {
  describe("Load page", () => {
    test("Loads the page", async (driver, percySnapshot) => {
      await driver.get(TARGET_URL);

      await driver.wait(webdriver.until.titleMatches(/Title/i), 5000);
      const title = await driver.getTitle();

      expect(title).toEqual("PAGE TITLE");
    });
  });
});

```

run with `jest --no-colors` as we send the message to browserstack so don't want the colour codes.

If no env vars are set, it will run locally, you will need the driver installed for the selected browser.

If BROWSERSTACK_NAME is set, it will use Browserstack for the driver (capabilities can be passed as the final arg to `test`)

If BROWSERSTACK_ACCESS_KEY is set, the Browserstack local proxy will be set up, which allows the use of local URLs.

# Percy

The second argument passed to `test` is a wrapper for percySnapshot that will create only 1 snapshot rather than 1 for each browser (import the original from "@percy/selenium-webdriver" to create a snapshot for every browser)

`PERCY_TOKEN=xxxx percy exec -- jest --no-colors`

