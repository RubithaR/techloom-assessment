function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">

      <div className="modal-box">

        <h3>{title}</h3>

        <p>{message}</p>

        <div className="modal-actions">

          <button
            className="secondary-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className="danger-btn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConfirmModal;