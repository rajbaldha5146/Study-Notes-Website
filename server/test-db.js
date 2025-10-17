import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const testDatabase = async () => {
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log("MongoDB URI:", process.env.MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log("📊 Database name:", dbName);

    // List all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Collections in database:",
      collections.map((c) => c.name)
    );

    // Create a test collection to make the database visible
    const testCollection = mongoose.connection.db.collection("test");
    await testCollection.insertOne({
      message: "Database created successfully!",
      timestamp: new Date(),
      purpose: "Making database visible in MongoDB Compass",
    });
    console.log(
      "✅ Test document inserted - database should now be visible in Compass!"
    );

    // Show database stats
    const stats = await mongoose.connection.db.stats();
    console.log("📈 Database stats:", {
      collections: stats.collections,
      documents: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
    });

    console.log("\n🎉 Database test completed successfully!");
    console.log(
      '💡 Now check MongoDB Compass - you should see the "studynotes-app" database'
    );
  } catch (error) {
    console.error("❌ Database test failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 MongoDB Connection Issues:");
      console.log("1. Make sure MongoDB is running on your system");
      console.log("2. Check if MongoDB service is started");
      console.log("3. Verify MongoDB is listening on port 27017");
      console.log(
        "4. Try running: net start MongoDB (Windows) or brew services start mongodb (Mac)"
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

testDatabase();
