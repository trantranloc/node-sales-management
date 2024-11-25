const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Bill = require('../models/Bill');
const isAuthenticated = require('../middlewares/authMiddleware');


// let todayRevenue = 0; // Biến lưu tổng doanh thu hôm nay

// // Lắng nghe sự kiện cập nhật doanh thu
// revenueEmitter.on('revenueUpdated', (newRevenue) => {
//     todayRevenue = newRevenue;
//     console.log(`Doanh thu hôm nay được cập nhật: ${todayRevenue}`);
// });

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


// //doanh thu 
// // Ví dụ Node.js
// app.get('/bills', (req, res) => {
//     // Giả sử bills là danh sách các hóa đơn
//     const bills = [
//         { code: 1, totalAmount: 500000 },
//         { code: 2, totalAmount: 300000 },
//         { code: 3, totalAmount: 200000 }
//     ];

//     // Tính tổng doanh thu
//     const totalRevenue = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);

//     // Render view với tổng doanh thu
//     res.render('bills', { bills: bills, totalRevenue: totalRevenue });
// });


module.exports = router;
