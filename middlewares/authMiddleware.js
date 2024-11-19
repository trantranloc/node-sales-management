

// Middleware: Kiểm tra đăng nhập
function isAuthenticated(req, res, next) {
    if (!req.session.employeeId) return res.redirect('/login'); // Kiểm tra session
    next();
}

module.exports = isAuthenticated