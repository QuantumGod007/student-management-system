const express = require("express");

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const {
  validateCreateStudent,
  validateUpdateStudent,
  validateObjectId,
} = require("../middleware/validateStudent");

const router = express.Router();

router
  .route("/")
  .get(getStudents)
  .post(validateCreateStudent, createStudent);

router
  .route("/:id")
  .get(validateObjectId, getStudentById)
  .put(validateObjectId, validateUpdateStudent, updateStudent)
  .delete(validateObjectId, deleteStudent);

module.exports = router;
