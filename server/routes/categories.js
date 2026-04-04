const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/categories  — public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/categories  — admin only
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const category = await Category.create({ name, description, icon });
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Category already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/categories/:id  — admin only
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/categories/:id  — admin only
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
