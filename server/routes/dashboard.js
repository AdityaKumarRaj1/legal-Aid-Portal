const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LawyerProfile = require('../models/LawyerProfile');
const Appointment = require('../models/Appointment');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/dashboard/stats  — admin only
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const [totalUsers, totalLawyers, totalAppointments, totalCategories,
           pendingVerifications, pendingAppointments, completedAppointments] = await Promise.all([
      User.countDocuments({ role: 'CITIZEN' }),
      User.countDocuments({ role: 'LAWYER' }),
      Appointment.countDocuments(),
      Category.countDocuments({ isActive: true }),
      LawyerProfile.countDocuments({ verificationStatus: 'PENDING' }),
      Appointment.countDocuments({ status: 'PENDING' }),
      Appointment.countDocuments({ status: 'COMPLETED' }),
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('citizen', 'firstName lastName')
      .populate({ path: 'lawyer', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers, totalLawyers, totalAppointments, totalCategories,
        pendingVerifications, pendingAppointments, completedAppointments,
      },
      recentAppointments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/dashboard/citizen  — citizen summary
router.get('/citizen', protect, authorize('CITIZEN'), async (req, res) => {
  try {
    const userId = req.user._id;
    const [pending, accepted, completed, cancelled] = await Promise.all([
      Appointment.countDocuments({ citizen: userId, status: 'PENDING' }),
      Appointment.countDocuments({ citizen: userId, status: 'ACCEPTED' }),
      Appointment.countDocuments({ citizen: userId, status: 'COMPLETED' }),
      Appointment.countDocuments({ citizen: userId, status: 'CANCELLED' }),
    ]);

    const upcoming = await Appointment.find({
      citizen: userId,
      status: { $in: ['PENDING', 'ACCEPTED'] },
      appointmentDate: { $gte: new Date() },
    })
      .populate({ path: 'lawyer', populate: { path: 'user', select: 'firstName lastName profilePicture' } })
      .populate('category', 'name icon')
      .sort({ appointmentDate: 1 })
      .limit(5);

    res.json({ success: true, stats: { pending, accepted, completed, cancelled }, upcoming });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/dashboard/lawyer  — lawyer summary
router.get('/lawyer', protect, authorize('LAWYER'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Lawyer profile not found' });

    const lid = profile._id;
    const [pending, accepted, completed, rejected] = await Promise.all([
      Appointment.countDocuments({ lawyer: lid, status: 'PENDING' }),
      Appointment.countDocuments({ lawyer: lid, status: 'ACCEPTED' }),
      Appointment.countDocuments({ lawyer: lid, status: 'COMPLETED' }),
      Appointment.countDocuments({ lawyer: lid, status: 'REJECTED' }),
    ]);

    const upcoming = await Appointment.find({
      lawyer: lid,
      status: { $in: ['PENDING', 'ACCEPTED'] },
      appointmentDate: { $gte: new Date() },
    })
      .populate('citizen', 'firstName lastName email phone')
      .populate('category', 'name icon')
      .sort({ appointmentDate: 1 })
      .limit(5);

    res.json({
      success: true,
      profile,
      stats: { pending, accepted, completed, rejected },
      upcoming,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/dashboard/pending-lawyers  — admin
router.get('/pending-lawyers', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const lawyers = await LawyerProfile.find({ verificationStatus: 'PENDING' })
      .populate('user', 'firstName lastName email city state createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, lawyers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/dashboard/all-users  — admin
router.get('/all-users', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
