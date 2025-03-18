const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  email: { type: String },
  role: { type: String, enum: ['User', 'Admin', 'Owner'], default: 'User' },
  isBanned: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);