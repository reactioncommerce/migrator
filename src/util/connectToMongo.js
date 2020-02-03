const mongodb = require("mongodb");

/**
 * @summary Given a MongoDB URL, creates a connection to it
 * @param {Object} options Options object
 * @param {String} options.mongoUrl MongoDB connection URL
 * @return {Promise<Db>} Db instance
 */
async function connectToMongo({ mongoUrl } = {}) {
  const client = await mongodb.MongoClient.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return client.db();
}

module.exports = connectToMongo;
