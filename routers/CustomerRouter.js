const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.render('layout', { content: 'pages/customers', customers }); // Truyền dữ liệu khách hàng vào giao diện
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Route: Thêm khách hàng vào giỏ hàng
router.post('/add', async (req, res) => {
    const { name, email, phone } = req.body;
    const customer = new Customer({ name, email, phone });
    await customer.save();
    res.redirect('/orders');
});
// Route: Tìm kiếm khách hàng
router.get('/search', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.q;
    try {
        customer = searchQuery
            ? await Customer.find({
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } }, // Tìm kiếm tên sản phẩm
                    { phone: { $regex: searchQuery, $options: 'i' } }, // Tìm kiếm mã sản phẩm
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            }) : await Customer.find();
        res.json(customer);
    } catch (error) {
        console.log(error);
    }
});
// Route: Xóa khách hàng
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    await Customer.findOneAndDelete(req.params.id);
    res.redirect('/customers');
});






module.exports = router;