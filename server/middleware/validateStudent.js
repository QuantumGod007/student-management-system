const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { DEPARTMENTS } = require("../models/Student");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(\+91)?[6-9]\d{9}$/;
const STUDENT_ID_PATTERN = /^[A-Z0-9-]{3,20}$/;
const DIVISION_PATTERN = /^[A-Z]$/;

const ALLOWED_FIELDS = [
  "studentId",
  "name",
  "email",
  "phone",
  "department",
  "year",
  "division",
];

const REQUIRED_FIELDS = ALLOWED_FIELDS.slice();

/**
 * Trims and normalizes a raw request body so that the same values are used
 * for validation, storage and future comparisons.
 */
const normalizeBody = (body = {}) => {
  const normalized = {};

  if (body.studentId !== undefined) {
    normalized.studentId = String(body.studentId).trim().toUpperCase();
  }

  if (body.name !== undefined) {
    normalized.name = String(body.name).trim().replace(/\s+/g, " ");
  }

  if (body.email !== undefined) {
    normalized.email = String(body.email).trim().toLowerCase();
  }

  if (body.phone !== undefined) {
    normalized.phone = String(body.phone).replace(/[\s-]/g, "");
  }

  if (body.department !== undefined) {
    normalized.department = String(body.department).trim().toUpperCase();
  }

  if (body.year !== undefined) {
    normalized.year =
      body.year === "" || body.year === null ? body.year : Number(body.year);
  }

  if (body.division !== undefined) {
    normalized.division = String(body.division).trim().toUpperCase();
  }

  return normalized;
};

/**
 * Field level validation shared by POST (all fields required) and PUT
 * (only the supplied fields are validated).
 */
const validateFields = (payload, { partial = false } = {}) => {
  const errors = [];

  const unknownFields = Object.keys(payload).filter(
    (field) => !ALLOWED_FIELDS.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push({
      field: unknownFields.join(", "),
      message: `Unknown field(s): ${unknownFields.join(", ")}`,
    });
  }

  const provided = ALLOWED_FIELDS.filter(
    (field) => payload[field] !== undefined
  );

  if (partial) {
    if (provided.length === 0) {
      errors.push({
        field: "body",
        message: "Provide at least one field to update",
      });
    }
  } else {
    const missing = REQUIRED_FIELDS.filter(
      (field) => payload[field] === undefined
    );

    missing.forEach((field) => {
      errors.push({ field, message: `${field} is required` });
    });
  }

  if (payload.studentId !== undefined) {
    if (!payload.studentId) {
      errors.push({ field: "studentId", message: "Student ID is required" });
    } else if (!STUDENT_ID_PATTERN.test(payload.studentId)) {
      errors.push({
        field: "studentId",
        message:
          "Student ID must be 3-20 characters using letters, numbers or hyphens",
      });
    }
  }

  if (payload.name !== undefined) {
    if (!payload.name) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (payload.name.length < 2 || payload.name.length > 80) {
      errors.push({
        field: "name",
        message: "Name must be between 2 and 80 characters",
      });
    }
  }

  if (payload.email !== undefined) {
    if (!payload.email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!EMAIL_PATTERN.test(payload.email)) {
      errors.push({ field: "email", message: "Email format is invalid" });
    }
  }

  if (payload.phone !== undefined) {
    if (!payload.phone) {
      errors.push({ field: "phone", message: "Phone number is required" });
    } else if (!PHONE_PATTERN.test(payload.phone)) {
      errors.push({
        field: "phone",
        message: "Phone must be a valid 10 digit Indian mobile number",
      });
    }
  }

  if (payload.department !== undefined) {
    if (!payload.department) {
      errors.push({ field: "department", message: "Department is required" });
    } else if (!DEPARTMENTS.includes(payload.department)) {
      errors.push({
        field: "department",
        message: `Department must be one of: ${DEPARTMENTS.join(", ")}`,
      });
    }
  }

  if (payload.year !== undefined) {
    if (!Number.isInteger(payload.year) || payload.year < 1 || payload.year > 4) {
      errors.push({ field: "year", message: "Year must be 1, 2, 3 or 4" });
    }
  }

  if (payload.division !== undefined) {
    if (!payload.division) {
      errors.push({ field: "division", message: "Division is required" });
    } else if (!DIVISION_PATTERN.test(payload.division)) {
      errors.push({
        field: "division",
        message: "Division must be a single letter (for example A)",
      });
    }
  }

  return errors;
};

/** POST /api/students body validation. */
const validateCreateStudent = (req, _res, next) => {
  const payload = normalizeBody(req.body);
  const errors = validateFields(payload, { partial: false });

  if (errors.length > 0) {
    return next(ApiError.badRequest("Validation failed", errors));
  }

  req.student = payload;
  return next();
};

/** PUT /api/students/:id body validation (partial updates allowed). */
const validateUpdateStudent = (req, _res, next) => {
  const payload = normalizeBody(req.body);
  const errors = validateFields(payload, { partial: true });

  if (errors.length > 0) {
    return next(ApiError.badRequest("Validation failed", errors));
  }

  req.student = payload;
  return next();
};

/** Rejects malformed MongoDB ids with 400 instead of a cast error 500. */
const validateObjectId = (req, _res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      ApiError.badRequest(
        `'${req.params.id}' is not a valid student id`,
        [{ field: "id", message: "Must be a 24 character MongoDB ObjectId" }]
      )
    );
  }

  return next();
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
  validateObjectId,
  normalizeBody,
  validateFields,
};
