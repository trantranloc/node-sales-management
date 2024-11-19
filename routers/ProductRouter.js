const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình Multer để lưu ảnh trong thư mục "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Route: Danh sách sản phẩm 
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.render('layout', { content: 'pages/products', products });
});
// Route: Sử lý thêm sản phẩm
router.post('/add', upload.single('image'), async (req, res, next) => {
    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    if (!req.file) {
        return res.send('Please upload a file');
    }
    console.log('Uploaded file:', req.file);
    const { code, name, price, discount, description, category, stock, status } = req.body;
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

    const newProduct = new Product({
        image: imageUrl, name, description, price: Number(price), code, discount, category, stock, status
    });

    await newProduct.save();
    res.redirect('/products');
});


// Route: Sửa sản phẩm
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { code, name, price, discount, description, category, stock, status } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    const imageUrl = req.file ? `uploads/${req.file.filename}` : product.image;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            code,
            name,
            price,
            discount,
            description,
            category,
            stock,
            status,
            image: imageUrl
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình sửa sản phẩm', error: error.message });
    }
});

// Route: Xóa sản phẩm
router.get('/delete/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404).send({ message: 'Product không tìm thấy.' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
});


module.exports = router;