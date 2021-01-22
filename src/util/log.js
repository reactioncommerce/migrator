const chalk = require("chalk");

/**
 * @summary Log out messages to the console, colored by type
 * @param {String} status - The status to log
 * @param {String} level - What type of log message it is
 * @returns {undefined} undefined
 */
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
  // eslint-disable-next-line no-console
  console[level](coloredStatus);
}

module.exports = log;
