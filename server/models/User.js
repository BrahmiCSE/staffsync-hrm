const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// One User model covers employees, managers and HR (see "role").
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['employee', 'manager', 'hr'], default: 'employee' },
    department: { type: String, default: '' },
    position: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    salary: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    leaveBalance: { type: Number, default: 20 },
    performanceRating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
