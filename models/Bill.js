const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    code: Number,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number },
        price: { type: Number },
    }],
    paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    totalAmount: { type: Number },
    discount: Number,
    createdAt: { type: Date, default: Date.now },
});
const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
