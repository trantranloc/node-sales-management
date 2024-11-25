

// Middleware: Kiểm tra đăng nhập
function isAuthenticated(req, res, next) {
    if (!req.session.employeeId) return res.redirect('/login'); // Kiểm tra session
    next();
}

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
    if (req.session.role && req.session.role === 'admin') {
        return next();
    } else {
        return res.render('pages/error')
    }
}

module.exports = { isAuthenticated, isAdmin };