import React from "react";

export function AuthBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-blue-800/5 to-blue-700/5">
      <div className="absolute inset-0">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}