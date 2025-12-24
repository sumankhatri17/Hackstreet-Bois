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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        )}
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;