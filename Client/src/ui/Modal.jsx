/**
 * Modal.jsx
 * Centered modal dialog wrapper with backdrop blur and animated entrance.
 */

import React from 'react';

/**
 * Renders a backdrop overlay modal dialog.
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 540, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className={`iron-modal-backdrop ${className ? `${className}__backdrop` : ''}`} onClick={onClose}>
      <div
        className={`iron-modal ${className}`}
        style={{ maxWidth: `${maxWidth}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="iron-modal__header">
            <h2 className="iron-modal__title">{title}</h2>
            {onClose && (
              <button
                type="button"
                className="iron-modal__close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="iron-modal__body">{children}</div>
      </div>
    </div>
  );
}
