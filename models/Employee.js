const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String},
    email: { type: String, unique: true },
    password: { type: String, minlength: 3, default: "123456" },
    phone: { type: String },
    address: { type: String },
    startDate: { type: Date },
    salary: { type: Number, min: 0 },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;