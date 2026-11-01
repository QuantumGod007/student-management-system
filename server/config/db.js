const mongoose = require("mongoose");

/**
 * The connection promise is cached across serverless invocations (Vercel
 * reuses warm function instances) so that every request does not open a new
 * MongoDB connection pool.
 */
let connectionPromise = null;

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Throws a clear error when configuration is missing so the process can
 * exit with a useful message instead of failing silently.
 */
const connectDB = async (uri = process.env.MONGO_URI) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Copy server/.env.example to server/.env and add your MongoDB connection string."
    );
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    })
    .then((connection) => {
      console.log(
        `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
      );

      return connection;
    })
    .catch((error) => {
      // Allow a later request to retry after a failed cold start.
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

const disconnectDB = async () => {
  connectionPromise = null;
  await mongoose.disconnect();
};

/**
 * True when the Mongoose connection is ready to serve queries.
 */
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

/**
 * Actively checks the database instead of trusting readyState, which can lag
 * behind on a warm serverless instance whose socket was dropped. Throws when
 * the ping fails so callers can report the real state.
 */
const pingDatabase = async () => {
  await connectDB();

  if (!mongoose.connection.db) {
    throw new Error("Database connection is not ready");
  }

  await mongoose.connection.db.admin().ping();
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

module.exports = { connectDB, disconnectDB, isDatabaseConnected, pingDatabase };
