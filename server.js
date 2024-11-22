const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session')
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const port = 3000;



// Gửi yêu cầu cập nhật
// updateOrderItem('orderIdValue', 'productIdValue', 5);
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
mongoose.connect('mongodb://localhost:27017/crud', { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware để lưu thông tin người dùng vào locals
app.use((req, res, next) => {
    res.locals.employeeId = req.session.employeeId || null;  // Truyền employeeId vào layout
    res.locals.role = req.session.role || null;  // Truyền role vào layout
    next();
});


// Cung cấp thư mục uploads như một static folder

const indexRouter = require('./routers/Global');
const employeeRouter = require('./routers/EmployeeRouter');
const productRouter = require('./routers/ProductRouter');
const orderRouter = require('./routers/OrderRouter');
const customerTouter = require('./routers/CustomerRouter');
const billRouter = require('./routers/BillRouter');

app.use('/', indexRouter);
app.use('/employees', employeeRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/customers', customerTouter);
app.use('/bills', billRouter);

app.listen(port, function () {
    console.log(`Server is running on port http://localhost:${port}`);
})
