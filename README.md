# gliff.ai [test] jest-browserstack-automate

![Latest Tag](https://img.shields.io/github/v/tag/gliff-ai/jest-browserstack-automate?&label=latest_tag&style=flat-square&color=f2f2f2) ![Number of Open Issues](https://img.shields.io/github/issues/gliff-ai/jest-browserstack-automate?style=flat-square&color=yellow) ![Number of Open Pull Requests](https://img.shields.io/github/issues-pr/gliff-ai/jest-browserstack-automate?style=flat-square&color=yellow) ![Number of Contributors](https://img.shields.io/github/contributors/gliff-ai/jest-browserstack-automate?style=flat-square&color=yellow) ![Repository Size](https://img.shields.io/github/repo-size/gliff-ai/jest-browserstack-automate?style=flat-square&color=red) ![Repo License](https://img.shields.io/github/license/gliff-ai/jest-browserstack-automate?color=0078FF&style=flat-square)

👋 **Welcome in!** 👋

This repository contains the Open Source code for [gliff.ai](https://gliff.ai)’s [Browserstack Automate tests using Jest](https://www.browserstack.com/guide/jest-framework-tutorial).

This [test] repository aims to create vital tests which help catch any technical or visual breakages in the code or performance and alert the [gliff.ai](https://gliff.ai) team. This simple test harness is a collection of stubs, driver and other support tools that enables Browserstack Automate tests to be run with Jest and generate a test report.

❌ **This repository does not accept most contributions unfortunately! However, an issue can still be raised if you recognise a problem you wish to bring to the gliff.ai teams attention.** ❌

## Table of Contents

Looking for something specific? 🔍

- [Repository Introduction](#gliffai-jest-browserstack-automate)
- [Demo-Preview](#demo-preview)
- [Table of Contents](#table-of-contents)
- [Setup](#setup)
- [Contribute](#contribute)
- [Contact](#contact)
- [License](#license)

## Setup

[{{back to navigation}}](#table-of-contents)

Below is the wrapper you should use to setup **BrowerStack** and run Selenium tests using Jest.

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

**NOTE:** \
If no env vars are set, it will run locally, you will need the driver installed for the selected browser. \
If BROWSERSTACK_NAME is set, it will use Browserstack for the driver (capabilities can be passed as the final arg to `test`). \
If BROWSERSTACK_ACCESS_KEY is set, the Browserstack local proxy will be set up, which allows the use of local URLs. \

Below is the additonal wrapper you should use to setup **Percy**.

The second argument passed to `test` is a wrapper for percySnapshot that will create only 1 snapshot rather than 1 for each browser (import the original from "@percy/selenium-webdriver" to create a snapshot for every browser)

`PERCY_TOKEN=xxxx percy exec -- jest --no-colors`

## Contribute

[{{back to navigation}}](#table-of-contents)

This repository **does not accept contributions** unfortunately as content has been developed with specific gliff.ai team practises and preferences in mind. _However_, an issue can still be raised if you recognise a problem you wish to bring to the gliff.ai teams attention.

We do have several repositories within the gliff.ai github space that  welcome all contributions and contributors on. These will be marked with the topic tag **contributions-welcome** meaning we welcome contributions on this repository! Search for them [here](https://github.com/search?q=topic%3Acontributors-welcome+org%3Agliff-ai&type=Repositories)!

Check out the [gliff.ai Contribution Guide](https://github.com/gliff-ai/.github/blob/main/CONTRIBUTING.md) 👋 to learn more!

## Contact

[{{back to navigation}}](#table-of-contents)

Need some help? 🤔 Have a question? 🧠 \
Reach out to the gliff.ai team at [community@gliff.ai](mailto:community@gliff.ai?subject=[GitHub]) or on GitHub.

## License

[{{back to navigation}}](#table-of-contents)

This code is licensed under a [GNU AGPLv3 license](https://github.com/gliff-ai/jest-browserstack-automate/blob/main/LICENSE) 📝 \
Curious about our reasoning for this? Read about them [here](https://gliff.ai/articles/open-source-license-gnu-agplv3/)!
