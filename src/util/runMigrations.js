const getOrderedMigrationSteps = require("./getOrderedMigrationSteps.js");
const runService = require("./runService.js");

// eslint-disable-next-line require-jsdoc
async function runMigrations(tracks, { log, mongoUrl }) {
  // Run track migrations in parallel
  const promises = tracks.map(async (track) => {
    const {
      currentVersion,
      desiredVersion,
      importPath,
      isMigrationNeeded,
      namespace,
      orderedVersionList,
      package: packageName,
      path
    } = track;

    if (!isMigrationNeeded) {
      log(`Migration namespace ${namespace} is at desired version ${desiredVersion}`);
      return;
    }

    const {
      direction,
      steps
    } = getOrderedMigrationSteps(orderedVersionList, currentVersion, desiredVersion);

    let orderedMigrationSteps;
    if (direction === "up") {
      orderedMigrationSteps = steps.map((version, index) => ({
        endVersion: version,
        startVersion: index === 0 ? currentVersion : steps[index - 1],
        stepVersion: version
      }));
    } else {
      orderedMigrationSteps = steps.map((version, index) => ({
        endVersion: index === steps.length - 1 ? desiredVersion : steps[index + 1],
        startVersion: version,
        stepVersion: version
      }));
    }

    await runService({
      direction,
      importPath,
      log,
      mongoUrl,
      namespace,
      orderedMigrationSteps,
      package: packageName,
      path
    });
  });

  await Promise.all(promises);
}

module.exports = runMigrations;
