const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function initializeTestMongoDBServer() {
  const mongoDBServer = await MongoMemoryServer.create();
  const mongoUri = mongoDBServer.getUri();

  mongoose.connect(mongoUri);

  mongoose.connection.on("error", (e) => {
    if (e.message.code === "ETIMEDOUT") {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
}

module.exports = initializeTestMongoDBServer;
