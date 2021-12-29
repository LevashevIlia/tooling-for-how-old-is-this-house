import chalk from "chalk";
import path from "path";
import puppeteer from "puppeteer";

import { ensureLaunchedWebApp } from "../../shared/ensureLaunchedWebApp";
import { ensureImageSnapshot } from "../../shared/pageSnapshots";
import {
  ensureTerritoryGitignoreContainsResults,
  generateVersionSuffix,
  getLocaleFromEnv,
  getResultsDirPath,
} from "../../shared/results";
import { getTerritoryId } from "../../shared/territory";

const output = process.stdout;

const script = async () => {
  output.write(chalk.bold("results: Generating histogram\n"));

  const extension = "png";

  await ensureTerritoryGitignoreContainsResults();

  const version = generateVersionSuffix();
  const territoryId = getTerritoryId();

  const locale = getLocaleFromEnv();

  await ensureLaunchedWebApp({
    output,
    action: async (webAppUrl) => {
      const browser = await puppeteer.launch();

      const resultFilePath = path.resolve(
        getResultsDirPath(),
        `${territoryId}.histogram.${version}${
          locale === "ru" ? "" : `.${locale}`
        }.${extension}`,
      );

      output.write(
        chalk.green(`Making web page snapshot (LOCALE=${locale})...\n`),
      );

      const page = await browser.newPage();
      await page.goto(`${webAppUrl}/${locale}/histogram`);

      await ensureImageSnapshot({
        imageScaleFactor: 2,
        output,
        page,
        resultFilePath,
      });

      await browser.close();
    },
  });
};

await script();