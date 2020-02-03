const chalk = require("chalk");

function log(status, level = "info") {
  let coloredStatus;
  switch (level) {
    case "info":
      coloredStatus = chalk.cyan(status);
      break;

    case "error":
      coloredStatus = chalk.red(status);
      break;

    default:
      coloredStatus = status;
      break;
  }
  console[level](coloredStatus);
}

module.exports = log;
