const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const LawyerProfile = require('../models/LawyerProfile');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/reviews  — citizen posts a review (appointment must be COMPLETED)
router.post('/', protect, authorize('CITIZEN'), async (req, res) => {
  try {
    const { lawyer, appointment, rating, comment } = req.body;

    // Validate appointment is completed and belongs to this citizen
    if (appointment) {
      const appt = await Appointment.findById(appointment);
      if (!appt || appt.citizen.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: 'Appointment not found or not yours' });
      if (appt.status !== 'COMPLETED')
        return res.status(400).json({ success: false, message: 'Can only review completed appointments' });

      // Prevent duplicate review
      const existing = await Review.findOne({ citizen: req.user._id, appointment });
      if (existing)
        return res.status(400).json({ success: false, message: 'You already reviewed this appointment' });
    }

    const review = await Review.create({ citizen: req.user._id, lawyer, appointment, rating, comment });

    // Update lawyer's average rating
    const reviews = await Review.find({ lawyer, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await LawyerProfile.findByIdAndUpdate(lawyer, { rating: Math.round(avgRating * 10) / 10 });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reviews/lawyer/:lawyerId  — public
router.get('/lawyer/:lawyerId', async (req, res) => {
  try {
    const reviews = await Review.find({ lawyer: req.params.lawyerId, isApproved: true })
      .populate('citizen', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reviews/my  — citizen's own reviews
router.get('/my', protect, authorize('CITIZEN'), async (req, res) => {
  try {
    const reviews = await Review.find({ citizen: req.user._id })
      .populate({ path: 'lawyer', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/reviews/:id  — citizen deletes own, admin deletes any
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'ADMIN' && review.citizen.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await review.deleteOne();

    // Recalculate lawyer rating
    const reviews = await Review.find({ lawyer: review.lawyer, isApproved: true });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await LawyerProfile.findByIdAndUpdate(review.lawyer, { rating: Math.round(avgRating * 10) / 10 });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
