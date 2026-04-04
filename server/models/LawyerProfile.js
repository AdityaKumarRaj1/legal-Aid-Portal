const mongoose = require('mongoose');

const LawyerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  barCouncilId: { type: String, required: true, unique: true },
  specializations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  experienceYears: { type: Number, default: 0 },
  qualification: { type: String, default: '' },
  bio: { type: String, default: '' },
  consultationFee: { type: Number, default: 0 },
  officeAddress: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalCases: { type: Number, default: 0 },
  verificationDocument: { type: String, default: '' },
  availability: [{
    day: { type: String, enum: ['MON','TUE','WED','THU','FRI','SAT','SUN'] },
    startTime: String,
    endTime: String,
    isActive: { type: Boolean, default: true },
  }],
}, { timestamps: true });

module.exports = mongoose.model('LawyerProfile', LawyerProfileSchema);
