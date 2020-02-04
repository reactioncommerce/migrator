const connectToMongo = require("../util/connectToMongo.js");
const log = require("../util/log.js");
const unlockTrack = require("../util/unlockTrack.js");

const {
  MONGO_URL
} = require("../constants.js");

/**
 * @summary Registers the `migrator unlock-track` command
 * @param {Object} program commander program
 * @returns {undefined}
 */
function register(program) {
  program
    .command("unlock-track <namespace>")
    .description("Unlock the track with a specific namespace. Use this when a track is reporting being locked but you're sure nothing is actually running migrations for it right now.")
    .action(async (namespace) => {
      const db = await connectToMongo({ mongoUrl: MONGO_URL });

      await unlockTrack({ db, namespace, upsert: false });

      log(`Unlocked track with namespace "${namespace}"`);

      process.exit(0);
    });
}

module.exports = register;
