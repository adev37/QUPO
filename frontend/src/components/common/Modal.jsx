// frontend/src/components/common/Modal.jsx
import React from "react";

const Modal = ({ title, open, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg max-w-lg w-full">
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 py-2 border-t">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
