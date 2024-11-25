const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Bill = require('../models/Bill');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');


// Route: Hiển thị danh sách hoá đơn
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const selectedDate = req.query.selectedDate || moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
        const startOfDay = moment(selectedDate).startOf('day').toDate();
        const endOfDay = moment(selectedDate).endOf('day').toDate();

        const bills = await Bill.find({
            employeeId,
            // greater than or equal to, less than or equal to
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        })
            .populate('items.productId')
            .populate('customerId')
            .populate('employeeId');



        // Tính toán tổng tiền cho từng hóa đơn
        bills.forEach((bill) => {
            bill.totalAmount = bill.items.reduce((total, item) => {
                const productPrice = item.productId.price || 0; // Giá sản phẩm
                const quantity = item.quantity || 0; // Số lượng sản phẩm
                return total + productPrice * quantity; // Tính tổng
            }, 0);
        });

         // Truyền lại danh sách hóa đơn cho trang overview
        res.render('layout', {
            content: 'pages/bills',
            bills: bills.length > 0 ? bills : [],
            selectedDate
        });

    } catch (err) {
        console.error('Error fetching bills:', err);
        res.status(500).send('Có lỗi khi lấy danh sách hoá đơn.');
    }
});

// Route: Tìm kiếm hóa đơn
router.get('/search', isAuthenticated, async (req, res) => {
    res.send('Tìm kiếm hóa đơn chưa được triển khai');
});



module.exports = router;
