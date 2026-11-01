import { useMemo, useState } from "react";
import { Users, Search, Pencil, Trash2, ChevronDown } from "lucide-react";

import { DEPARTMENTS, YEARS, formatYear } from "../constants/departments";

const STUDENTS_PER_PAGE = 6;

function StudentDirectory({
  students = [],
  loading = false,
  onStudentDeleted,
  onEditStudent,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const email = String(student.email || "").toLowerCase();
      const studentId = String(student.studentId || "").toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        studentId.includes(search);

      const matchesDepartment =
        !selectedDepartment ||
        String(student.department || "").toUpperCase() === selectedDepartment;

      const matchesYear =
        !selectedYear || String(student.year || "") === selectedYear;

      return matchesSearch && matchesDepartment && matchesYear;
    });
  }, [students, searchTerm, selectedDepartment, selectedYear]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * STUDENTS_PER_PAGE;

  const displayedStudents = filteredStudents.slice(
    startIndex,
    startIndex + STUDENTS_PER_PAGE
  );

  const resetPage = () => setCurrentPage(1);

  return (
    <section className="student-directory" id="students">
      <div className="directory-header">
        <div className="directory-title">
          <div className="directory-icon">
            <Users size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h2>Student Directory</h2>
            <p>Search, filter, edit or remove student records.</p>
          </div>
        </div>

        <div className="directory-filters">
          <div className="select-wrapper">
            <select
              aria-label="Filter by department"
              value={selectedDepartment}
              onChange={(event) => {
                setSelectedDepartment(event.target.value);
                resetPage();
              }}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((department) => (
                <option key={department.value} value={department.value}>
                  {department.value}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>

          <div className="select-wrapper">
            <select
              aria-label="Filter by year"
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                resetPage();
              }}
            >
              <option value="">All Years</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="directory-search">
        <div className="directory-search-input">
          <Search size={19} />

          <input
            type="search"
            placeholder="Search by name, email or student ID..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPage();
            }}
          />
        </div>
      </div>

      <div className="student-table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>DEPARTMENT</th>
              <th>YEAR</th>
              <th>DIV</th>
              <th>PHONE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-students">
                  <strong>Loading students...</strong>
                  <span>Fetching records from the database.</span>
                </td>
              </tr>
            ) : displayedStudents.length > 0 ? (
              displayedStudents.map((student) => (
                <tr key={student._id || student.studentId}>
                  <td className="student-id">{student.studentId || "—"}</td>
                  <td className="student-name">{student.name || "—"}</td>
                  <td className="student-email">{student.email || "—"}</td>

                  <td>
                    <span className="course-badge department-badge">
                      {student.department || "—"}
                    </span>
                  </td>

                  <td>{formatYear(student.year)}</td>
                  <td>{student.division || "—"}</td>
                  <td>{student.phone || "—"}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        title="Edit student"
                        aria-label={`Edit ${student.name}`}
                        onClick={() => onEditStudent?.(student)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        title="Delete student"
                        aria-label={`Delete ${student.name}`}
                        onClick={() => onStudentDeleted?.(student)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-students">
                  <Users size={32} />
                  <strong>No students found</strong>
                  <span>
                    {students.length === 0
                      ? "Add the first student to get started."
                      : "Try changing your search or filters."}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="directory-footer">
        <p>
          Showing <strong>{displayedStudents.length}</strong> of{" "}
          <strong>{filteredStudents.length}</strong> students
          {filteredStudents.length !== students.length && (
            <> (filtered from {students.length})</>
          )}
        </p>

        <div className="pagination">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                type="button"
                key={page}
                className={safePage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default StudentDirectory;
