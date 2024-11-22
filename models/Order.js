const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    orderItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
    }],
    paymentMethod: { type: String, enum: ['cash', 'card', 'online'],default: 'cash'}
});

module.exports = mongoose.model('Order', orderSchema);
