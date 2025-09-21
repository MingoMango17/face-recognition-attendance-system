// pages/DashboardPage.tsx
import React from "react";
import { User, LogOut, Bell } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
    const { userData, logout } = useAuth();

    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    // Define custom header content for dashboard
    const headerRightContent = (
        <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            {/* <button
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors relative"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button> */}

            {/* User Menu */}
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                        {userData?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500">
                        {userData?.role}
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <Layout
            headerTitle="Dashboard"
            headerRightContent={headerRightContent}
            
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dashboard content goes here */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Today's Attendance
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">24</p>
                        <p className="text-sm text-gray-500">
                            Employees checked in
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Late Arrivals
                        </h3>
                        <p className="text-3xl font-bold text-orange-600">3</p>
                        <p className="text-sm text-gray-500">Late today</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Absent</h3>
                        <p className="text-3xl font-bold text-red-600">2</p>
                        <p className="text-sm text-gray-500">Not checked in</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;
