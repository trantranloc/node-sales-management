const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Bill = require('../models/Bill');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const Customer = require('../models/Customer');

// Route: Hiển thị giỏ hàng
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId; // Lấy employeeId từ session
        const orders = await Order.find({ employeeId })
            .populate('orderItems.productId')
            .populate('customerId');

        // Kiểm tra nếu không có đơn hàng nào
        if (!orders.length || !orders[0].orderItems.length) {
            return res.render('layout', {
                content: 'pages/orders',
                orderItems: [],
                totalPrice: 0,
                totalQuantity: 0,
                orderId: null,
                customer: null,
                employeeId,
            });
        }

        // Lấy thông tin từ đơn hàng đầu tiên
        const { orderItems, customerId: customer, _id: orderId } = orders[0];

        // Tính tổng giá trị và tổng số lượng sản phẩm
        let totalPrice = 0;
        let totalQuantity = 0;
        for (const item of orderItems) {
            totalPrice += item.price * item.quantity;
            totalQuantity += item.quantity;
        }

        // Render lại trang giỏ hàng với các dữ liệu tính toán
        res.render('layout', {
            content: 'pages/orders',
            orderItems,
            totalPrice,
            totalQuantity,
            orderId,
            customer,
            employeeId,
        });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).send('Có lỗi khi lấy giỏ hàng.');
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

// Route: Cộng 1 sản phẩm vào giỏ hàng
router.post('/increase/:id', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const productId = req.params.id;

        // Tìm đơn hàng của nhân viên
        let order = await Order.findOne({ employeeId });

        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại.');
        }

        // Tìm sản phẩm trong orderItems
        const item = order.orderItems.find(item => item.productId.toString() === productId);

        if (item) {
            item.quantity += 1;
        } else {
            return res.status(404).send('Sản phẩm không tồn tại trong đơn hàng.');
        }

        await order.save();
        res.redirect('/orders');
    } catch (e) {
        console.error('Error increasing product quantity:', e);
        res.status(500).send('Có lỗi xảy ra khi tăng số lượng sản phẩm.');
    }
});

// Route: Trừ 1 sản phẩm vào giỏ hàng
router.post('/decrease/:id', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session.employeeId;
        const productId = req.params.id;

        // Tìm đơn hàng của nhân viên
        let order = await Order.findOne({ employeeId });

        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại.');
        }

        // Tìm sản phẩm trong orderItems
        const item = order.orderItems.find(item => item.productId.toString() === productId);

        if (item) {
            item.quantity -= 1;
        } else {
            return res.status(404).send('Sản phẩm không tồn tại trong đơn hàng.');
        }
        if (item.quantity <= 0) {
            order.orderItems = order.orderItems.filter(item => item.productId.toString() !== productId);

        }

        await order.save();
        res.redirect('/orders');
    } catch (e) {
        console.error('Error increasing product quantity:', e);
        res.status(500).send('Có lỗi xảy ra khi tăng số lượng sản phẩm.');
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
router.post('/checkout', isAuthenticated, async (req, res) => {
    try {
        const employeeId = req.session?.employeeId;
        const { paymentMethod, discountPercentage = 0, discountAmount = 0 } = req.body;

        // Lấy đơn hàng từ database
        const order = await Order.findOne({ employeeId }).populate('orderItems.productId');
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để thanh toán' });
        }

        // Tính tổng tiền và giảm giá
        let discount = 0;
        let totalAmount = order.totalAmount;

        if (discountPercentage > 0 && discountPercentage < 100) {
            discount += totalAmount * (discountPercentage / 100);
            totalAmount -= discount;
        } else if (discountPercentage >= 100) {
            return res.status(400).json({ message: 'Giảm giá theo phần trăm phải nhỏ hơn 100%' });
        }

        if (discountAmount > 0 && discountAmount < totalAmount) {
            discount += discountAmount;
            totalAmount -= discountAmount;
        } else if (discountAmount >= totalAmount) {
            return res.status(400).json({ message: 'Giảm giá theo số tiền phải nhỏ hơn tổng tiền' });
        }

        // Lấy mã hóa đơn mới
        const lastBillCode = await Bill.findOne().sort({ code: -1 });
        const codeBill = lastBillCode ? lastBillCode.code + 1 : 1000;

        // Tạo hóa đơn
        await Bill.create({
            employeeId: order.employeeId,
            customerId: order.customerId,
            items: order.orderItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.price,
            })),
            paymentMethod,
            totalAmount,
            discount,
            code: codeBill,
            createdAt: new Date(),
        });

        // Cập nhật kho
        for (const item of order.orderItems) {
            const product = item.productId;
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        // Cập nhật thông tin khách hàng
        const customer = await Customer.findById(order.customerId);
        if (customer) {
            customer.purchase += 1;
            customer.total += totalAmount;
            await customer.save();
        }

        // Xóa đơn hàng sau khi thanh toán
        await Order.deleteOne({ _id: order._id });

        res.redirect('/orders');
    } catch (err) {
        console.error('Error processing checkout:', err);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi xử lý thanh toán' });
    }
});

// Route: Tìm kiếm sản phẩm
router.get('/search', isAuthenticated, async (req, res) => {
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

module.exports = router;
