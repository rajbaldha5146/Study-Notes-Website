import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from '../models/Note.js';
import Folder from '../models/Folder.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const cleanDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Count existing documents
    const notesCount = await Note.countDocuments();
    const foldersCount = await Folder.countDocuments();
    
    console.log(`📊 Current database state:`);
    console.log(`   - Notes: ${notesCount}`);
    console.log(`   - Folders: ${foldersCount}`);
    
    if (notesCount === 0 && foldersCount === 0) {
      console.log('✅ Database is already clean!');
      process.exit(0);
    }
    
    // Ask for confirmation (in a real scenario, you might want to add readline)
    console.log('\n⚠️  This will delete ALL notes and folders!');
    console.log('🔄 Proceeding with cleanup...');
    
    // Delete all notes
    if (notesCount > 0) {
      await Note.deleteMany({});
      console.log(`🗑️  Deleted ${notesCount} notes`);
    }
    
    // Delete all folders
    if (foldersCount > 0) {
      await Folder.deleteMany({});
      console.log(`🗑️  Deleted ${foldersCount} folders`);
    }
    
    console.log('✅ Database cleanup completed!');
    console.log('💡 You can now run the import script to populate with fresh data');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
};

cleanDatabase();