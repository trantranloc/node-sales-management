const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    const customers = await Customer.find();
    res.render('layout', { content: 'pages/customers', customers });
});
router.post('/add', async (req, res) => {
    const { name, email, phone } = req.body;
    const customer = new Customer({ name, email, phone });
    await customer.save();
    res.redirect('/orders');
});
// Route: Tìm kiếm khách hàng
router.get('/search', async (req, res) => {
    const searchQuery = req.query.q || '';
    try {
        customer = await Customer.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } }, // Tìm kiếm tên sản phẩm
                { phone: { $regex: searchQuery, $options: 'i' } }  // Tìm kiếm mã sản phẩm
            ]
        });
        res.json(customer);
    } catch (error) {
        console.log(error);
    }
});
// Route: Xóa khách hàng
router.get('/delete/:id', async (req, res) => {
    await Customer.findOneAndDelete(req.params.id);
    res.redirect('/customers');
});
// Route: Thêm khách hàng vào giỏ hàng
router.post('/add-to-order/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const orderId = req.body.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Thêm khách hàng vào đơn hàng
        order.customerId = customer._id;
        await order.save();

        res.json({ message: 'Customer added to order successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






module.exports = router;