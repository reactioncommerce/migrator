const envalid = require("envalid");

const { MONGO_URL } = envalid.cleanEnv(process.env, {
  MONGO_URL: envalid.str({
    desc: "A valid MongoDB connection string URI, ending with the database name",
    example: "mongodb://localhost:27017/dbname"
  })
});

module.exports = {
  CONFIG_ENV_FILE_NAME: "migrator.config-[env].js",
  CONFIG_FILE_NAME: "migrator.config.js",
  MIGRATIONS_COLLECTION_NAME: "migrations",
  MONGO_URL
};
