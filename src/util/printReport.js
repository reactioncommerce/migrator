function printReport(tracks) {
  console.log("\n");
  console.table(tracks, ["namespace", "desiredVersion", "currentVersion", "isMigrationNeeded"]);
  console.log("\n");
}

module.exports = printReport;
