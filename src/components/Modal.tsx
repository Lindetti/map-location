import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string; 
  children: React.ReactNode; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
        {/* Titel */}
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        )}

        {/* Innehåll */}
        <div className="text-gray-700  text-left">{children}</div>

        {/* Stäng-knapp */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
