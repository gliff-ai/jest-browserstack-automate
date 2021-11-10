const webdriver = require("selenium-webdriver");
const browserstack = require("browserstack-local");
const {test: jestTest} = require("@jest/globals");

const {
  BROWSERSTACK_URL,
  BROWSERSTACK_ACCESS_KEY,
} = process.env;

const getDriver = (capabilities = {}, localBrowser = "chrome") => {
  if (BROWSERSTACK_URL) {
    const mergedCapabilities = {
      "browserstack.local": "true",
      os_version: "Big Sur",
      resolution: "1920x1080",
      browserName: "Chrome",
      browser_version: "latest",
      os: "OS X",
      name: "Test Test",
      build: "Build 0",

      ...capabilities,
    };

    return new webdriver.Builder()
      .usingServer(BROWSERSTACK_URL)
      .withCapabilities(mergedCapabilities)
      .build();
  } else {
    return new webdriver.Builder().forBrowser(localBrowser).build();
  }
};

const initBrowserStackLocal = () => {
  return new Promise((resolve, reject) => {
    // Creates an instance of Local
    const bs_local = new browserstack.Local();

    const bs_local_args = { key: BROWSERSTACK_ACCESS_KEY };

    // Starts the Local instance with the required arguments
    bs_local.start(bs_local_args, function () {
      console.log("BrowserStack local started");
      resolve(bs_local);
    });
  });
};

const wrapper = (cb) => {
  let bs_local;

  beforeAll(async () => {
    if (BROWSERSTACK_ACCESS_KEY) {
      bs_local = await initBrowserStackLocal();
    }
  }, 30000);

  describe("selenium tests", () => {
    cb();
  });

  afterAll((done) => {
    if (bs_local) bs_local.stop(() => {console.log("BrowserStack local stopped"); done();});
  }, 60000);
};

const test = async (name, action, timeout = 60000, driverOptions = {capabilities: {}, localBrowser: "chrome"}) =>
  jestTest(
    name,
    async () => {
      const driver = await getDriver(driverOptions);

      if (BROWSERSTACK_URL) {
        driver.executeScript(
          `browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${name}"}}`
        );
      }

      try {
        // Run the passed test
        await action(driver);

        if (BROWSERSTACK_URL) {
          await driver.executeScript(
            'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Passed"}}'
          );
        }
      } catch (error) {
        // We need to tell Browserstack we have failed!
        if (BROWSERSTACK_URL) {
          driver.executeScript(
            `browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${name}"}}`
          );
          const script = `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "${error.message
            .replace(/(\r\n|\n|\r)/gm, " ")
            .replace(/"/gm, "'")}"}}`;

          await driver.executeScript(script);
        }
        throw error;
      } finally {
        await driver.quit();
      }
    },
    timeout
  );

  module.exports = {test, wrapper, webdriver};
