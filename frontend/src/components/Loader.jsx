import React from 'react';

const Loader = ({ overlay = false, message = "Loading..." }) => {
  const containerClass = overlay ? "loader-overlay" : "loader-inline";
  
  return (
    <div className={containerClass}>
      <div className="loader-spinner"></div>
      <div className="loader-text">{message}</div>
    </div>
  );
};

export default Loader;
