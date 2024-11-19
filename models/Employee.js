const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true, minlength: 3, default: "123456" },
    phone: { type: String },
    address: { type: String },
    startDate: { type: Date },
    salary: { type: Number, min: 0 },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;