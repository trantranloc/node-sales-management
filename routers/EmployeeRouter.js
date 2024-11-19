const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');

// Helper function to handle errors
const handleError = (res, error, message = 'Đã xảy ra lỗi', statusCode = 500) => {
    console.error(error);
    res.status(statusCode).send(message);
};

// GET: Lấy danh sách nhân viên
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('layout', { content: 'pages/employees', employees });
    } catch (error) {
        handleError(res, error, 'Lỗi khi lấy danh sách nhân viên');
    }
});

// POST: Thêm nhân viên mới
router.post('/add', async (req, res) => {
    try {
        const {
            name, email, password = "123456", phone, address, salary, role
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            startDate: new Date(),
            salary,
            role
        });

        await newEmployee.save();
        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi thêm nhân viên');
    }
});

// GET: Xóa nhân viên
router.get('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        await Employee.findByIdAndDelete(id);
        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi xóa nhân viên');
    }
});

// GET: Hiển thị form sửa nhân viên
router.get('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        res.render('layout', { content: 'pages/employee-update', employee });
    } catch (error) {
        handleError(res, error, 'Lỗi khi tìm nhân viên');
    }
});

// POST: Cập nhật thông tin nhân viên
router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, position, shift, salary, role } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { name, email, phone, address, position, shift, salary, role },
            { new: true }
        );

        if (!updatedEmployee) return res.status(404).send('Nhân viên không tồn tại');

        res.redirect('/employees');
    } catch (error) {
        handleError(res, error, 'Lỗi khi cập nhật thông tin');
    }
});

// GET: Xem thông tin chi tiết nhân viên
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        res.render('layout', { content: 'pages/employee-detail', employee });
    } catch (error) {
        handleError(res, error, 'Lỗi khi tìm nhân viên');
    }
});

module.exports = router;
