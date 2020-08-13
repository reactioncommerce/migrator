const checkDatabaseVersions = require("../util/checkDatabaseVersions.js");
const connectToMongo = require("../util/connectToMongo.js");
const loadAndCheckConfig = require("../util/loadAndCheckConfig.js");
const log = require("../util/log.js");
const printReport = require("../util/printReport.js");

const { MONGO_URL } = require("../constants.js");

/**
 * @summary Registers the `migrator report` command
 * @param {Object} program commander program
 * @returns {undefined}
 */
function register(program) {
  program
    .command("report [env]")
    .description("Report current data versions compared to the versions specified in ./migrator-config.js or ./migrator-config-[env].js")
    .option("-s, --silent", "Silence verbose status logging")
    .action(async (env, options) => {
      const config = await loadAndCheckConfig(env, options);
      const db = await connectToMongo({ mongoUrl: MONGO_URL });
      const tracks = await checkDatabaseVersions({
        db,
        tracks: config.tracks
      });
      printReport(tracks);

      const someMigrationsNeeded = tracks.find((track) => track.isMigrationNeeded);
      if (someMigrationsNeeded) {
        log(`Some migrations are needed. Run 'migrator migrate${env ? ` ${env}` : ""}' to migrate data.`);
      } else {
        log("No migrations needed");
      }

      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });
}

module.exports = register;
