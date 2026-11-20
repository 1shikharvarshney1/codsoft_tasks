import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { products } from './productsData.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    // Clear existing data
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing collections (Orders, Carts, Products, Users)...');

    // Create demo users
    const createdUsers = await User.create([
      {
        name: 'Demo Customer',
        email: 'user@example.com',
        password: 'password123',
        role: 'customer',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin',
      },
    ]);
    console.log(`Created ${createdUsers.length} initial users.`);
    console.log(`  Demo user: user@example.com / password123`);
    console.log(`  Admin user: admin@example.com / adminpassword123`);

    // Insert sample products
    const createdProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${createdProducts.length} sample products!`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Error with data seed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
