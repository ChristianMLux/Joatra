"use client";

import React from "react";
import Link from "next/link";

interface TitleProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  color?: string;
  className?: string;
  asLink?: boolean;
  href?: string;
  underline?: boolean;
}

export const Title: React.FC<TitleProps> = ({
  text,
  size = "lg",
  color = "text-blue-700",
  className = "",
  asLink = false,
  href = "/",
  underline = false,
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
  };

  const baseClasses = `font-bold ${sizeClasses[size]} ${color} ${underline ? "border-b-2 border-blue-600 pb-1" : ""} ${className}`;

  if (asLink) {
    return (
      <Link
        href={href}
        className={`${baseClasses} hover:text-blue-800 transition-colors`}
      >
        {text}
      </Link>
    );
  }

  return <h1 className={baseClasses}>{text}</h1>;
};

export default Title;
