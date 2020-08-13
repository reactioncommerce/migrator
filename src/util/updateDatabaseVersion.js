const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

// eslint-disable-next-line require-jsdoc
async function updateDatabaseVersion({ db, namespace, runInfo, version }) {
  await db.collection(MIGRATIONS_COLLECTION_NAME).updateOne({
    namespace
  }, {
    $set: {
      version
    },
    $push: {
      runHistory: runInfo
    }
  }, {
    upsert: true
  });
}

module.exports = updateDatabaseVersion;
