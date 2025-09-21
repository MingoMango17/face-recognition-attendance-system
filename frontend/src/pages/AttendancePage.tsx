// pages/AttendancePage.tsx
import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import SessionDetailsModal from "../components/Attendance/SessionDetailModal";
import type { AttendanceRecord, DailyAttendance } from "../types/attendance";
import { api } from "../utils/api";

const AttendancePage: React.FC = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] =
        useState<DailyAttendance | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async (date?: string) => {
        try {
            setLoading(true);
            const dateParam = date || selectedDate;
            const request = await api.get(
                `payroll/attendance/?date=${dateParam}`
            );
            setAttendanceRecords(request.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]); // Re-fetch when selectedDate changes

    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    const handleViewDetails = (attendance: DailyAttendance) => {
        setSelectedAttendance(attendance);
        setShowDetailsModal(true);
    };

    const handleEditRecord = (attendance: DailyAttendance) => {
        // TODO: Implement edit functionality
        console.log("Edit attendance:", attendance);
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        // fetchAttendance will be called automatically by useEffect
    };

    // Header content
    const headerRightContent = (
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                        {userData?.name || "Admin User"}
                    </div>
                    <div className="text-xs text-gray-500">
                        {userData?.role || "ADMIN"}
                    </div>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );

    if (loading) {
        return (
            <Layout
                headerTitle="Attendance"
                headerRightContent={headerRightContent}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Loading attendance data...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            headerTitle="Attendance"
            headerRightContent={headerRightContent}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AttendanceTable
                    attendanceRecords={attendanceRecords}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    onViewDetails={handleViewDetails}
                    onEditRecord={handleEditRecord}
                />
                <SessionDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    attendance={selectedAttendance}
                />
            </div>
        </Layout>
    );
};

export default AttendancePage;
