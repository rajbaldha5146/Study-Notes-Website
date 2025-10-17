import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Note from "../models/Note.js";
import Folder from "../models/Folder.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const importNotesWithFolder = async () => {
  try {
    console.log("🚀 Starting import process...");

    // First, create or find the JavaScript folder
    let jsFolder = await Folder.findOne({ name: "JavaScript" });

    if (!jsFolder) {
      console.log("📁 Creating JavaScript folder...");
      jsFolder = new Folder({
        name: "JavaScript",
        description: "JavaScript learning notes from Namaste JavaScript series",
        icon: "💻",
        color: "#f7df1e", // JavaScript yellow color
        parentFolder: null,
      });
      await jsFolder.save();
      console.log("✅ JavaScript folder created!");
    } else {
      console.log("📁 JavaScript folder already exists");
    }

    // Clear existing notes in the JavaScript folder (optional)
    const existingNotesCount = await Note.countDocuments({
      folder: jsFolder._id,
    });
    if (existingNotesCount > 0) {
      console.log(
        `🗑️  Removing ${existingNotesCount} existing notes from JavaScript folder...`
      );
      await Note.deleteMany({ folder: jsFolder._id });
    }

    // Import notes from DATA directory
    const dataDir = path.join(process.cwd(), "../../DATA");

    if (!fs.existsSync(dataDir)) {
      console.error("❌ DATA directory not found at:", dataDir);
      process.exit(1);
    }

    const files = fs.readdirSync(dataDir);
    const mdFiles = files.filter((file) => file.endsWith(".md"));

    console.log(`📚 Found ${mdFiles.length} markdown files to import`);

    let importedCount = 0;

    for (const file of mdFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Extract title from filename (remove episode number and .md extension)
        const title = file.replace(".md", "").replace(/^\d+\./, "");

        // Extract episode number from filename
        const episodeMatch = file.match(/^(\d+)\./);
        const episode = episodeMatch ? parseInt(episodeMatch[1]) : null;

        // Extract tags from content (look for tags in frontmatter)
        const tagMatch = content.match(/tags:\s*\[(.*?)\]/);
        const tags = tagMatch
          ? tagMatch[1].split(",").map((tag) => tag.trim().replace(/['"]/g, ""))
          : ["javascript", "namaste-js"];

        // Create new note in the JavaScript folder
        const note = new Note({
          title,
          content,
          tags,
          category: "javascript",
          episode,
          folder: jsFolder._id, // Link to JavaScript folder
          highlights: [],
          drawings: [],
        });

        await note.save();
        importedCount++;
        console.log(`✅ Imported: ${title} (Episode ${episode || "N/A"})`);
      } catch (error) {
        console.error(`❌ Failed to import ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Folder: JavaScript`);
    console.log(`   - Notes imported: ${importedCount}/${mdFiles.length}`);
    console.log(`   - Folder ID: ${jsFolder._id}`);

    process.exit(0);
  } catch (error) {
    console.error("💥 Import failed:", error);
    process.exit(1);
  }
};

importNotesWithFolder();
