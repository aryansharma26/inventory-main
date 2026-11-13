import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create default admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210',
      isActive: true,
    });
    
    // Create default staff
    const staffUser = await User.create({
      name: 'Staff User',
      email: 'staff@inventory.com',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98765 43211',
      isActive: true,
    });
    
    console.log('Users seeded successfully:');
    console.log('Admin: admin@inventory.com / admin123');
    console.log('Staff: staff@inventory.com / staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
