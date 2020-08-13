
// eslint-disable-next-line require-jsdoc
function checkMigratingUp(currentVersion, desiredVersion) {
  const currentVersionNum = Number(currentVersion.replace("-", "."));
  const desiredVersionNum = Number(desiredVersion.replace("-", "."));

  return currentVersionNum < desiredVersionNum;
}

/**
 * @summary Returns just the portion of `orderedVersionList` that
 *   needs to be run, based on provided current and desired versions.
 * @param {String[]} orderedVersionList Ordered list of versions for which we have migrations
 * @param {String} currentVersion Current version string
 * @param {String} desiredVersion Desired version string
 * @returns {String[]} Versions that we need to run migrations for, in order
 */
function getOrderedMigrationSteps(orderedVersionList, currentVersion, desiredVersion) {
  const isMigratingUp = checkMigratingUp(currentVersion, desiredVersion);

  const currentVersionIndex = orderedVersionList.indexOf(currentVersion);
  const desiredVersionIndex = orderedVersionList.indexOf(desiredVersion);

  let steps;
  if (isMigratingUp) {
    steps = orderedVersionList.filter((version, index) => {
      // First layer of filtering is that we want only versions between
      // currentVersionIndex and desiredVersionIndex, including desired
      // but not including current.
      if (index <= currentVersionIndex) return false;
      if (index > desiredVersionIndex) return false;

      // Second layer of filtering is that we only want minor migrations
      // if they have the same major version as desiredVersion.
      if (version.split("-")[1] !== "0" && version.split("-")[0] !== desiredVersion.split("-")[0]) {
        return false;
      }

      return true;
    });
  } else {
    steps = orderedVersionList.filter((version, index) => {
      // First layer of filtering is that we want only versions between
      // currentVersionIndex and desiredVersionIndex, including current
      // but not including desired.
      if (index > currentVersionIndex) return false;
      if (index <= desiredVersionIndex) return false;

      // Second layer of filtering is that we only want minor migrations
      // if they have the same major version as currentVersion.
      if (version.split("-")[1] !== "0" && version.split("-")[0] !== currentVersion.split("-")[0]) {
        return false;
      }

      return true;
    });

    // For down migrations we also have to reverse the sort
    steps.reverse();
  }

  return {
    direction: isMigratingUp ? "up" : "down",
    steps
  };
}

module.exports = getOrderedMigrationSteps;
