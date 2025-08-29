import React from 'react';

const Alert = ({ children, onClose }) => {
  return (
    <div className="bg-blue-600 alert alert-primary alert-dismissible" style={{backgroundColor:"#e9f3fd", color:"black"}}>
      {children}
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
        data-bs-dismiss="alert"
        aria-label="Close"

      > X </button>
    </div>
  );
};

export default Alert;
