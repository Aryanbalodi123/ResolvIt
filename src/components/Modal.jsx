import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../modal.css';

{/* Modal root element for portal rendering */}
let modalRoot = document.getElementById('modal-root');
if (!modalRoot) {
  modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  // Use createPortal to render the modal into the 'modalRoot' element
  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose}
    >
      {/* Stop click propagation so clicking modal content doesn't close it */}
      <div 
        className="modal-center" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;