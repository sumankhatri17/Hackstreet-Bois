/**
 * Reusable Modal Component
 *
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - onClose: Function to close modal
 * - title: Modal title
 * - children: Modal content
 *
 * Usage:
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
 *   <p>Are you sure?</p>
 * </Modal>
 */

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 pr-8">
            {title}
          </h2>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
