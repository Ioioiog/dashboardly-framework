import React from "react";

interface SidebarLogoProps {
  isExpanded: boolean;
}

export const SidebarLogo: React.FC<SidebarLogoProps> = ({ isExpanded }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <img 
        src="/lovable-uploads/9c23bc1b-4e8c-433e-a961-df606dc6a2c6.png" 
        alt="AdminChirii.ro Logo" 
        className="h-8 w-8 rounded-lg shadow-sm"
      />
      {isExpanded && (
        <div className="flex flex-col items-start">
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            AdminChirii.ro
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            simplificăm administrarea
          </span>
        </div>
      )}
    </div>
  );
};