import React, { type ReactNode } from "react";

interface HeaderProps {
  title?: string;
  rightContent?: ReactNode;
  showDateTime?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Payroll System",
  rightContent,
  showDateTime = true,
  className = "",
}) => {
  const getCurrentTime = (): string => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            {/* <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div> */}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          {/* Right side - DateTime and Custom Content */}
          <div className="flex items-center space-x-4">
            {showDateTime && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {getCurrentTime()}
                </div>
                <div className="text-xs text-gray-500">
                  {getCurrentDate()}
                </div>
              </div>
            )}
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;