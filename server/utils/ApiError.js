/**
 * Error type that carries the HTTP status code and optional field-level
 * details. The centralized error handler turns this into a JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static forbidden(message = "Origin not allowed") {
    return new ApiError(403, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
