const { Schema, model } = require("mongoose");

const blacklistSchema = new Schema({
  value: { type: String, required: true },
  type: { type: String, enum: ["IP", "HWID", "None"], default: "None" },
  country: { type: String, default: "Unknown" },
  request: { type: Number, default: 0 },
  added_by: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("blacklist", blacklistSchema);