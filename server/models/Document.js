const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  documentType: {
    type: String,
    enum: ['IDENTITY', 'LEGAL', 'EVIDENCE', 'OTHER'],
    default: 'OTHER',
  },
  filePath:      { type: String, required: true },
  fileSize:      { type: Number, default: 0 },
  description:   { type: String, default: '' },
  isConfidential:{ type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
