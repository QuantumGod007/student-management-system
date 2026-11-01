import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Users,
  Building2,
  CalendarPlus,
  LayoutGrid,
  RefreshCw,
  UserRoundPlus,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import StudentDirectory from "./components/StudentDirectory";
import StudentForm from "./components/StudentForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

import {
  fetchStudents,
  deleteStudent,
  getApiErrorMessage,
} from "./api/studentsApi";

function App() {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [reloadKey, setReloadKey] = useState(0);

  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });

    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchStudents();

        if (cancelled) return;

        setStudents(Array.isArray(data) ? data : []);
        setPageError("");
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load students:", error);
        setPageError(getApiErrorMessage(error, "Unable to load students."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRefresh = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleCloseForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  const handleSaved = ({ student, isEditing }) => {
    setStudents((current) =>
      isEditing
        ? current.map((item) =>
            item._id === student._id ? student : item
          )
        : [student, ...current]
    );

    setPageError("");
    showToast(
      isEditing
        ? `${student.name}'s record was updated.`
        : `${student.name} was added to the student directory.`
    );
  };

  const handleDeleteRequest = (student) => setDeleteTarget(student);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteStudent(deleteTarget._id);

      setStudents((current) =>
        current.filter((student) => student._id !== deleteTarget._id)
      );

      showToast(`${deleteTarget.name} was deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
      showToast(getApiErrorMessage(error, "Unable to delete the student."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();

    const departments = new Set(
      students.map((student) => student.department).filter(Boolean)
    );

    const divisions = new Set(
      students.map((student) => student.division).filter(Boolean)
    );

    const newThisMonth = students.filter((student) => {
      if (!student.createdAt) return false;

      const created = new Date(student.createdAt);

      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total: students.length,
      departments: departments.size,
      divisions: divisions.size,
      newThisMonth,
    };
  }, [students]);

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleNavigate = (section) => {
    setActiveNav(section);

    if (section === "students") {
      document.getElementById("students")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (section === "dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeItem={activeNav}
        onNavigate={handleNavigate}
        onAddStudent={handleOpenAddForm}
      />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-heading">
            <span className="topbar-eyebrow">Student Administration</span>
            <h2>Student Management System</h2>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="notification-btn"
              title="Refresh student records"
              aria-label="Refresh student records"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={19} className={loading ? "spin" : ""} />
            </button>

            <div className="topbar-divider"></div>

            <div className="date-section">
              <strong>{formattedDate}</strong>
              <span>Welcome, Administrator</span>
            </div>

            <div className="profile-section">
              <div className="profile-avatar">A</div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="welcome-section" id="dashboard">
            <div className="welcome-text">
              <h1>Student Dashboard</h1>

              <p>
                Overview of student records stored in the MongoDB database via
                the Student Management REST API.
              </p>
            </div>

            <button
              type="button"
              className="add-student-btn"
              onClick={handleOpenAddForm}
            >
              <UserRoundPlus size={19} />
              Add Student
            </button>
          </section>

          {pageError && (
            <div className="app-error" role="alert">
              <span>{pageError}</span>

              <button type="button" className="retry-btn" onClick={handleRefresh}>
                Retry
              </button>
            </div>
          )}

          <section className="stats-grid" aria-label="Dashboard statistics">
            <StatCard
              icon={<Users size={18} />}
              title="Total Students"
              value={loading ? "—" : stats.total}
              subtitle="Records in the database"
            />

            <StatCard
              icon={<Building2 size={18} />}
              title="Departments"
              value={loading ? "—" : stats.departments}
              subtitle="Represented in records"
            />

            <StatCard
              icon={<LayoutGrid size={18} />}
              title="Divisions"
              value={loading ? "—" : stats.divisions}
              subtitle="Active class divisions"
            />

            <StatCard
              icon={<CalendarPlus size={18} />}
              title="New This Month"
              value={loading ? "—" : stats.newThisMonth}
              subtitle="Created in current month"
            />
          </section>

          <StudentDirectory
            students={students}
            loading={loading}
            onEditStudent={handleEditStudent}
            onStudentDeleted={handleDeleteRequest}
          />
        </main>

        {showStudentForm && (
          <StudentForm
            onClose={handleCloseForm}
            onSaved={handleSaved}
            editingStudent={editingStudent}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            student={deleteTarget}
            busy={deleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}

export default App;
