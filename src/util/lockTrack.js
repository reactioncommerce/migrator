const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

/**
 * @summary lock a particular track
 * @param {Object} db - The db we are operating on
 * @param {String} namespace - The namespace we are working on
 * @returns {Promise<boolean>} Whether the track is locked
 */
async function lockTrack({ db, namespace }) {
  const collection = db.collection(MIGRATIONS_COLLECTION_NAME);
  // For locking to work atomically here, we need `locked: false`
  // in the query AND a unique index on `namespace`, which will
  // cause an error if it tries to create two docs with the same
  // namespace. Then we just catch errors and assume that means
  // it's locked already.
  //
  // "If you call db.collection.createIndex() for an index that
  // already exists, MongoDB does not recreate the index."
  await collection.createIndex({ namespace: 1 }, { unique: true });

  try {
    await collection.updateOne({
      locked: { $ne: true },
      namespace
    }, {
      $set: {
        locked: true
      }
    }, {
      upsert: true
    });
  } catch (error) {
    return false;
  }

  return true;
}

module.exports = lockTrack;
