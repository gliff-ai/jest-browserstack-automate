const webdriver = require("selenium-webdriver");
const browserstack = require("browserstack-local");
const percySnapshotOriginal = require("@percy/selenium-webdriver");
const { test: jestTest } = require("@jest/globals");

const {
  BROWSERSTACK_USERNAME,
  BROWSERSTACK_ACCESS_KEY,
  BROWSERSTACK_BUILD_NAME = "local build",
} = process.env;

const BROWSERSTACK_URL = BROWSERSTACK_USERNAME
  ? `http://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`
  : null;

const bsDesktopBrowsers = [
  {
    browserName: "Chrome",
    browser_version: "latest",
    os: "OS X",
    os_version: "Big Sur",
  },
  {
    browserName: "Chrome",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  {
    browserName: "Safari",
    browser_version: "latest",
    os: "OS X",
    os_version: "Big Sur",
  },
  {
    browserName: "Edge",
    browser_version: "latest",
    os: "Windows",
    os_version: "10",
  },
  {
    device: "iPad 8th", // choose "iPhone 12 Pro" etc.
    real_mobile: "true",
    browserName: "Safari",
  },
];

const getPercySnapshotFn = () => {
  const snaps = new Set();

  return (driver, name, options) => {
    if (snaps.has(name)) {
      return;
    } else {
      snaps.add(name);
      return percySnapshotOriginal(driver, name, options);
    }
  };
};

const init = (project, desktopBrowsers = bsDesktopBrowsers) => {
  const getDriver = (capabilities = {}, localBrowser = "chrome") => {
    if (!BROWSERSTACK_URL) {
      return new webdriver.Builder().forBrowser(localBrowser).build();
    }

    const baseCapabilities = {
      "browserstack.local": "true",
      "browserstack.console": "errors",
      name: "Test Test",
      build: BROWSERSTACK_BUILD_NAME,

      ...capabilities,
    };

    return new webdriver.Builder()
      .usingServer(BROWSERSTACK_URL)
      .withCapabilities(baseCapabilities)
      .build();
  };

  const initBrowserStackLocal = () =>
    new Promise((resolve) => {
      // Creates an instance of Local
      const bs_local = new browserstack.Local();

      const bs_local_args = {
        key: BROWSERSTACK_ACCESS_KEY,
        verbose: 3,
      };

      // Starts the Local instance with the required arguments
      bs_local.start(bs_local_args, function () {
        console.log("BrowserStack local started");
        resolve(bs_local);
      });
    });

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
      if (bs_local) {
        bs_local.stop(() => {
          console.log("BrowserStack local stopped");
          done();
        });
      } else {
        done();
      }
    }, 60000);
  };

  const test = async (
    name,
    action,
    timeout = 60000,
    driverOptions = { capabilities: {}, localBrowser: "chrome" }
  ) => {
    const percySnapshot = getPercySnapshotFn();

    return jestTest.each(BROWSERSTACK_URL ? bsDesktopBrowsers : [{}])(
      `${name} - $browserName - $os`,
      async (browser) => {
        const driver = await getDriver(
          {
            project,
            ...driverOptions.capabilities,
            ...browser,
          },
          driverOptions.localBrowser
        );

        if (BROWSERSTACK_URL) {
          driver.executeScript(
            `browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${project}: ${name}"}}`
          );
        }

        try {
          // Run the passed test
          await action(driver, percySnapshot);

          if (BROWSERSTACK_URL) {
            await driver.executeScript(
              'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Passed"}}'
            );
          }
        } catch (error) {
          // We need to tell Browserstack we have failed!
          if (BROWSERSTACK_URL) {
            driver.executeScript(
              `browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${project}: ${name}"}}`
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
  };

  return { test, wrapper, webdriver };
};

module.exports = init;
