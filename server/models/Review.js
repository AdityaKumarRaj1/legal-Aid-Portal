const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyer:  { type: mongoose.Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
