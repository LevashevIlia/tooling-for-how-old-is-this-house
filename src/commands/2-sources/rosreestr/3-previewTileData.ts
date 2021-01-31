import { autoStartCommandIfNeeded, Command } from "@kachkaev/commands";
import chalk from "chalk";

import { combineTilesAndSavePreviews } from "../../../shared/sources/rosreestr";

export const combineTilesWithCcos: Command = async ({ logger }) => {
  logger.log(chalk.bold("sources/rosreestr: Previewing tile data / CCOs"));
  await combineTilesAndSavePreviews({ objectType: "cco", logger });

  logger.log(chalk.bold("sources/rosreestr: Previewing tile data / lots"));
  await combineTilesAndSavePreviews({ objectType: "lot", logger });
};

autoStartCommandIfNeeded(combineTilesWithCcos, __filename);