const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String },
    email: {type: String, unique: true},
    phone: { type: String },
    purchase: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;