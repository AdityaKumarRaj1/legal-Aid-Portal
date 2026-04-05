const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const LawyerProfile = require('../models/LawyerProfile');
const User = require('../models/User');

router.get('/', async (req, res) => {
      try {
              // Clear old broken data
        await Category.deleteMany({});
              await LawyerProfile.deleteMany({});

        const CATEGORIES = [
                  'Criminal Law', 'Family Law', 'Corporate Law', 'Property Law', 
                  'Labor Law', 'Tax Law', 'Civil Law', 'Immigration', 
                  'Intellectual Property', 'Consumer Law', 'Environmental Law', 'Human Rights'
                ];

        // Use proper create to trigger hooks and create valid slugs
        const createdCats = await Promise.all(CATEGORIES.map(name => 
                                                                   Category.create({ name, isActive: true, icon: 'bi-briefcase' })
                                                                 ));

        const dummyLawyers = [
            { firstName: 'Aryan', lastName: 'Sharma', username: 'aryan_lawyer', email: 'aryan@example.com', specialization: 'Criminal Law', city: 'Delhi', phone: '9876543210' },
            { firstName: 'Sneha', lastName: 'Kapoor', username: 'sneha_law', email: 'sneha@example.com', specialization: 'Family Law', city: 'Mumbai', phone: '9876543211' },
            { firstName: 'Ravi', lastName: 'Verma', username: 'ravi_corporate', email: 'ravi@example.com', specialization: 'Corporate Law', city: 'Bangalore', phone: '9876543212' },
                ];

        let added = 0;
              for (const l of dummyLawyers) {
                        // Find or clear user
                await User.deleteOne({ email: l.email });
                        const user = await User.create({ firstName: l.firstName, lastName: l.lastName, username: l.username, email: l.email, password: 'password123', role: 'LAWYER', city: l.city, phone: l.phone });

                const cat = createdCats.find(c => c.name === l.specialization);
                        await LawyerProfile.create({
                                      user: user._id, 
                                      barCouncilId: `BCI/${Math.floor(1000 + Math.random() * 9000)}/2026`,
                                      specializations: cat ? [cat._id] : [],
                                      experienceYears: 10, 
                                      qualification: 'LLB, LLM', 
                                      bio: `Expert in ${l.specialization}.`,
                                      consultationFee: 1000, 
                                      officeAddress: '123 Legal Rd, ' + l.city, 
                                      isVerified: true, 
                                      verificationStatus: 'VERIFIED',
                                      rating: 4.8, 
                                      totalCases: 50
                        });
                        added++;
              }
              res.json({ message: "Seeded Successfully", lawyersAdded: added });
      } catch(error) {
              res.status(500).json({ error: error.message });
      }
});
module.exports = router;
