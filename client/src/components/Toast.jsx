import { CheckCircle2, AlertCircle, X } from "lucide-react";

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`toast ${isError ? "toast-error" : "toast-success"}`}
      role="status"
      aria-live="polite"
    >
      {isError ? (
        <AlertCircle size={19} strokeWidth={2} />
      ) : (
        <CheckCircle2 size={19} strokeWidth={2} />
      )}

      <span>{toast.message}</span>

      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={onClose}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default Toast;
