const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill'); // Giả sử bạn đã tạo model Bill

// Route: Hiển thị danh sách hoá đơn
router.get('/', async (req, res) => {
    try {
        // Lấy tất cả các hoá đơn của người dùng (nếu có)
        const customerId = req.session.customerId; // Lấy customerId từ session
        const bills = await Bill.find({ customerId }).populate('orderItems.productId'); // Giả sử orderItems chứa sản phẩm trong hoá đơn

        if (!bills || bills.length === 0) {
            return res.render('layout', {
                content: 'pages/bills',
                bills: [],
                message: 'Không có hoá đơn nào.',
            });
        }

        // Render trang hoá đơn với dữ liệu hoá đơn
        res.render('layout', {
            content: 'pages/bills',
            bills,
        });
    } catch (err) {
        console.error('Error fetching bills:', err);
        res.status(500).send('Có lỗi khi lấy danh sách hoá đơn.');
    }
});

module.exports = router;
