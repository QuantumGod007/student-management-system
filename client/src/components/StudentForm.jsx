import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";

import { createStudent, updateStudent, getApiErrorMessage } from "../api/studentsApi";
import { DEPARTMENTS, YEARS, DIVISIONS } from "../constants/departments";

const EMPTY_STUDENT = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
  division: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function StudentForm({ onClose, editingStudent = null, onSaved }) {
  const [student, setStudent] = useState(
    editingStudent
      ? {
          studentId: editingStudent.studentId || "",
          name: editingStudent.name || "",
          email: editingStudent.email || "",
          phone: editingStudent.phone || "",
          department: editingStudent.department || "",
          year: editingStudent.year ? String(editingStudent.year) : "",
          division: editingStudent.division || "",
        }
      : EMPTY_STUDENT
  );

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editingStudent);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setStudent((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!student.studentId.trim()) {
      nextErrors.studentId = "Student ID is required.";
    }

    if (student.name.trim().length < 2) {
      nextErrors.name = "Enter the student's full name.";
    }

    if (!EMAIL_PATTERN.test(student.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!PHONE_PATTERN.test(student.phone.replace(/[\s-]/g, ""))) {
      nextErrors.phone = "Enter a valid 10 digit mobile number.";
    }

    if (!student.department) {
      nextErrors.department = "Select a department.";
    }

    if (!student.year) {
      nextErrors.year = "Select a year.";
    }

    if (!student.division) {
      nextErrors.division = "Select a division.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    const payload = {
      studentId: student.studentId.trim().toUpperCase(),
      name: student.name.trim(),
      email: student.email.trim().toLowerCase(),
      phone: student.phone.replace(/[\s-]/g, ""),
      department: student.department,
      year: Number(student.year),
      division: student.division,
    };

    try {
      setSaving(true);

      const savedStudent = isEditing
        ? await updateStudent(editingStudent._id, payload)
        : await createStudent(payload);

      onSaved?.({
        student: savedStudent,
        isEditing,
      });

      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to save the student."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay" role="presentation">
      <div
        className="student-form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
      >
        <div className="form-header">
          <div>
            <span className="form-eyebrow">
              {isEditing ? "UPDATE RECORD" : "NEW RECORD"}
            </span>

            <h2 id="student-form-title">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h2>

            <p>
              {isEditing
                ? "Update the student's information and save the changes."
                : "Enter the student's details to create a new record."}
            </p>
          </div>

          <button
            type="button"
            className="form-close-btn"
            aria-label="Close form"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div className="form-error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="studentId">Student ID *</label>

              <input
                id="studentId"
                type="text"
                name="studentId"
                placeholder="e.g. STU006"
                value={student.studentId}
                onChange={handleChange}
                className={errors.studentId ? "input-error" : ""}
              />

              {errors.studentId && (
                <span className="field-error">{errors.studentId}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="name">Full Name *</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter full name"
                value={student.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />

              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email *</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="student@example.edu"
                value={student.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />

              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone *</label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="10 digit mobile number"
                value={student.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
              />

              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="department">Department *</label>

              <select
                id="department"
                name="department"
                value={student.department}
                onChange={handleChange}
                className={errors.department ? "input-error" : ""}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </select>

              {errors.department && (
                <span className="field-error">{errors.department}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="year">Year *</label>

                <select
                  id="year"
                  name="year"
                  value={student.year}
                  onChange={handleChange}
                  className={errors.year ? "input-error" : ""}
                >
                  <option value="">Year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>

                {errors.year && (
                  <span className="field-error">{errors.year}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="division">Division *</label>

                <select
                  id="division"
                  name="division"
                  value={student.division}
                  onChange={handleChange}
                  className={errors.division ? "input-error" : ""}
                >
                  <option value="">Div</option>
                  {DIVISIONS.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>

                {errors.division && (
                  <span className="field-error">{errors.division}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="save-student-btn" disabled={saving}>
              {saving ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <UserPlus size={18} />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Student"
                  : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;
