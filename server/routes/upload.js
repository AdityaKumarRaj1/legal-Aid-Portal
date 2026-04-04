const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const LawyerProfile = require('../models/LawyerProfile');
const { protect } = require('../middleware/auth');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, req.uploadType || 'misc');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// @POST /api/upload/profile-picture
router.post('/profile-picture', protect, (req, res, next) => {
  req.uploadType = 'profiles';
  next();
}, upload.single('picture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/profiles/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profilePicture: url });
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/upload/document  — lawyer verification doc
router.post('/document', protect, (req, res, next) => {
  req.uploadType = 'documents';
  next();
}, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/documents/${req.file.filename}`;
    await LawyerProfile.findOneAndUpdate({ user: req.user._id }, { verificationDocument: url });
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
