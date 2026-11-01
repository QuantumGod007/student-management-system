const ApiError = require("../utils/ApiError");

/**
 * Final error handler. Every route funnels errors here so the API always
 * answers with the same JSON shape and a correct status code.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // Mongoose schema validation errors.
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));
  }

  // Invalid ObjectId or bad cast value.
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for '${err.path}'`;
    details = [{ field: err.path, message: "Invalid value" }];
  }

  // Unique index violation (studentId or email).
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "value";

    if (field === "email") {
      message = "A student with this email already exists";
    } else if (field === "studentId") {
      message = "A student with this Student ID already exists";
    } else {
      message = `Duplicate ${field}`;
    }

    details = [{ field, message }];
  }

  // Malformed JSON body from express.json().
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body must be valid JSON";
  }

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);

    // Never leak internal details in production responses.
    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
      details = null;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
};

/**
 * Unknown route handler -> 404 JSON instead of Express' HTML page.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = { errorHandler, notFound };
