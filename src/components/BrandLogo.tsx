import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const sizeMap = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={`relative flex items-center justify-center rounded-2xl shadow-xl shadow-indigo-500/20 ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="logoGradPrimary" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="logoGradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="logoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Squircle Base */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="26"
          fill="url(#logoBg)"
          stroke="url(#logoBorder)"
          strokeWidth="2.5"
        />

        {/* Geometric Left Reach Pillar */}
        <path
          d="M24 72 V36 C24 30 29 27 34 31 L48 46 L41 53 L33 46 V72 Z"
          fill="url(#logoGradPrimary)"
        />

        {/* Geometric Right Reach Pillar */}
        <path
          d="M76 72 V36 C76 30 71 27 66 31 L52 46 L59 53 L67 46 V72 Z"
          fill="url(#logoGradPrimary)"
        />

        {/* Center Ascending Apex Arrow */}
        <path
          d="M50 20 L64 37 L56 44 L50 37 L44 44 L36 37 Z"
          fill="url(#logoGradSecondary)"
        />

        {/* Energy Pulse Center Point */}
        <circle cx="50" cy="58" r="4" fill="#38bdf8" />
      </svg>
    </div>
  );
}
