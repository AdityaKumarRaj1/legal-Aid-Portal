/**
 * Seed script — run once to populate the DB with sample data
 * Usage:  node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User          = require('./models/User');
const LawyerProfile = require('./models/LawyerProfile');
const Category      = require('./models/Category');

const CATEGORIES = [
  { name: 'Criminal Law',         icon: 'bi-shield-lock',   description: 'Defense and prosecution in criminal cases' },
  { name: 'Family Law',           icon: 'bi-people',         description: 'Divorce, custody, adoption' },
  { name: 'Corporate Law',        icon: 'bi-building',       description: 'Business formation, contracts, compliance' },
  { name: 'Property Law',         icon: 'bi-house',          description: 'Real estate, disputes, registration' },
  { name: 'Labor Law',            icon: 'bi-person-workspace',description: 'Employment rights, disputes' },
  { name: 'Tax Law',              icon: 'bi-receipt',        description: 'Income tax, GST, corporate tax' },
  { name: 'Civil Law',            icon: 'bi-balance-scale',  description: 'Civil disputes, torts' },
  { name: 'Immigration',          icon: 'bi-airplane',       description: 'Visas, citizenship, work permits' },
  { name: 'Intellectual Property',icon: 'bi-lightbulb',      description: 'Patents, trademarks, copyright' },
  { name: 'Consumer Law',         icon: 'bi-bag',            description: 'Consumer rights, fraud' },
  { name: 'Environmental Law',    icon: 'bi-tree',           description: 'Environment regulations, disputes' },
  { name: 'Human Rights',         icon: 'bi-heart',          description: 'Civil liberties, rights violations' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany({}), LawyerProfile.deleteMany({}), Category.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  // Seed categories
  const cats = await Category.insertMany(CATEGORIES);
  console.log(`📂 Created ${cats.length} categories`);

  // Admin user
  const admin = await User.create({
    firstName: 'Portal',  lastName: 'Admin',
    username: 'admin',    email: 'admin@legalaid.in',
    password: 'Admin@1234', role: 'ADMIN',
    city: 'New Delhi',    state: 'Delhi',
  });
  console.log('👤 Admin:', admin.email);

  // Citizens
  const citizens = await User.create([
    { firstName: 'Rohan', lastName: 'Gupta', username: 'rohan_g', email: 'rohan@example.com', password: 'Citizen@1234', role: 'CITIZEN', city: 'Mumbai', state: 'Maharashtra' },
    { firstName: 'Priya', lastName: 'Sharma', username: 'priya_s', email: 'priya@example.com', password: 'Citizen@1234', role: 'CITIZEN', city: 'Pune', state: 'Maharashtra' },
  ]);
  console.log(`👥 Created ${citizens.length} citizens`);

  // Lawyers
  const lawyerData = [
    { firstName: 'Arjun',   lastName: 'Mehta',   email: 'arjun@legalaid.in',    city: 'Mumbai',    state: 'Maharashtra', experience: 12, fee: 2500, specs: [0,1], bio: 'Senior criminal defense attorney with 12 years of courtroom experience.' },
    { firstName: 'Suman',   lastName: 'Das',     email: 'suman@legalaid.in',    city: 'Kolkata',   state: 'West Bengal', experience: 8,  fee: 1800, specs: [1,4], bio: 'Specialized in family disputes and labor law with a track record of success.' },
    { firstName: 'Kavya',   lastName: 'Pillai',  email: 'kavya@legalaid.in',    city: 'Chennai',   state: 'Tamil Nadu',  experience: 15, fee: 3500, specs: [2,8], bio: 'Corporate law expert and IP attorney.' },
    { firstName: 'Rahul',   lastName: 'Verma',   email: 'rahul@legalaid.in',    city: 'Delhi',     state: 'Delhi',       experience: 10, fee: 2200, specs: [3,6], bio: 'Property and civil law specialist based in Delhi.' },
    { firstName: 'Sneha',   lastName: 'Iyer',    email: 'sneha@legalaid.in',    city: 'Bangalore', state: 'Karnataka',   experience: 6,  fee: 1500, specs: [9,10], bio: 'Consumer rights and environmental law advocate.' },
    { firstName: 'Vikram',  lastName: 'Singh',   email: 'vikram@legalaid.in',   city: 'Jaipur',    state: 'Rajasthan',   experience: 20, fee: 4000, specs: [0,5], bio: 'Senior tax and criminal law counsel with 20 years experience.' },
  ];

  for (const ld of lawyerData) {
    const user = await User.create({
      firstName: ld.firstName, lastName: ld.lastName,
      username: ld.email.split('@')[0],
      email: ld.email, password: 'Lawyer@1234',
      role: 'LAWYER', city: ld.city, state: ld.state,
    });
    await LawyerProfile.create({
      user: user._id,
      barCouncilId: `BCI/${ld.state.substring(0,2).toUpperCase()}/2015/${Math.floor(Math.random()*90000+10000)}`,
      specializations: ld.specs.map((i) => cats[i]._id),
      experienceYears: ld.experience,
      consultationFee: ld.fee,
      bio: ld.bio,
      qualification: 'LL.B., LL.M.',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      totalCases: Math.floor(Math.random() * 200 + 30),
      availability: [
        { day: 'MON', startTime: '10:00', endTime: '17:00', isActive: true },
        { day: 'TUE', startTime: '10:00', endTime: '17:00', isActive: true },
        { day: 'WED', startTime: '10:00', endTime: '17:00', isActive: true },
        { day: 'THU', startTime: '10:00', endTime: '17:00', isActive: true },
        { day: 'FRI', startTime: '10:00', endTime: '16:00', isActive: true },
      ],
    });
    console.log(`⚖️  Created lawyer: ${user.firstName} ${user.lastName}`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN    → admin@legalaid.in   / Admin@1234');
  console.log('CITIZEN  → rohan@example.com   / Citizen@1234');
  console.log('LAWYER   → arjun@legalaid.in   / Lawyer@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
