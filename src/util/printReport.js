/* eslint-disable no-console */

/**
 * @summary Print the results of the migration
 * @param {Array} tracks - The tracks we are migrationg
 * @returns {undefined} undefined
 */
function printReport(tracks) {
  console.log("\n");
  console.table(tracks, ["namespace", "desiredVersion", "currentVersion", "isMigrationNeeded"]);
  console.log("\n");
}

module.exports = printReport;
