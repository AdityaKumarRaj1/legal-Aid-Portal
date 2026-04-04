const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const LawyerProfile = require('../models/LawyerProfile');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/appointments  — citizen books
router.post('/', protect, authorize('CITIZEN'), async (req, res) => {
  try {
    const { lawyer, category, subject, description, appointmentDate, appointmentTime, priority } = req.body;

    const lawyerExists = await LawyerProfile.findById(lawyer);
    if (!lawyerExists || !lawyerExists.isVerified)
      return res.status(400).json({ success: false, message: 'Lawyer not found or not verified' });

    const appointment = await Appointment.create({
      citizen: req.user._id,
      lawyer, category, subject, description,
      appointmentDate, appointmentTime,
      priority: priority || 'MEDIUM',
    });

    const populated = await appointment.populate([
      { path: 'citizen', select: 'firstName lastName email' },
      { path: 'lawyer', populate: { path: 'user', select: 'firstName lastName' } },
      { path: 'category', select: 'name icon' },
    ]);

    res.status(201).json({ success: true, appointment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/appointments  — role-filtered list
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (req.user.role === 'CITIZEN') {
      filter.citizen = req.user._id;
    } else if (req.user.role === 'LAWYER') {
      const profile = await LawyerProfile.findOne({ user: req.user._id });
      if (!profile) return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      filter.lawyer = profile._id;
    }
    // ADMIN sees all

    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('citizen', 'firstName lastName email phone')
        .populate({ path: 'lawyer', populate: { path: 'user', select: 'firstName lastName email' } })
        .populate('category', 'name icon')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(filter),
    ]);

    res.json({ success: true, appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/appointments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('citizen', 'firstName lastName email phone city state')
      .populate({ path: 'lawyer', populate: { path: 'user', select: 'firstName lastName email phone' } })
      .populate('category', 'name icon');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Access check
    const lawyerProfile = req.user.role === 'LAWYER'
      ? await LawyerProfile.findOne({ user: req.user._id })
      : null;

    const isOwner =
      req.user.role === 'ADMIN' ||
      appointment.citizen._id.toString() === req.user._id.toString() ||
      (lawyerProfile && appointment.lawyer._id.toString() === lawyerProfile._id.toString());

    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/appointments/:id/status  — lawyer or admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, lawyerNotes, rejectionReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const allowedTransitions = {
      LAWYER: { PENDING: ['ACCEPTED', 'REJECTED'], ACCEPTED: ['COMPLETED', 'NO_SHOW'] },
      ADMIN:  { PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'], ACCEPTED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
    };

    if (req.user.role === 'LAWYER') {
      const lawyerProfile = await LawyerProfile.findOne({ user: req.user._id });
      if (!lawyerProfile || appointment.lawyer.toString() !== lawyerProfile._id.toString())
        return res.status(403).json({ success: false, message: 'Not your appointment' });
    }

    const allowed = allowedTransitions[req.user.role]?.[appointment.status] || [];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Cannot transition from ${appointment.status} to ${status}` });

    appointment.status = status;
    if (lawyerNotes)    appointment.lawyerNotes = lawyerNotes;
    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/appointments/:id  — citizen cancels pending appointment
router.delete('/:id', protect, authorize('CITIZEN'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.citizen.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (appointment.status !== 'PENDING')
      return res.status(400).json({ success: false, message: 'Only pending appointments can be cancelled' });

    appointment.status = 'CANCELLED';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
