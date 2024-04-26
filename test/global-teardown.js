const config = require("../config/testDbConfig");

async function globalTeardown() {
  if (config.Memory) {
    const instance = globalThis.__MONGOINSTANCE;
    await instance.stop();
  }
}

module.exports = globalTeardown;
