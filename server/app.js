const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { connectDB, isDatabaseConnected } = require("./config/db");
const { DEPARTMENTS } = require("./models/Student");
const ApiError = require("./utils/ApiError");

const app = express();

/**
 * CORS: browser clients may only call the API from the origins listed in
 * CLIENT_ORIGIN (comma separated). Requests without an Origin header
 * (Postman, curl, server-to-server) are always allowed.
 */
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(ApiError.forbidden(`Origin ${origin} is not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

app.use(express.json({ limit: "100kb" }));

// Trust the proxy headers of hosting providers (Render, etc.)
app.set("trust proxy", true);

// Service root
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management System API is running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      students: "/api/students",
    },
  });
});

// Health check: reports whether the API can reach MongoDB. The connection is
// opened here on purpose so a cold serverless instance reports the real state
// instead of "disconnected" merely because no query has run yet.
app.get("/api/health", async (_req, res) => {
  let database = "disconnected";

  try {
    await connectDB();
    if (isDatabaseConnected()) database = "connected";
  } catch (error) {
    console.error("Health check database error:", error.message);
  }

  res.status(200).json({
    success: true,
    status: "ok",
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API metadata (departments are needed by the frontend and by clients).
app.get("/api/students/meta", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      departments: DEPARTMENTS,
      years: [1, 2, 3, 4],
    },
  });
});

// Ensure a database connection exists before serving data routes. On a
// traditional server the connection is already open (server.js connects at
// boot); on Vercel this reuses the cached connection of the warm instance.
app.use("/api/students", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
}, studentRoutes);

// Unknown route -> 404 JSON
app.use(notFound);

// Central error handler must be registered last.
app.use(errorHandler);

module.exports = app;
