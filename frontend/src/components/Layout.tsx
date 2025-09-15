// components/Layout.tsx
import React, { type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerRightContent?: ReactNode;
  showDateTime?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  showSidebar?: boolean;
  sidebarClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  headerTitle,
  headerRightContent,
  showDateTime = true,
  headerClassName,
  contentClassName = "min-h-screen bg-gray-50",
  showSidebar = true,
  sidebarClassName,
}) => {
  return (
    <div className={`min-h-screen text-black ${contentClassName}`}>
      {/* Header - Fixed at top with proper z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          title={headerTitle}
          rightContent={headerRightContent}
          showDateTime={showDateTime}
          className={headerClassName}
        />
      </div>

      {/* Content area with sidebar and main content */}
      <div className="flex pt-[73px]"> {/* Add padding-top to account for fixed header */}
        {showSidebar && (
          <div className="fixed left-0 top-[73px] bottom-0 z-40">
            <Sidebar className={sidebarClassName} />
          </div>
        )}
        
        <main className={`flex-1 overflow-auto ${showSidebar ? 'ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;