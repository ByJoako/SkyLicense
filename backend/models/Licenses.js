const { Schema, model } = require('mongoose');

const licenseSchema = new Schema({
    guildId: { type: String },
    product: { type: String },
    license_key: { type: String },
    client_name: { type: String },
    client_id: { type: String },
    description: { type: String },
    expires: { type: Date },
    disabled: { type: Boolean, default: false },
    ip_cap: { type: String },
    ip_expires: { type: Number },
    ip_expires_unit: { type: String },
    ip_list: { type: Array, default: [] },
    hwid_cap: { type: String },
    hwid_expires: { type: Number },
    hwid_expires_unit: { type: String },
    hwid_list: { type: Array, default: [] },
    created_by: { type: String },
    created_at: { type: Date, default: Date.now() },
    update_at: { type: Date, default: Date.now() },
    latest_ip: { type: String },
    latest_hwid: { type: String },
    latest_request: { type: Date, default: Date.now() },
    latest_total: { type: Number, default: 0 },
});

module.exports = model('License', licenseSchema);
