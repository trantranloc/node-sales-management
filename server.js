// Import các thư viện
const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session')
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();

// Cổng cho server
const port = 3001;

// Kết nối với MongoDB
mongoose.connect('mongodb://localhost:27017/crud', { useNewUrlParser: true })
    .then(() => console.log('Kết nối thành công MongoDB'))
    .catch(err => console.error('Kết nối thất bại MongoDB', err));

// CORS cho phép yêu cầu từ các nguồn khác nhau
app.use(cors());

// Tạo session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Cấu hình view engine sử dụng EJS 
app.set('view engine', 'ejs');
// Đặt thư mục chứa các file view EJS
app.set('views', path.join(__dirname, 'views'));

// Tạo thư mục cho các tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));
// Tạo thư mục cho các tệp hình ảnh
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Cấu hình các middleware để xử lý các yêu cầu gửi lên
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Middleware để lưu thông tin người dùng vào locals
app.use((req, res, next) => {
    res.locals.employeeId = req.session.employeeId || null;  // Truyền employeeId vào view
    res.locals.role = req.session.role || null;  // Truyền role vào view
    next();
});


// Cấu hình các route sử dụng các router riêng biệt
const indexRouter = require('./routers/Global');
const employeeRouter = require('./routers/EmployeeRouter');
const productRouter = require('./routers/ProductRouter');
const orderRouter = require('./routers/OrderRouter');
const customerTouter = require('./routers/CustomerRouter');
const billRouter = require('./routers/BillRouter');

// Đăng ký các router với các đường dẫn tương ứng
app.use('/', indexRouter);
app.use('/employees', employeeRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/customers', customerTouter);
app.use('/bills', billRouter);

// Khởi động server
app.listen(port, function () {
    console.log(`Server is running on port http://localhost:${port}`);
})
