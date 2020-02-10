const fs = require("fs");
const path = require("path");
const validateAndTransformVersion = require("./validateAndTransformVersion.js");

/**
 * @summary Loads the configuration object from a js module in the current dir
 *   and adds in config info from the migration providers.
 * @param {String} configFilePath Absolute path to config file
 * @param {Object} [options] Function options
 * @param {Function} [options.log] A function that will take a string and log it
 * @return {null|Object} If this returns an object, it will have a resolved
 *   `tracks` property. If anything goes wrong, it will return `null` and `log`
 *   function will have been called with a message.
 */
async function loadConfig(configFilePath, { log = () => {} } = {}) {
  if (!fs.existsSync(configFilePath)) {
    log(`Cannot find ${configFilePath}`, "error");
    return null;
  }

  log(`Loading config from ${configFilePath}...`);

  const { default: configFile } = await import(configFilePath);
  const { tracks: trackList } = configFile || {};

  if (!Array.isArray(trackList) || trackList.length === 0) {
    log(`No migration tracks listed in ${configFilePath}`, "error");
    return null;
  }

  log(`✓ Loaded config\n\nAttempting to find and load all listed tracks...`);

  const tracks = [];
  for (const track of trackList) {
    const { package: packageName, path: trackPath, namespace, version } = track;

    // They have either specified `path: "some/relative/path/to/migrations.js"`
    // or `package: "package-name"`. Either the package or the file at the path
    // must have an ESM export named "migrations". `path` is assumed to be relative to
    // the current directory.

    let importPath;
    if (trackPath) {
      importPath = path.join(process.cwd(), trackPath);
    } else if (packageName) {
      importPath = require.resolve(packageName, { paths: [process.cwd()] });
    } else {
      log("Either `package` or `path` is required for each migration track", "error");
      return null;
    }

    const { migrations: packageMigrationConfig } = await import(importPath);
    if (!packageMigrationConfig) {
      log(`No migration config could be imported. "${importPath}" has no ESM export named "migrations".`, "error");
      return null;
    }

    const trackInfo = packageMigrationConfig.tracks.find((packageTrack) => packageTrack.namespace === namespace);
    if (!trackInfo) {
      log(`Cannot find migration namespace ${namespace} defined in ${importPath}`, "error");
      return null;
    }

    if (typeof trackInfo.migrations !== "object") {
      log(`Track with namespace "${namespace}" provided an invalid "migrations" list`, "error");
      return null;
    }

    trackInfo.orderedVersionList = [];
    const migrationsWithCleanedKeys = {};
    let badVersions = false;
    Object.getOwnPropertyNames(trackInfo.migrations).forEach((versionKey) => {
      const cleanVersion = validateAndTransformVersion(versionKey, 2);
      if (cleanVersion !== null) {
        migrationsWithCleanedKeys[cleanVersion] = trackInfo.migrations[versionKey];
        trackInfo.orderedVersionList.push(cleanVersion);
      } else {
        badVersions = true;
      }
    });
    if (badVersions) return null;

    trackInfo.migrations = migrationsWithCleanedKeys;
    trackInfo.orderedVersionList.sort((a, b) => Number(a.replace("-", ".")) - Number(b.replace("-", ".")))

    trackInfo.desiredVersion = validateAndTransformVersion(version);
    if (trackInfo.desiredVersion === null) return null;

    trackInfo.package = packageName;
    trackInfo.path = trackPath;
    trackInfo.importPath = importPath;

    tracks.push(trackInfo);

    log(`✓ Loaded ${trackPath || packageName} migration info`);
  }

  return { tracks };
}

module.exports = loadConfig;
