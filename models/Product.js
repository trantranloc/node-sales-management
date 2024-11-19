const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    image: String,
    code: String,
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100 },
    description: String,
    category: String,
    stock: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;