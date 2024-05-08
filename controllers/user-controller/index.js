const createUser = require("./create-user");
const getUser = require("./get-user");
const deleteUser = require("./delete-user");
const updateUserFirstName = require("./update-user-first-name");
const updateUserLastName = require("./update-user-last-name");
const updateUserUsername = require("./update-user-username");
const updateUserPassword = require("./update-user-password");
const browsePeople = require("./browse-people");

module.exports = {
  createUser,
  getUser,
  deleteUser,
  updateUserFirstName,
  updateUserLastName,
  updateUserUsername,
  updateUserPassword,
  browsePeople,
};
