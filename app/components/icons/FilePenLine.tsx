"use client";

import React from "react";

export function FilePenLine({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* file outline */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      {/* pen */}
      <path d="M16.5 12.5l-7 7L8 21l1.5-.5 7-7a1.414 1.414 0 0 0-2-2z" />
      <path d="M15 13l2 2" />
    </svg>
  );
}
