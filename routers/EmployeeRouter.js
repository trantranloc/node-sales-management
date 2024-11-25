const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Route: Lấy danh sách nhân viên
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('layout', { content: 'pages/employees', employees });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy danh sách nhân viên');
    }
});

// Route: Thêm nhân viên mới
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { name, email, password = "123456", phone, address, salary, role } = req.body;
        const employeeCount = await Employee.countDocuments();
        const username = `NV${employeeCount + 1}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            name,
            username,
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
        console.error(error);
        res.status(500).send('Lỗi khi thêm nhân viên');
    }
});

// Route: Xóa nhân viên
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        await Employee.findByIdAndDelete(id);
        res.redirect('/employees');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi xóa nhân viên');
    }
});

// Route: Cập nhật thông tin nhân viên
router.post('/edit/:id', isAuthenticated, async (req, res) => {
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
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật thông tin');
    }
});

// Route: Xem thông tin chi tiết nhân viên
router.get('/detail/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        res.render('layout', { content: 'pages/employee-detail', employee });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tìm nhân viên');
    }
});

// Route: Tìm kiếm nhân viên
router.get('/search', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.q;
    try {
        const employee = searchQuery
            ? await Employee.find({
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { phone: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            }) : await Employee.find();
        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tìm kiếm nhân viên');
    }
});

// Route: Thay đổi mật khẩu
router.post('/change-password/:employeeId', isAuthenticated, async (req, res) => {
    try {
        const { employeeId } = req.params; // Lấy employeeId từ URL params
        const { currentPassword, newPassword } = req.body; // Nhận dữ liệu từ body request

        // Lấy thông tin nhân viên
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).send('Nhân viên không tồn tại');

        // Kiểm tra mật khẩu hiện tại
        const isPasswordMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isPasswordMatch) {
            return res.status(400).send('Mật khẩu hiện tại không đúng');
        }

        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        employee.password = hashedPassword;
        await employee.save();

        res.redirect(`/employees/detail/${employeeId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi thay đổi mật khẩu');
    }
});
// Route: Đặt lại mật khẩu ban đầu 123456
router.post('/reset-password/:employeeId', isAuthenticated, async (req, res) => {
    try {
        const { employeeId } = req.params; // Lấy employeeId từ URL params
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).send('Nhân viên không tồn tại');
        const hashedPassword = await bcrypt.hash('123456', 10);
        employee.password = hashedPassword;
        await employee.save();
        res.redirect(`/employees`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi đặt lại mật khẩu');
    }
});


// Router: Cập nhật lại mật khẩu thành mạc định
router.post('/reset-password/:employeeId', isAuthenticated, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const newPassword = "123456";
        // Lấy thông tin nhân viên
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).send('Nhân viên không tồn tại');
        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        employee.password = hashedPassword;
        await employee.save();
        res.redirect(`/employees/detail/${employeeId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật lại mật khẩu');
    }
});
module.exports = router;
