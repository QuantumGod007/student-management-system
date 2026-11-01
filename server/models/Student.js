const mongoose = require("mongoose");

const DEPARTMENTS = [
  "CSE",
  "IT",
  "AIDS",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(\+91)?[6-9]\d{9}$/;
const STUDENT_ID_PATTERN = /^[A-Z0-9-]{3,20}$/;

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        STUDENT_ID_PATTERN,
        "Student ID must be 3-20 characters using letters, numbers or hyphens",
      ],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Please provide a valid email address"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        PHONE_PATTERN,
        "Phone number must be a valid 10 digit Indian mobile number",
      ],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      uppercase: true,
      enum: {
        values: DEPARTMENTS,
        message: `Department must be one of: ${DEPARTMENTS.join(", ")}`,
      },
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
    },

    division: {
      type: String,
      required: [true, "Division is required"],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]$/, "Division must be a single letter (for example A)"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        // Keep a stable client-facing shape: `_id` is enough for the frontend.
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Sorted listing used by GET /api/students.
studentSchema.index({ createdAt: -1 });

studentSchema.statics.DEPARTMENTS = DEPARTMENTS;

module.exports = mongoose.model("Student", studentSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
