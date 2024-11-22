const express = require('express');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const isAuthenticated = require('../middlewares/authMiddleware');
const router = express.Router();

// Route cho trang chủ
router.get('/',isAuthenticated, (req, res) => {
    const { employeeId, role } = req.session;

    res.render('layout', {
        content: 'pages/overview',
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
