const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user-model");
const FriendModel = require("../models/friend-model");
const MessageModel = require("../models/message-model");

let mongoServer;

async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  // create test users
  const testUser1 = new UserModel({
    firstName: "john",
    lastName: "doe",
    userName: "jd",
    password: await bcrypt.hash("jd1234", 10),
  });

  const testUser2 = new UserModel({
    firstName: "sam",
    lastName: "elliot",
    userName: "se",
    password: await bcrypt.hash("se1234", 10),
  });

  const testUser3 = new UserModel({
    firstName: "bill",
    lastName: "gates",
    userName: "bg",
    password: await bcrypt.hash("bg1234", 10),
  });

  const testUser4 = new UserModel({
    firstName: "steve",
    lastName: "harvey",
    userName: "sh",
    password: await bcrypt.hash("sh1234", 10),
  });

  await testUser1.save();
  await testUser2.save();
  await testUser3.save();
  await testUser4.save();

  // add testUser2 to testUser1's friend list
  const testUser1Friend1 = new FriendModel({
    user: testUser1.id,
    friend: testUser2.id,
  });

  // add testUser1 to testUser2's friend list
  const testUser2Friend1 = new FriendModel({
    user: testUser2.id,
    friend: testUser1.id,
  });

  await testUser1Friend1.save();
  await testUser2Friend1.save();

  const messageFromTestUser1ToTestUser2 = new MessageModel({
    senderID: testUser1.id,
    receiverID: testUser2.id,
    content: "hello",
  });

  const messageFromTestUser2ToTestUser1 = new MessageModel({
    senderID: testUser2.id,
    receiverID: testUser1.id,
    content: "olleh",
  });

  await messageFromTestUser1ToTestUser2.save();
  await messageFromTestUser2ToTestUser1.save();
}

module.exports = {
  Memory: true,
  IP: "127.0.0.1",
  Port: "27017",
  Database: "testDB",
  connectTestDB,
};
