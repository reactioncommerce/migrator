const path = require("path");
const inquirer = require("inquirer");
const connectToMongo = require("../util/connectToMongo.js");
const log = require("../util/log.js");

const {
  MIGRATIONS_COLLECTION_NAME,
  MONGO_URL
} = require("../constants.js");

/**
 * @summary Registers the `migrator clear-history` command
 * @param {Object} program commander program
 * @returns {undefined}
 */
function register(program) {
  program
    .command("clear-history <namespace>")
    .description("Clear migration run history for a specific namespace")
    .action(async (namespace) => {
      const { shouldContinue } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldContinue",
          message: `Clear migration run history for the "${namespace}" namespace? This can't be reversed.`,
          default: false
        }
      ]);

      if (!shouldContinue) process.exit(0);

      const db = await connectToMongo({ mongoUrl: MONGO_URL });

      try {
        await db.collection(MIGRATIONS_COLLECTION_NAME).updateOne({
          namespace
        }, {
          $set: {
            runHistory: []
          }
        });
      } catch (error) {
        log(error.stack || error, "error");
        process.exit(1);
      }

      log(`History cleared for namespace "${namespace}"`);
      process.exit(0);
    });
}

module.exports = register;
