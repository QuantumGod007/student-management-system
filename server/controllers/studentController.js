const Student = require("../models/Student");
const ApiError = require("../utils/ApiError");

/**
 * GET /api/students
 * Optional query params: search, department, year.
 */
const getStudents = async (req, res) => {
  const { search, department, year } = req.query;

  const filter = {};

  if (search && String(search).trim()) {
    const term = String(search).trim();
    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    filter.$or = [
      { name: pattern },
      { email: pattern },
      { studentId: pattern },
    ];
  }

  if (department && String(department).trim()) {
    filter.department = String(department).trim().toUpperCase();
  }

  if (year !== undefined && String(year).trim() !== "") {
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      throw ApiError.badRequest("year filter must be 1, 2, 3 or 4");
    }

    filter.year = parsedYear;
  }

  const students = await Student.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
};

/**
 * GET /api/students/:id
 */
const getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    throw ApiError.notFound(`Student with id '${req.params.id}' not found`);
  }

  res.status(200).json({
    success: true,
    data: student,
  });
};

/**
 * POST /api/students
 * Body already validated and normalized by middleware.
 */
const createStudent = async (req, res) => {
  const student = await Student.create(req.student);

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: student,
  });
};

/**
 * PUT /api/students/:id
 * Partial updates are allowed; supplied fields are fully validated.
 */
const updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.student, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    throw ApiError.notFound(`Student with id '${req.params.id}' not found`);
  }

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student,
  });
};

/**
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    throw ApiError.notFound(`Student with id '${req.params.id}' not found`);
  }

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    data: student,
  });
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
