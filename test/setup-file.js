const mongoose = require("mongoose");

let conn;
beforeEach(async () => {
  conn = await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  await conn.connection.db.dropDatabase();
  await mongoose.disconnect();
});
