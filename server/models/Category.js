const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'bi-briefcase' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
