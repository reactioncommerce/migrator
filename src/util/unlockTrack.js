const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

/**
 * @summary Mark the track as unlocked
 * @param {Object} db - The db we are operating on
 * @param {String} namespace - The namespace we are operating on
 * @param {Boolean} upsert - Whether we should upsert
 * @returns {Promise<undefined>} undefined
 */
async function unlockTrack({ db, namespace, upsert = true }) {
  await db.collection(MIGRATIONS_COLLECTION_NAME).updateOne({
    namespace
  }, {
    $set: {
      locked: false
    }
  }, {
    upsert
  });
}

module.exports = unlockTrack;
