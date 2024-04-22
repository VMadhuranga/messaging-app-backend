const mongoose = require("mongoose");
const { Schema } = mongoose;

const FriendSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true },
  friendID: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model("Friend", FriendSchema);
