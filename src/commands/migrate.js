const inquirer = require("inquirer");
const checkDatabaseVersions = require("../util/checkDatabaseVersions.js");
const connectToMongo = require("../util/connectToMongo.js");
const runMigrations = require("../util/runMigrations.js");
const loadAndCheckConfig = require("../util/loadAndCheckConfig.js");
const log = require("../util/log.js");
const printReport = require("../util/printReport.js");
const { MONGO_URL } = require("../constants.js");

/**
 * @summary Registers the `migrator migrate` command
 * @param {Object} program commander program
 * @returns {undefined}
 */
function register(program) {
  program
    .command("migrate [env]")
    .description("Migrate data to the versions specified in ./migrator-config.js or ./migrator-config-[env].js")
    .option("-s, --silent", "Silence verbose status logging")
    .option("-y, --yes", "Do not prompt for confirmation before migrating")
    .action(async (env, options) => {
      const config = await loadAndCheckConfig(env, options);
      const db = await connectToMongo({ mongoUrl: MONGO_URL });
      const tracks = await checkDatabaseVersions({
        db,
        tracks: config.tracks
      });

      printReport(tracks, env);

      const noneNeeded = tracks.every(({ isMigrationNeeded }) => isMigrationNeeded === false);
      if (noneNeeded) {
        log("No migrations needed");
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }

      const parsedUrl = new URL(MONGO_URL);
      parsedUrl.username = "USER";
      parsedUrl.password = "PASS";
      log(`MongoDB URL: ${parsedUrl.href}\n`);

      if (!options.yes) {
        const { shouldContinue } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldContinue",
            message: `Run all needed migrations on the "${db.databaseName}" database now?`,
            default: false
          }
        ]);

        // eslint-disable-next-line no-process-exit
        if (!shouldContinue) process.exit(0);
      }

      try {
        await runMigrations(tracks, {
          db,
          log,
          mongoUrl: MONGO_URL
        });
      } catch (error) {
        log(error.stack || error, "error");
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });
}

module.exports = register;
