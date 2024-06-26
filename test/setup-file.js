const { connectTestDB } = require("../config/testDbConfig");

let conn;
let server;
beforeEach(async () => {
  const { connection, mongoServer } = await connectTestDB();
  conn = connection;
  server = mongoServer;
});

afterEach(async () => {
  await conn.disconnect();
  await server.stop();
});
