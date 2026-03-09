import React from 'react';

export const LogoIcon = ({ className = "h-8 w-8" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Main package/box shape */}
      <g transform="translate(50, 40)">
        {/* Top of box */}
        <path
          d="M 50 20 L 25 35 L 25 85 L 50 70 L 75 85 L 75 35 Z"
          fill="#0ea5e9"
          stroke="#0284c7"
          strokeWidth="2"
        />

        {/* Front face */}
        <rect
          x="25"
          y="35"
          width="50"
          height="50"
          fill="#06b6d4"
          stroke="#0891b2"
          strokeWidth="2"
          rx="4"
        />

        {/* Side face (for 3D effect) */}
        <path
          d="M 75 35 L 85 25 L 85 75 L 75 85 Z"
          fill="#0891b2"
          stroke="#0284c7"
          strokeWidth="2"
          rx="4"
        />

        {/* Top face */}
        <path
          d="M 25 35 L 35 25 L 85 25 L 75 35 Z"
          fill="#06b6d4"
          stroke="#0284c7"
          strokeWidth="2"
          rx="4"
        />

        {/* Shine/highlight */}
        <ellipse cx="45" cy="50" rx="12" ry="15" fill="white" opacity="0.3" />

        {/* Ribbon/bow accent */}
        <rect
          x="45"
          y="35"
          width="10"
          height="45"
          fill="#f59e0b"
          rx="2"
          opacity="0.9"
        />
        <circle cx="50" cy="35" r="8" fill="#f59e0b" opacity="0.9" />
      </g>
    </svg>
  );
};
