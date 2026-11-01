require("dotenv").config();

const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");

const PORT = Number(process.env.PORT) || 5001;
const HOST = process.env.HOST || "0.0.0.0";

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, HOST, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

/**
 * Close HTTP connections and the database before exiting so that hosting
 * platforms (Render, Docker, etc.) can restart the service cleanly.
 */
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

startServer();
