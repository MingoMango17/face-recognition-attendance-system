import React, { useState } from "react";
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserCheck,
    Settings,
    ChevronDown,
    ChevronRight,
    UserPlus,
    UserStar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    children?: SidebarItem[];
}

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(
        new Set(["employee"])
    );

    const sidebarItems: SidebarItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            path: "/dashboard",
        },
        {
            id: "employee",
            label: "Employee",
            icon: <Users className="w-5 h-5" />,
            path: "/employee",
            // children: [
            //     {
            //         id: "all-employee",
            //         label: "All Employee",
            //         icon: <Users className="w-4 h-4" />,
            //         path: "/employee",
            //     },
            //     {
            //         id: "add-employee",
            //         label: "Add Employee",
            //         icon: <UserPlus className="w-4 h-4" />,
            //         path: "/employee/add",
            //     },
            // ],
        },
        {
            id: "leave",
            label: "Leave",
            icon: <Calendar className="w-5 h-5" />,
            path: "/leave",
        },
        {
            id: "attendance",
            label: "Attendance",
            icon: <UserCheck className="w-5 h-5" />,
            path: "/attendance",
        },
        // {
        //     id: "administration",
        //     label: "Administration",
        //     icon: <UserStar className="w-5 h-5" />,
        //     path: "/administration",
        // },
        // {
        //     id: "setting",
        //     label: "Setting",
        //     icon: <Settings className="w-5 h-5" />,
        //     path: "/settings",
        // },
    ];

    const toggleExpanded = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleItemClick = (item: SidebarItem) => {
        if (item.children) {
            toggleExpanded(item.id);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const isParentActive = (item: SidebarItem) => {
        if (item.children) {
            return item.children.some(
                (child) => child.path && isActive(child.path)
            );
        }
        return false;
    };

    const renderSidebarItem = (item: SidebarItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const itemIsActive = item.path
            ? isActive(item.path)
            : isParentActive(item);

        return (
            <div key={item.id}>
                <button
                    onClick={() => handleItemClick(item)}
                    className={`
            w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200
            ${level === 0 ? "text-sm" : "text-xs ml-4"}
            ${
                itemIsActive
                    ? "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
                    : "text-gray-700 hover:bg-gray-50"
            }
          `}
                >
                    <div className="flex items-center space-x-3">
                        <span
                            className={
                                itemIsActive
                                    ? "text-purple-600"
                                    : "text-gray-500"
                            }
                        >
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </div>
                    {hasChildren && (
                        <span className="text-gray-400">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </span>
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div className="bg-gray-50">
                        {item.children?.map((child) =>
                            renderSidebarItem(child, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`w-64 bg-white border-r border-gray-200 h-full ${className}`}
        >
            <div className="flex flex-col h-full">
                {/* Navigation Items */}
                <nav className="flex-1 py-4">
                    {sidebarItems.map((item) => renderSidebarItem(item))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
