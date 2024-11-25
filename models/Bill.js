const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    code: Number,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, min: 1 },
        price: { type: Number },
    }],
    paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    totalAmount: { type: Number },
    discount: Number,
    createdAt: { type: Date, default: Date.now },
});
// // Middleware: Phát sự kiện khi có thay đổi hoá đơn
// billSchema.post('save', async function (doc) {
//     const totalRevenue = await mongoose.model('Bill').aggregate([
//         { 
//             $group: { 
//                 _id: null, 
//                 total: { $sum: '$totalAmount' } 
//             }
//         }
//     ]);

//     const revenue = totalRevenue[0]?.total || 0;
//     revenueEmitter.emit('revenueUpdated', revenue); // Phát sự kiện
// });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
