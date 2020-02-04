/**
 * This is a worker script that runs in a separate thread.
 * See https://nodejs.org/api/worker_threads.html
 */
const { workerData, parentPort } = require("worker_threads");

const connectToMongo = require("./connectToMongo.js");
const pushDatabaseRunInfo = require("./pushDatabaseRunInfo.js");
const updateDatabaseVersion = require("./updateDatabaseVersion.js");
const validateAndTransformVersion = require("./validateAndTransformVersion.js");

const {
  direction,
  importPath,
  mongoUrl,
  namespace,
  orderedMigrationSteps,
  package,
  path
} = workerData;

async function main() {
  const log = (...args) => {
    parentPort.postMessage({ log: args });
  };

  const db = await connectToMongo({ mongoUrl });
  log(`Connected to MongoDB database "${db.databaseName}"`);

  // Run each track migration in series
  for (const step of orderedMigrationSteps) {
    const { endVersion, stepVersion, startVersion } = step;

    log(`\nMigrating "${namespace}" namespace ${direction} from ${startVersion} to ${endVersion}...`);

    const startedAt = new Date();
    let result;
    try {
      // Functions cannot be passed between threads so we
      // re-import the migration functions here.
      const { migrations: packageMigrationConfig } = await import(importPath);
      const track = packageMigrationConfig.tracks.find((track) => track.namespace === namespace);
      const versionKey = Object.getOwnPropertyNames(track.migrations).find((version) => validateAndTransformVersion(version) === stepVersion);
      const stepFn = track.migrations[versionKey][direction];

      if (direction === "down" && typeof stepFn !== "function") {
        if (stepFn === "unnecessary") {
          result = "unnecessary";
        } else {
          log(`Migrating "${namespace}" namespace ${direction} from ${startVersion} to ${endVersion} is not possible. Restore from a database backup instead.`, "error");
          break;
        }
      } else {
        result = await stepFn({
          db,
          progress(percent) {
            parentPort.postMessage({ progress: percent });
          }
        });
        if (result === null || result === undefined) {
          result = "succeeded";
        }
        if (typeof result !== "string") {
          throw new Error(`${direction} function returned a non-string value`);
        }
      }
    } catch (error) {
      parentPort.postMessage({ progress: 0 });
      log("\n");
      log(error.stack || error, "error");
      log(`\nThe above error occurred in the "${direction}" function for the "${stepVersion}" version in the "${namespace}" namespace, which is defined in ${package ? `the "${package}" package` : path}`, "error");
      const endedAt = new Date();
      await pushDatabaseRunInfo({
        db,
        namespace,
        runInfo: {
          endedAt,
          endVersion,
          completed: false,
          result: error.message,
          startedAt,
          startVersion
        }
      });
      break;
    }

    const endedAt = new Date();
    await updateDatabaseVersion({
      db,
      namespace,
      runInfo: {
        endedAt,
        endVersion,
        completed: true,
        result,
        startedAt,
        startVersion
      },
      version: endVersion
    });
    log(`\n✓ ${namespace} is now at ${endVersion}.`);
  }
}

main()
  .then((result) => {
    parentPort.postMessage({ done: true, result });
  })
  .catch((error) => {
    throw error;
  });
