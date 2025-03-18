const { Schema, model } = require('mongoose');

const requestSchema = new Schema({
  license_key: { type: String, default: 'None' },
  ip: { type: String, required: true },
  hwid: { type: String, default: 'None' },
  status: { type: String, required: true },
  code: { type: Number, required: true },
  country: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = model('Request', requestSchema);