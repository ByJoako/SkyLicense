const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    name: String,
    description: String,
    role_id: String,
    versions: Array,
    created_at: { type: Number, default: Date.now() },
});

module.exports = model('Product', productSchema);