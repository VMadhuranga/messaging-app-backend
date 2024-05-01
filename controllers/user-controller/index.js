const createUser = require("./create-user");
const getUser = require("./get-user");
const deleteUser = require("./delete-user");
const updateUserFirstName = require("./update-user-first-name");
const updateUserLastName = require("./update-user-last-name");
const updateUserUsername = require("./update-user-username");

module.exports = {
  createUser,
  getUser,
  deleteUser,
  updateUserFirstName,
  updateUserLastName,
  updateUserUsername,
};
