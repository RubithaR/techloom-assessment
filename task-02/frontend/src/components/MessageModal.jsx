function MessageModal({
  open,
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">

      <div className="modal-box">

        <h3>{title}</h3>

        <p>{message}</p>

        <div className="modal-actions">

          <button
            className="primary-btn"
            onClick={onClose}
          >
            OK
          </button>

        </div>

      </div>

    </div>
  );
}

export default MessageModal;