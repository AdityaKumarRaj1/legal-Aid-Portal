const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  citizen:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subject:  { type: String, required: true, maxlength: 300 },
  description: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 30 },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'PENDING',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  lawyerNotes:     { type: String, default: '' },
  citizenNotes:    { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  isPaid:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
