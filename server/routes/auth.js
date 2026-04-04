const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LawyerProfile = require('../models/LawyerProfile');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role, phone, city, state, barCouncilId } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    if (await User.findOne({ username }))
      return res.status(400).json({ success: false, message: 'Username already taken' });

    const user = await User.create({ firstName, lastName, username, email, password, role: role || 'CITIZEN', phone, city, state });

    // If registering as lawyer, create profile
    if (role === 'LAWYER' && barCouncilId) {
      await LawyerProfile.create({ user: user._id, barCouncilId });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, username: user.username, profilePicture: user.profilePicture },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, pincode, dateOfBirth } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, address, city, state, pincode, dateOfBirth },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
