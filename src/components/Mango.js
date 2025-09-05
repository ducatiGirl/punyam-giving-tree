
import React from 'react';

const MangoIcon = ({ color = 'currentColor', size = 24, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    style={style}
  >
    <path d="M11.66 2.05c-3.52 1.34-6.4 5.25-6.4 10.37 0 5.48 4.34 9.58 9.53 9.58 4.8 0 8.52-3.83 8.2-8.35-.16-2.22-1.25-4.22-3.03-5.69-2.12-1.72-4.9-2.25-8.3-5.91z" />
  </svg>
);

export default MangoIcon;
