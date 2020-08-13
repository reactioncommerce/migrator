const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

/**
 * @summary Push the database run info
 * @param {Object} db - The database we are operating on
 * @param {String} namespace - The namespace we are operating in
 * @param {string} runInfo - The run info
 * @returns {undefined} undefined
 */
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
