import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Folder from '../models/Folder.js';
import Note from '../models/Note.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function cleanupOrphanedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all folders and notes without user association
    const orphanedFolders = await Folder.find({ user: { $exists: false } });
    const orphanedNotes = await Note.find({ user: { $exists: false } });

    console.log(`📊 Found ${orphanedFolders.length} orphaned folders`);
    console.log(`📊 Found ${orphanedNotes.length} orphaned notes`);

    if (orphanedFolders.length === 0 && orphanedNotes.length === 0) {
      console.log('✅ No orphaned data found. Database is clean!');
      return;
    }

    // Delete orphaned folders and notes
    if (orphanedFolders.length > 0) {
      console.log('🗑️  Deleting orphaned folders...');
      const folderResult = await Folder.deleteMany({ user: { $exists: false } });
      console.log(`✅ Deleted ${folderResult.deletedCount} orphaned folders`);
    }

    if (orphanedNotes.length > 0) {
      console.log('🗑️  Deleting orphaned notes...');
      const noteResult = await Note.deleteMany({ user: { $exists: false } });
      console.log(`✅ Deleted ${noteResult.deletedCount} orphaned notes`);
    }

    console.log('\n🎉 Cleanup completed!');
    console.log('💡 Users can now import their own JavaScript notes using the import script');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupOrphanedData();