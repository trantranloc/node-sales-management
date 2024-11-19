const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    orderItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number },
        price: { type: Number },
    }],
    totalAmount: { type: Number },
    paymentMethod: { type: String },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);