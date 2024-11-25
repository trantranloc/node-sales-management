const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Cấu hình Multer để lưu ảnh trong thư mục "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    cb(isValid ? null : new Error('Error: Images Only!'), isValid);
};

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Route: Danh sách sản phẩm 
router.get('/', isAuthenticated,isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('layout', { content: 'pages/products', products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy sản phẩm');
    }
});

// Route: Sử lý thêm sản phẩm
router.post('/add', upload.single('image'), async (req, res) => {
    const { code, name, price, discount, description, category, stock, status } = req.body;
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

    const newProduct = new Product({
        image: imageUrl, name, description, price: Number(price), code, discount, category, stock, status
    });

    try {
        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi thêm sản phẩm');
    }
});

// Route: Sửa sản phẩm
router.post('/edit/:id', upload.single('image'), isAuthenticated, async (req, res) => {
    const { code, name, price, discount, description, category, stock, status } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const imageUrl = req.file ? `uploads/${req.file.filename}` : product.image;

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            code, name, price, discount, description, category, stock, status, image: imageUrl
        }, { new: true });

        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi sửa sản phẩm');
    }
});

// Route: Xóa sản phẩm
router.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: 'Sản phẩm không tìm thấy' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi xóa sản phẩm');
    }
});

// Route: Danh sách sản phẩm với bộ lọc danh mục
router.get('/filter', isAuthenticated, async (req, res) => {
    const { category, stockStatus } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (stockStatus === 'inStock') filter.stock = { $gt: 0 };
    else if (stockStatus === 'outOfStock') filter.stock = 0;

    try {
        const products = await Product.find(filter);
        res.render('layout', { content: 'pages/products', products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy sản phẩm');
    }
});

module.exports = router;
