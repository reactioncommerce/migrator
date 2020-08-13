#!/usr/bin/env node
":"; // ; exec node --no-warnings --experimental-modules --experimental-json-modules "$0" "$@"

const program = require("commander");
const packageJson = require("../package.json");
const log = require("./util/log.js");
const registerClearHistoryCommand = require("./commands/clear-history.js");
const registerHistoryCommand = require("./commands/history.js");
const registerMigrateCommand = require("./commands/migrate.js");
const registerUnlockTrackCommand = require("./commands/unlock-track.js");
const registerReportCommand = require("./commands/report.js");

process.on("unhandledRejection", (reason) => {
  log(reason.stack || reason, "error");
});

// Define the version of the CLI program
program.version(packageJson.version);

// Add commands
registerClearHistoryCommand(program);
registerHistoryCommand(program);
registerMigrateCommand(program);
registerUnlockTrackCommand(program);
registerReportCommand(program);

// Wire up the CLI program to the incoming command arguments, i.e., execute the defined program
program.parse(process.argv);

// Help is auto-generated and available with `-h` or `--help`
// Make it also appear when the CLI is run without any command:
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
