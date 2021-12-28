import { autoStartCommandIfNeeded } from "@kachkaev/commands";

import { generateReportGeocodes } from "../../../shared/helpersForCommands";
import { generateRosreestrOutputLayer } from "../../../shared/sources/rosreestr";

const command = generateReportGeocodes({
  source: "rosreestr",
  generateOutputLayer: generateRosreestrOutputLayer,
});

autoStartCommandIfNeeded(command, __filename);

export default command;
