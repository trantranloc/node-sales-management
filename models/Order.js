const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    orderItems: [{

        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, min: 1 },
        price: { type: Number, required: true },
    }],
    totalAmount: { type: Number },
    createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order; 
