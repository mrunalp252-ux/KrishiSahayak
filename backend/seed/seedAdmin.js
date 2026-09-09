const User = require('../models/User');

async function seedAdmin() {
  try {
    const adminData = {
      name: 'Admin',
      email: 'admin@krishisahayak.com',
      password: 'Admin@123456',
      role: 'admin',
      state: 'Maharashtra',
      district: 'Pune',
      language: 'en',
      isActive: true
    };

    const expertData = {
      name: 'Dr. Rajesh Patil',
      email: 'expert@krishisahayak.com',
      password: 'Expert@123456',
      role: 'expert',
      state: 'Maharashtra',
      district: 'Pune',
      language: 'mr',
      isActive: true
    };

    // Save with .save() to trigger bcrypt pre-save password hashing
    let admin = await User.findOne({ email: adminData.email });
    if (!admin) {
      admin = new User(adminData);
      await admin.save();
    } else {
      admin.name = adminData.name;
      admin.role = adminData.role;
      admin.password = adminData.password;
      admin.isActive = true;
      await admin.save();
    }
    console.log('Admin user seeded successfully');

    let expert = await User.findOne({ email: expertData.email });
    if (!expert) {
      expert = new User(expertData);
      await expert.save();
    } else {
      expert.name = expertData.name;
      expert.role = expertData.role;
      expert.password = expertData.password;
      expert.isActive = true;
      await expert.save();
    }
    console.log('Expert user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin users:', error);
    throw error;
  }
}

module.exports = seedAdmin;
