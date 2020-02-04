const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

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
      locked: false,
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
