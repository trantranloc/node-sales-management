const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    code: Number,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
    }],
    paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    totalAmount: { type: Number },
    discount: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);
