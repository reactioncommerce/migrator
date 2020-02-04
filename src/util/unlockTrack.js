const {
  MIGRATIONS_COLLECTION_NAME
} = require("../constants.js");

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
