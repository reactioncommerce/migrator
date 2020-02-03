const path = require("path");
const checkConfig = require("./checkConfig.js");
const loadConfig = require("./loadConfig.js");
const log = require("./log.js");

const {
  CONFIG_FILE_NAME,
  CONFIG_ENV_FILE_NAME
} = require("../constants.js");

async function loadAndCheckConfig(env, { silent }) {
  let fileName;
  if (env) {
    fileName = CONFIG_ENV_FILE_NAME.replace("[env]", env);
  } else {
    fileName = CONFIG_FILE_NAME;
  }
  const configFilePath = path.join(process.cwd(), fileName);

  const config = await loadConfig(configFilePath, {
    log(status, level) {
      if (silent) return;
      log(status, level);
    }
  });
  if (!config) process.exit(1);

  const isValid = checkConfig(config, {
    log(status, level) {
      if (silent) return;
      log(status, level);
    }
  });
  if (!isValid) process.exit(1);

  return config;
}

module.exports = loadAndCheckConfig;
