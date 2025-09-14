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
    <div className={contentClassName}>
      <Header
        title={headerTitle}
        rightContent={headerRightContent}
        showDateTime={showDateTime}
        className={headerClassName}
      />
      
      <div className="flex h-[calc(100vh-73px)]"> {/* Subtract header height */}
        {showSidebar && (
          <Sidebar className={sidebarClassName} />
        )}
        
        <main className={`flex-1 overflow-auto ${showSidebar ? '' : 'w-full'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;