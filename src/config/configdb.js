import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/node_fulltask_db";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the MongoDB database:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
