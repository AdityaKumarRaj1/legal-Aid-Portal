const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const LawyerProfile = require('../models/LawyerProfile');
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
          const CATEGORIES = [
                  'Criminal Law', 'Family Law', 'Corporate Law', 'Property Law', 
                  'Labor Law', 'Tax Law', 'Civil Law', 'Immigration', 
                  'Intellectual Property', 'Consumer Law', 'Environmental Law', 'Human Rights'
                ];
          for (const name of CATEGORIES) {
                  await Category.updateOne({ name }, { name, isActive: true }, { upsert: true });
          }
          const categories = await Category.find();

      const dummyLawyers = [
        { firstName: 'Aryan', lastName: 'Sharma', username: 'aryan_lawyer', email: 'aryan@example.com', specialization: 'Criminal Law', city: 'Delhi' },
        { firstName: 'Sneha', lastName: 'Kapoor', username: 'sneha_law', email: 'sneha@example.com', specialization: 'Family Law', city: 'Mumbai' },
        { firstName: 'Ravi', lastName: 'Verma', username: 'ravi_corporate', email: 'ravi@example.com', specialization: 'Corporate Law', city: 'Bangalore' },
            ];

      let added = 0;
          for (const l of dummyLawyers) {
                  let user = await User.findOne({ email: l.email });
                  if (!user) {
                            user = new User({ firstName: l.firstName, lastName: l.lastName, username: l.username, email: l.email, password: 'password123', role: 'LAWYER', city: l.city });
                            await user.save();
                  }
                  let profile = await LawyerProfile.findOne({ user: user._id });
                  if (!profile) {
                            const cat = categories.find(c => c.name === l.specialization);
                            profile = new LawyerProfile({
                                        user: user._id, barCouncilId: `BCI/${Math.floor(1000 + Math.random() * 9000)}/2015`,
                                        specializations: cat ? [cat._id] : [],
                                        experienceYears: 10, qualification: 'LLB, LLM', bio: `Expert in ${l.specialization}.`,
                                        consultationFee: 1000, officeAddress: '123 Legal Rd, ' + l.city, isVerified: true, verificationStatus: 'VERIFIED',
                                        rating: 4.8, totalCases: 50
                            });
                            await profile.save();
                            added++;
                  }
          }
          res.json({ message: "Seeded Successfully", lawyersAdded: added });
    } catch(error) {
          res.status(500).json({ error: error.message });
    }
});
module.exports = router;
