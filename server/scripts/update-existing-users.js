import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function updateExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing users to be verified
    const result = await User.updateMany(
      { isVerified: false },
      { 
        $set: { 
          isVerified: true,
          verificationToken: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to verified status`);
    
    // Show total user count
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateExistingUsers();