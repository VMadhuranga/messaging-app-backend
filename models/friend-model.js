const mongoose = require("mongoose");
const { Schema } = mongoose;

const FriendSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true },
  friend: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Friend", FriendSchema);
