require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const pwd = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await User.findOne({ email });
  if (existing) { console.log('Admin already exists'); process.exit(0); }
  const hashed = await bcrypt.hash(pwd, 10);
  const admin = new User({ username: 'admin', email, password: hashed, isAdmin: true });
  await admin.save();
  console.log('Admin created:', email);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
