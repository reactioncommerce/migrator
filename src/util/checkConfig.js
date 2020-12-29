/**
 * @summary Validates the configuration object
 * @param {Object} config The configuration object
 * @param {Object} [options] Function options
 * @param {Function} [options.log] A function that will take a string and log it
 * @return {Boolean} True if valid, otherwise false.
 */
function checkConfig({ tracks } = {}, { log = () => {} } = {}) {
  if (!tracks) {
    log("No migrations provided", "error");
    return false;
  }

  log(`✓ Found ${tracks.length} migration tracks.\n\nValidating tracks...`);

  const namespaces = {};
  for (const track of tracks) {
    const {
      desiredVersion,
      migrations,
      namespace,
      orderedVersionList,
      package: packageName
    } = track || {};

    if (typeof namespace !== "string" || namespace.length === 0) {
      log("A migration track was provided without a namespace", "error");
      return false;
    }

    if (namespaces[namespace]) {
      log(`Two different tracks provided the same namespace value: "${namespace}"`, "error");
      return false;
    }
    namespaces[namespace] = true;

    let foundDesiredVersion = desiredVersion === "1-0";
    if (!foundDesiredVersion) {
      foundDesiredVersion = orderedVersionList.includes(desiredVersion);
      if (!foundDesiredVersion) {
        const highestMajorVersion = orderedVersionList[orderedVersionList.length - 1];
        log(`Configuration asks for version ${desiredVersion} for the ${namespace} track, but that version does not exist in the track migrations.
        Highest version found is ${highestMajorVersion}.`, "error");
        if (packageName) {
          log(`\nPerhaps you need to 'npm install ${packageName}@latest' to get new migrations.`, "error");
        }
        return false;
      }
    }

    for (const version of Object.getOwnPropertyNames(migrations)) {
      // Now grab the migration functions
      const migrationFns = migrations[version];
      const { down, up } = migrationFns || {};
      if (typeof down !== "function" && down !== "unnecessary" && down !== "impossible") {
        log(`Track with namespace "${namespace}" provided an invalid "down" migration for version ${version}`, "error");
        return false;
      }
      if (typeof up !== "function") {
        log(`Track with namespace "${namespace}" provided an invalid "up" migration for version ${version}`, "error");
        return false;
      }
    }

    log(`✓ Configuration for ${namespace} track is valid`);
  }

  log("✓ Migration configuration is valid");

  return true;
}

module.exports = checkConfig;
