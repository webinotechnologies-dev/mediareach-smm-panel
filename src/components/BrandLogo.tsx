import React from "react";
import Image from "next/image";

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

  const pixelMap = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/20 bg-slate-950 ${sizeMap[size]} ${className}`}
    >
      <Image
        src="/brand-logo.jpg"
        alt="MediaReach Official Brand Logo"
        width={pixelMap[size]}
        height={pixelMap[size]}
        className="w-full h-full object-cover rounded-2xl"
        priority
      />
    </div>
  );
}

