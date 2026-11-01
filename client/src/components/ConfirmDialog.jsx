import { AlertTriangle } from "lucide-react";

function ConfirmDialog({
  student,
  busy = false,
  onCancel,
  onConfirm,
}) {
  if (!student) return null;

  return (
    <div className="form-overlay" role="presentation">
      <div
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="confirm-icon">
          <AlertTriangle size={22} />
        </div>

        <h2 id="confirm-title">Delete student?</h2>

        <p>
          <strong>{student.name}</strong> ({student.studentId}) will be
          permanently removed from the database. This action cannot be undone.
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className="danger-btn"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting..." : "Delete Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
