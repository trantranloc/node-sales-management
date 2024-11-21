const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Bill = require('../models/Bill');
const isAuthenticated = require('../middlewares/authMiddleware');

// Route: Hiển thị danh sách hoá đơn
router.get('/',isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const selectedDate = req.query.selectedDate || moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'); 
        const startOfDay = moment(selectedDate).startOf('day').toDate();
        const endOfDay = moment(selectedDate).endOf('day').toDate();

        // Truy vấn tất cả hoá đơn trong ngày mà không có tìm kiếm mã đơn hàng
        const bills = await Bill.find({
            employeeId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('items.productId').populate('customerId').populate('employeeId');

        // Nếu không có hoá đơn nào trong ngày, trả về trang với danh sách hoá đơn rỗng
        if (!bills || bills.length === 0) {
            return res.render('layout', {
                content: 'pages/bills',
                bills: [],
                selectedDate
            });
        }

        // Render trang hoá đơn với dữ liệu hoá đơn
        res.render('layout', {
            content: 'pages/bills',
            bills,
            selectedDate
        });
    } catch (err) {
        console.error('Error fetching bills:', err);
        res.status(500).send('Có lỗi khi lấy danh sách hoá đơn.');
    }
});


module.exports = router;
