const path = require("path");
const prettyMs = require("pretty-ms");
const checkDatabaseVersions = require("../util/checkDatabaseVersions.js");
const connectToMongo = require("../util/connectToMongo.js");
const log = require("../util/log.js");

const {
  MIGRATIONS_COLLECTION_NAME,
  MONGO_URL
} = require("../constants.js");

/**
 * @summary Registers the `migrator history` command
 * @param {Object} program commander program
 * @returns {undefined}
 */
function register(program) {
  program
    .command("history <namespace>")
    .description("Show migration run history for a specific namespace")
    .action(async (namespace) => {
      const db = await connectToMongo({ mongoUrl: MONGO_URL });
      const doc = await db.collection(MIGRATIONS_COLLECTION_NAME).findOne({ namespace });
      if (!doc || !Array.isArray(doc.runHistory) || doc.runHistory.length === 0) {
        log(`No migration run history found for namespace "${namespace}"`);
        process.exit(0);
      }

      const history = doc.runHistory.map((entry) => {
        return {
          versionChange: `${entry.startVersion} -> ${entry.endVersion}`,
          startedAt: entry.startedAt.toLocaleString(),
          endedAt: entry.endedAt.toLocaleString(),
          time: prettyMs(entry.endedAt - entry.startedAt),
          result: entry.result
        };
      });

      console.log("\n");
      console.table(history);
      console.log("\n");
      process.exit(0);
    });
}

module.exports = register;
