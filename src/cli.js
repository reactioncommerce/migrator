#!/usr/bin/env node --experimental-modules --experimental-json-modules

const log = require("./util/log.js");

process.on("unhandledRejection", (reason, promise) => {
  log(reason.stack || reason, "error");
});

const program = require("commander");
const packageJson = require("../package.json");
const registerClearHistoryCommand = require("./commands/clear-history.js");
const registerHistoryCommand = require("./commands/history.js");
const registerMigrateCommand = require("./commands/migrate.js");
const registerReportCommand = require("./commands/report.js");

// Define the version of the CLI program
program.version(packageJson.version);

// Add commands
registerClearHistoryCommand(program);
registerHistoryCommand(program);
registerMigrateCommand(program);
registerReportCommand(program);

// Wire up the CLI program to the incoming command arguments, i.e., execute the defined program
program.parse(process.argv);
