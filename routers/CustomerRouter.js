const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Route: Hiển thị danh sách khách hàng
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.render('layout', { content: 'pages/customers', customers });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Route: Thêm khách hàng vào giỏ hàng
router.post('/add', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        // Tạo và lưu khách hàng mới
        const customer = new Customer({ name, email, phone });
        await customer.save();

        // Chuyển hướng đến trang đặt hàng sau khi thêm khách hàng
        res.redirect('/orders');
    } catch (error) {
        console.error('Lỗi khi thêm khách hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Route: Tìm kiếm khách hàng
router.get('/search', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.q;

    try {
        // Kiểm tra xem có tìm kiếm gì không, nếu có thì tìm kiếm khách hàng
        const customers = searchQuery
            ? await Customer.find({
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { phone: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            })
            : await Customer.find();

        res.json(customers);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm khách hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Route: Xóa khách hàng
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        // Xóa khách hàng theo ID
        await Customer.findByIdAndDelete(req.params.id);
        res.redirect('/customers');
    } catch (error) {
        console.error('Lỗi khi xóa khách hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

module.exports = router;
