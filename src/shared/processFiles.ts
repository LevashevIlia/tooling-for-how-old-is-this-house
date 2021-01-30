import chalk from "chalk";
import globby from "globby";
import _ from "lodash";

export const processFiles = async ({
  logger,
  fileSearchPattern,
  fileSearchDirPath,
  processFile,
  statusReportFrequency = 500,
}: {
  logger: Console;
  fileSearchPattern: string;
  fileSearchDirPath: string;
  processFile: (filePath: string) => Promise<void>;
  statusReportFrequency?: number;
}) => {
  process.stdout.write(chalk.green("Listing files..."));
  const rawGlobbyResults = await globby(fileSearchPattern, {
    cwd: fileSearchDirPath,
    absolute: true,
  });
  const globbyResults = _.sortBy(rawGlobbyResults);

  const numberOfFiles = globbyResults.length;
  const numberOfFilesStringLength = `${numberOfFiles}`.length;

  process.stdout.write(` Files found: ${numberOfFiles}.\n`);
  process.stdout.write(chalk.green("Processing files...\n"));

  for (let index = 0; index < numberOfFiles; index += 1) {
    if (
      index !== 0 &&
      ((index + 1) % statusReportFrequency === 0 || index === numberOfFiles - 1)
    ) {
      logger.log(
        `${`${index + 1}`.padStart(
          numberOfFilesStringLength,
        )} / ${numberOfFiles}`,
      );
    }

    await processFile(globbyResults[index]!);
  }
};