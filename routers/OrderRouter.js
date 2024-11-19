const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Bill = require('../models/Bill');
const isAuthenticated = require('../middlewares/authMiddleware')

// Hàm tiện ích: Tính tổng giá trị và số lượng giỏ hàng
function calculateCartTotals(orderItems) {
    let totalPrice = 0;
    let totalQuantity = 0;

    orderItems.forEach(item => {
        totalPrice += item.price * item.quantity;
        totalQuantity += item.quantity;
    });

    return { totalPrice, totalQuantity };
}

// Route: Hiển thị giỏ hàng
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        // Tìm tất cả các đơn hàng của nhân viên với orderItems
        const orders = await Order.find({ employeeId })
            .populate('orderItems.productId')  // Populate productId trong orderItems
            .populate('customerId');  // Populate thông tin khách hàng

        // Kiểm tra xem có đơn hàng nào không
        if (!orders || orders.length === 0 || !orders[0].orderItems.length) {
            return res.render('layout', {
                content: 'pages/orders',
                orderItems: [],
                totalPrice: 0,
                totalQuantity: 0,
                orderId: null,
                employeeId: employeeId,
                customer: null
            });
        }

        // Lấy orderId của đơn hàng đầu tiên (hoặc có thể thay đổi theo yêu cầu)
        const orderId = orders[0]._id;

        // Lấy các orderItems của đơn hàng đầu tiên
        const orderItems = orders[0].orderItems;
        const customer = orders[0].customerId;

        // Tính toán tổng giá trị và tổng số lượng sản phẩm
        const { totalPrice, totalQuantity } = calculateCartTotals(orderItems);

        // Render lại trang giỏ hàng với các dữ liệu tính toán
        res.render('layout', {
            content: 'pages/orders',
            orderItems,
            totalPrice,
            totalQuantity,
            orderId: orderId,
            customer
        });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).send('Có lỗi khi lấy giỏ hàng.');
    }
});

// Route: Tìm kiếm sản phẩm
router.get('/search', async (req, res) => {
    const searchQuery = req.query.q || '';
    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { code: { $regex: searchQuery, $options: 'i' } },
            ],
        });
        res.json(products);
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).send('Có lỗi xảy ra khi tìm kiếm sản phẩm.');
    }
});

// Route: Xóa sản phẩm khỏi giỏ hàng
router.post('/remove-product/:orderId/:productId', isAuthenticated, async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại.');
        }
        const productIndex = order.orderItems.findIndex(item => item.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send('Sản phẩm không có trong đơn hàng.');
        }
        order.orderItems.splice(productIndex, 1);
        await order.save();
        res.redirect('/orders');
    } catch (err) {
        console.error('Error removing product from order:', err);
        res.status(500).send('Có lỗi xảy ra khi xóa sản phẩm.');
    }
});

// Route: Thêm sản phẩm vào giỏ hàng
router.post('/add/:id', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const productId = req.params.id;

        // Tìm đơn hàng của nhân viên
        let order = await Order.findOne({ employeeId, customerId: null }); // Giả sử customerId là null lúc này

        // Nếu không có đơn hàng, tạo một đơn hàng mới
        if (!order) {
            order = new Order({
                employeeId,
                orderItems: [],
                customerId: null,
            });
            await order.save();
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = order.orderItems.find(item => item.productId.toString() === productId);

        // Nếu sản phẩm đã có, tăng số lượng
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Nếu chưa có sản phẩm, thêm sản phẩm mới vào giỏ hàng
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send('Sản phẩm không tồn tại.');
            }

            // Thêm sản phẩm vào giỏ hàng
            order.orderItems.push({
                productId,
                quantity: 1,
                price: product.price, // Giả sử giá của sản phẩm được lấy từ cơ sở dữ liệu
            });
        }

        // Cập nhật tổng số tiền và lưu đơn hàng
        order.totalAmount = order.orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        await order.save();

        // Redirect đến giỏ hàng
        res.redirect('/orders');
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
    }
});

// Route: Thêm khách hàng vào đơn hàng
router.get('/customer-add-order/:customerId', isAuthenticated, async (req, res) => {
    try {
        const { customerId } = req.params;
        const employeeId = req.session.employeeId;

        const orderE = await Order.findOne({ employeeId });
        // console.log(orderE._id);  

        const order = await Order.findByIdAndUpdate(
            orderE._id,
            { customerId },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
        }

        res.redirect('/orders')
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route: Xóa khách hàng khỏi đơn hàng
router.get('/customer-remove-order/:customerId', isAuthenticated, async (req, res) => {
    try {
        const { customerId } = req.params;
        const employeeId = req.session.employeeId;

        const orderE = await Order.findOne({ employeeId });
        // console.log(orderE._id);  

        const order = await Order.findByIdAndUpdate(
            orderE._id,
            { customerId: null },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
        }

        res.redirect('/orders')
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route: Xử lý thanh toán
router.post('/change-password/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params; // Lấy employeeId từ URL params
        const { currentPassword, newPassword, confirmPassword } = req.body; // Nhận dữ liệu từ body request

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).send('Nhân viên không tồn tại');
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isPasswordMatch) {
            req.flash('error', 'Mật khẩu hiện tại không đúng');
            return res.redirect(`/employees/change-password/${employeeId}`);
        }

        // Kiểm tra mật khẩu mới và xác nhận
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Mật khẩu mới và xác nhận mật khẩu mới không khớp');
            return res.redirect(`/employees/change-password/${employeeId}`);
        }

        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        employee.password = hashedPassword;
        await employee.save();

        res.redirect(`/employees/detail/${employeeId}`);
    } catch (err) {
        handleError(res, err, 'Lỗi khi thay đổi mật khẩu');
    }
});







module.exports = router;
