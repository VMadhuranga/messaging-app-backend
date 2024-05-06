const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  senderID: { type: Schema.Types.ObjectId, required: true },
  receiverID: { type: Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Message", MessageSchema);
