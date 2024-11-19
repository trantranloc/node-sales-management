const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'] },
    password: { type: String, required: true, minlength: 6, default: "123456" },
    phone: { type: String },
    address: { type: String },
    position: { type: String },
    shift: { type: String },
    startDate: { type: Date },
    salary: { type: Number, min: 0 },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;