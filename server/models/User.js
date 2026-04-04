const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 8 },
  role: {
    type: String,
    enum: ['CITIZEN', 'LAWYER', 'ADMIN'],
    default: 'CITIZEN',
    index: true,
  },
  phone:          { type: String, default: '' },
  address:        { type: String, default: '' },
  city:           { type: String, default: '' },
  state:          { type: String, default: '' },
  pincode:        { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  dateOfBirth:    { type: Date },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
