import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import Note from "../models/Note.js";
import Folder from "../models/Folder.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get user email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('❌ Please provide a user email as an argument');
  console.log('Usage: node import-notes-from-current-dir.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const importJavaScriptNotesFromDATA = async () => {
  try {
    console.log(`🚀 Starting JavaScript notes import from DATA folder for user: ${userEmail}`);

    // Connect to database
    await connectDB();

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      console.log('💡 Make sure the user is registered in the system');
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`👤 User ID: ${user._id}`);

    // Check if user already has a JavaScript folder
    let jsFolder = await Folder.findOne({ name: "JavaScript", user: user._id });

    if (jsFolder) {
      console.log(`📁 JavaScript folder already exists for this user (ID: ${jsFolder._id})`);
      
      // Check for existing notes
      const existingNotesCount = await Note.countDocuments({
        folder: jsFolder._id,
        user: user._id
      });
      
      if (existingNotesCount > 0) {
        console.log(`⚠️  Found ${existingNotesCount} existing notes in JavaScript folder`);
        console.log("🗑️  Clearing existing notes to avoid duplicates...");
        await Note.deleteMany({ folder: jsFolder._id, user: user._id });
        console.log("✅ Existing notes cleared");
      }
    } else {
      console.log("📁 Creating JavaScript folder for user...");
      jsFolder = new Folder({
        name: "JavaScript",
        description: "JavaScript learning notes from Namaste JavaScript series",
        icon: "💻",
        color: "#f7df1e", // JavaScript yellow color
        parentFolder: null,
        user: user._id
      });
      await jsFolder.save();
      console.log(`✅ JavaScript folder created! (ID: ${jsFolder._id})`);
    }

    // Path to DATA directory (in project root)
    const dataDir = path.join(__dirname, '..', '..', 'DATA');
    
    console.log(`📂 Looking for DATA directory at: ${dataDir}`);

    if (!fs.existsSync(dataDir)) {
      console.error("❌ DATA directory not found at:", dataDir);
      console.log("💡 Make sure the DATA folder exists in your project root");
      process.exit(1);
    }

    const files = fs.readdirSync(dataDir);
    const mdFiles = files.filter((file) => file.endsWith(".md"));

    console.log(`📚 Found ${mdFiles.length} markdown files to import`);

    if (mdFiles.length === 0) {
      console.log("⚠️  No markdown files found in DATA directory");
      process.exit(0);
    }

    let importedCount = 0;
    let failedCount = 0;

    // Sort files by episode number for better organization
    const sortedFiles = mdFiles.sort((a, b) => {
      const aNum = parseInt(a.match(/^(\d+)\./)?.[1] || '999');
      const bNum = parseInt(b.match(/^(\d+)\./)?.[1] || '999');
      return aNum - bNum;
    });

    console.log('\n📝 Starting import process...\n');

    for (const file of sortedFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Extract title from filename (remove .md extension)
        let title = file.replace(".md", "");
        
        // Clean up the title but keep it more readable
        const cleanTitle = title
          .replace(/🔥/g, "")
          .replace(/❤️/g, "")
          .replace(/🤔/g, "")
          .replace(/🚀/g, "")
          .replace(/⏰/g, "")
          .replace(/🎯/g, "")
          .replace(/🛠️/g, "")
          .replace(/⚡/g, "")
          .replace(/🙏/g, "")
          .replace(/_/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Extract episode number from filename
        const episodeMatch = file.match(/^(\d+)\./);
        const episode = episodeMatch ? parseInt(episodeMatch[1]) : null;

        // Generate tags based on content and filename
        const tags = ["javascript", "namaste-js"];
        
        // Add specific tags based on content
        const lowerTitle = cleanTitle.toLowerCase();
        if (lowerTitle.includes("hoisting")) tags.push("hoisting");
        if (lowerTitle.includes("closure")) tags.push("closures");
        if (lowerTitle.includes("scope")) tags.push("scope");
        if (lowerTitle.includes("promise")) tags.push("promises");
        if (lowerTitle.includes("async")) tags.push("async-await");
        if (lowerTitle.includes("callback")) tags.push("callbacks");
        if (lowerTitle.includes("function")) tags.push("functions");
        if (lowerTitle.includes("execution context")) tags.push("execution-context");
        if (lowerTitle.includes("event loop")) tags.push("event-loop");
        if (lowerTitle.includes("settimeout")) tags.push("settimeout");
        if (lowerTitle.includes("this")) tags.push("this-keyword");
        if (lowerTitle.includes("let") || lowerTitle.includes("const")) tags.push("variables");
        if (lowerTitle.includes("temporal dead zone")) tags.push("tdz");

        // Create new note in the JavaScript folder for this user
        const note = new Note({
          title: cleanTitle,
          content,
          tags,
          category: "javascript",
          episode,
          folder: jsFolder._id,
          user: user._id, // Associate with the specific user
          highlights: [],
          drawings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await note.save();
        importedCount++;
        console.log(`✅ [${importedCount.toString().padStart(2, '0')}] ${cleanTitle}${episode ? ` (Episode ${episode})` : ''}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to import ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 Import completed for ${user.name}!`);
    console.log(`\n📊 Final Summary:`);
    console.log(`   👤 User: ${user.name} (${user.email})`);
    console.log(`   📁 Folder: JavaScript (ID: ${jsFolder._id})`);
    console.log(`   📝 Notes imported: ${importedCount}/${mdFiles.length}`);
    console.log(`   ❌ Failed imports: ${failedCount}`);
    console.log(`   📈 Success rate: ${((importedCount / mdFiles.length) * 100).toFixed(1)}%`);

    if (importedCount > 0) {
      console.log(`\n🚀 ${user.name} can now access their ${importedCount} JavaScript notes in the app!`);
      console.log(`💡 The notes are organized by episode number and tagged for easy searching.`);
    }

  } catch (error) {
    console.error("💥 Import failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the import
importJavaScriptNotesFromDATA();