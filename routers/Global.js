const express = require('express');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();


const Bill = require('../models/Bill');
const moment = require('moment-timezone');
const ONE_HOUR_AGO = moment().subtract(1, 'hours').toDate(); // Đơn hàng mới trong 1 giờ qua

// Route cho trang chủ// Route cho trang tổng quan
//edit lại để lấy doanh thu cho trang overview.ejs
const Product = require('../models/Product'); // Giả sử bạn có mô hình Product


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const selectedDate = req.query.selectedDate || moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
        const startOfDay = moment(selectedDate).startOf('day').toDate();
        const endOfDay = moment(selectedDate).endOf('day').toDate();



        // Lấy các đơn hàng mới để cập nhật ở overview.ejs
        const newOrders = await Bill.find({
            employeeId,
            createdAt: { $gte: ONE_HOUR_AGO }
        }).populate('items.productId')
            .populate('customerId');
        // Tính toán tổng tiền cho từng hóa đơn ở phần đơn hàng mới 
        newOrders.forEach((bill) => {
            bill.totalAmount = bill.items.reduce((total, item) => {
                const productPrice = item.productId.price || 0; // Giá sản phẩm
                const quantity = item.quantity || 0; // Số lượng sản phẩm
                return total + productPrice * quantity; // Tính tổng
            }, 0);
        });




        // Lấy tất cả các hóa đơn trong ngày đã chọn
        const bills = await Bill.find({
            employeeId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('items.productId'); // Giả sử mỗi hóa đơn có trường "items" chứa sản phẩm
        // Tính lại totalAmount cho từng hóa đơn (để đảm bảo dữ liệu đồng nhất)
        bills.forEach((bill) => {
            bill.totalAmount = bill.items.reduce((total, item) => {
                const productPrice = item.productId.price || 0;
                const quantity = item.quantity || 0;
                return total + productPrice * quantity;
            }, 0);
        });
        // Tính tổng doanh thu hôm nay
        const todayRevenue = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);

        // Đếm số lượng sản phẩm bán được
        const productSalesCount = {};

        bills.forEach(bill => {
            bill.items.forEach(item => {
                const productId = item.productId._id.toString();
                const quantity = item.quantity;

                // Cộng dồn số lượng sản phẩm bán được
                if (productSalesCount[productId]) {
                    productSalesCount[productId] += quantity;
                } else {
                    productSalesCount[productId] = quantity;
                }
            });
        });

        // Tìm sản phẩm bán chạy nhất (theo số lượng)
        let bestSellingProductId = null;
        let maxQuantity = 0;

        for (const productId in productSalesCount) {
            if (productSalesCount[productId] > maxQuantity) {
                maxQuantity = productSalesCount[productId];
                bestSellingProductId = productId;
            }
        }

        // Lấy thông tin chi tiết của sản phẩm bán chạy nhất
        let bestSellingProduct = null;
        if (bestSellingProductId) {
            bestSellingProduct = await Product.findById(bestSellingProductId);
        }

        // Lấy danh sách các sản phẩm gần hết hàng (stock < 10)
        const lowStockProducts = await Product.find({ stock: { $lt: 30 } });

        // Truyền dữ liệu vào view
        res.render('layout', {
            content: 'pages/overview',
            employeeId,
            role: req.session.role,
            todayRevenue,
            bestSellingProduct, // Truyền sản phẩm bán chạy nhất
            maxQuantity, // Số lượng bán được của sản phẩm bán chạy nhất
            selectedDate,
            lowStockProducts, // Truyền danh sách sản phẩm gần hết hàng
            bills,
            newOrders // Thêm danh sách đơn hàng mới
        });

    } catch (err) {
        console.error('Error fetching bills:', err);
        res.status(500).send('Có lỗi khi lấy danh sách hoá đơn.');
    }
});

//route cho settings page
router.get('/settings', isAuthenticated, (req, res) => {
    const { employeeId, role } = req.session;

    res.render('layout', {
        content: 'pages/settingpage',
        employeeId,
        role
    });
});

// Route cho trang đăng nhập
router.get('/login', (req, res) => {
    if (req.session.employeeId) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

// Route xử lý đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.render('login', { error: 'Email không tồn tại' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.render('login', { error: 'Sai mật khẩu' });
        }

        req.session.employeeId = employee._id;
        req.session.role = employee.role;

        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

// Route cho trang đăng ký
router.get('/register', (req, res) => {
    res.render('register');
});

// Route cho logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Lỗi khi thoát phiên làm việc');
        }
        res.redirect('/login');
    });
});

module.exports = router;

// Hàm tạo tài khoản admin
async function createAdminAccount() {
    try {
        const existingAdmin = await Employee.findOne({ email: 'admin@gmail.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10); // Băm mật khẩu
            const admin = new Employee({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin' // Vai trò admin
            });
            await admin.save();
            console.log('Tài khoản admin đã được tạo thành công.');
        } else {
            console.log('Tài khoản admin đã tồn tại.');
        }
    } catch (err) {
        console.error('Lỗi khi tạo tài khoản admin:', err);
    }
}

// Gọi hàm khi khởi động ứng dụng
createAdminAccount();