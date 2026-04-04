const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LawyerProfile = require('../models/LawyerProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/lawyers  — public, filtered list
router.get('/', async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;

    // Build user filter
    const userFilter = { role: 'LAWYER' };
    if (city) userFilter.city = { $regex: city, $options: 'i' };
    if (search) {
      userFilter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
      ];
    }
    const matchingUsers = await User.find(userFilter).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    // Build profile filter
    const profileFilter = { user: { $in: userIds }, verificationStatus: 'VERIFIED' };
    if (category) profileFilter.specializations = new mongoose.Types.ObjectId(category);

    const skip = (page - 1) * limit;
    const [lawyers, total] = await Promise.all([
      LawyerProfile.find(profileFilter)
        .populate('user', 'firstName lastName email city state profilePicture')
        .populate('specializations', 'name slug icon')
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 }),
      LawyerProfile.countDocuments(profileFilter),
    ]);

    res.json({ success: true, lawyers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/lawyers/:id  — public, single profile
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await LawyerProfile.findById(req.params.id)
      .populate('user', '-password')
      .populate('specializations', 'name slug icon description');
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });
    res.json({ success: true, lawyer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/lawyers/profile  — lawyer updates own profile
router.put('/profile', protect, authorize('LAWYER'), async (req, res) => {
  try {
    const { bio, qualification, experienceYears, consultationFee,
            officeAddress, specializations, availability, isAvailable } = req.body;

    const profile = await LawyerProfile.findOneAndUpdate(
      { user: req.user._id },
      { bio, qualification, experienceYears, consultationFee,
        officeAddress, specializations, availability, isAvailable },
      { new: true, runValidators: true }
    ).populate('specializations', 'name slug');

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/lawyers/:id/verify  — admin only
router.put('/:id/verify', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { verificationStatus } = req.body; // 'VERIFIED' | 'REJECTED'
    const profile = await LawyerProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, isVerified: verificationStatus === 'VERIFIED' },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/lawyers/:id/availability
router.get('/:id/availability', async (req, res) => {
  try {
    const profile = await LawyerProfile.findById(req.params.id).select('availability isAvailable');
    if (!profile) return res.status(404).json({ success: false, message: 'Lawyer not found' });
    res.json({ success: true, availability: profile.availability, isAvailable: profile.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/lawyers/me/profile  — logged-in lawyer gets own full profile
router.get('/me/profile', protect, authorize('LAWYER'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user._id })
      .populate('specializations', 'name slug icon');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
