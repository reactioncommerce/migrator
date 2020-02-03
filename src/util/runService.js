const path = require("path");
const { Worker } = require("worker_threads");
const cliProgress = require("cli-progress");

function runService({
  direction,
  importPath,
  log,
  mongoUrl,
  namespace,
  orderedMigrationSteps,
  package,
  path: migrationPath
}) {
  const progressBar = new cliProgress.SingleBar({
    stream: process.stdout
  }, cliProgress.Presets.shades_classic);

  let started = false;

  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "./worker.js"), {
      workerData: {
        direction,
        importPath,
        mongoUrl,
        namespace,
        orderedMigrationSteps,
        package,
        path: migrationPath
      }
    });
    worker.on("message", (data) => {
      if (data.done) {
        progressBar.stop();
        resolve(data.result);
      } else if (data.progress || data.progress === 0) {
        if (!started) {
          progressBar.start(100, 0);
          started = true;
        }
        progressBar.update(data.progress);
      } else {
        log(...data.log);
      }
    });
    worker.on("error", (error) => {
      progressBar.stop();
      reject(error);
    });
    worker.on("exit", (code) => {
      progressBar.stop();
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    })
  })
}

module.exports = runService;
