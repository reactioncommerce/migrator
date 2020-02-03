const validateAndTransformVersion = require("./validateAndTransformVersion.js");

const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

async function checkDatabaseVersions({ db, tracks }) {
  const promises = tracks.map(async (track) => {
    const doc = await db.collection(MIGRATIONS_COLLECTION_NAME).findOne({ namespace: track.namespace });
    let currentVersion = doc && doc.version ? doc.version : "1-0";
    currentVersion = validateAndTransformVersion(currentVersion);

    return Object.assign({}, track, {
      currentVersion,
      isMigrationNeeded: currentVersion !== track.desiredVersion
    });
  });

  return Promise.all(promises);
}

module.exports = checkDatabaseVersions;
