const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Throws a clear error when configuration is missing so the process can
 * exit with a useful message instead of failing silently.
 */
const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Copy server/.env.example to server/.env and add your MongoDB connection string."
    );
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
  );

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  return connection;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

/**
 * True when the Mongoose connection is ready to serve queries.
 */
const isDatabaseConnected = () =>
  mongoose.connection.readyState === 1;

module.exports = { connectDB, disconnectDB, isDatabaseConnected };
