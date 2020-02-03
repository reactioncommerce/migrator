const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

async function pushDatabaseRunInfo({ db, namespace, runInfo }) {
  await db.collection(MIGRATIONS_COLLECTION_NAME).updateOne({
    namespace
  }, {
    $push: {
      runHistory: runInfo
    }
  }, {
    upsert: true
  });
}

module.exports = pushDatabaseRunInfo;
