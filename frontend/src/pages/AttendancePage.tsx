// pages/AttendancePage.tsx
import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import AttendanceStatsCards from "../components/Attendance/AttendanceStatsCards";
import AttendanceTable from "../components/Attendance/AttendanceTable";
// import SessionDetailsModal from "../components/Attendance/SessionDetailsModal";
import SessionDetailsModal from "../components/Attendance/SessionDetailModal";
import AddAttendanceModal from "../components/Attendance/AddAttendanceModal";
import type { Employee, AttendanceRecord, DailyAttendance } from "../types/attendance";
import { processAttendanceRecords, getAllEmployeesWithAttendance } from "../utils/attendance.utils";

const AttendancePage: React.FC = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<DailyAttendance | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock data - replace with actual API calls
    useEffect(() => {
        // Mock employees data
        const mockEmployees = [
            { id: 1, name: "John Doe", email: "john@company.com", department: "Engineering" },
            { id: 2, name: "Jane Smith", email: "jane@company.com", department: "Marketing" },
            { id: 3, name: "Mike Johnson", email: "mike@company.com", department: "Support" },
            { id: 4, name: "Sarah Wilson", email: "sarah@company.com", department: "Engineering" },
        ];
        setEmployees(mockEmployees);

        // Mock attendance records - multiple sessions per employee
        const mockRecords: AttendanceRecord[] = [
            // John Doe - Complete day with lunch break
            {
                id: 1,
                employee: mockEmployees[0],
                timestamp: `${selectedDate}T08:30:00`,
                attendance_type: 1, // TIME_IN
            },
            {
                id: 2,
                employee: mockEmployees[0],
                timestamp: `${selectedDate}T12:00:00`,
                attendance_type: 2, // TIME_OUT (lunch)
            },
            {
                id: 3,
                employee: mockEmployees[0],
                timestamp: `${selectedDate}T13:00:00`,
                attendance_type: 1, // TIME_IN (back from lunch)
            },
            {
                id: 4,
                employee: mockEmployees[0],
                timestamp: `${selectedDate}T17:00:00`,
                attendance_type: 2, // TIME_OUT (end of day)
            },
            
            // Jane Smith - Currently checked in
            {
                id: 5,
                employee: mockEmployees[1],
                timestamp: `${selectedDate}T09:15:00`,
                attendance_type: 1, // TIME_IN
            },
            {
                id: 6,
                employee: mockEmployees[1],
                timestamp: `${selectedDate}T12:30:00`,
                attendance_type: 2, // TIME_OUT (lunch)
            },
            {
                id: 7,
                employee: mockEmployees[1],
                timestamp: `${selectedDate}T13:30:00`,
                attendance_type: 1, // TIME_IN (back from lunch)
            },
            
            // Mike Johnson - On break
            {
                id: 8,
                employee: mockEmployees[2],
                timestamp: `${selectedDate}T08:45:00`,
                attendance_type: 1, // TIME_IN
            },
            {
                id: 9,
                employee: mockEmployees[2],
                timestamp: `${selectedDate}T15:00:00`,
                attendance_type: 2, // TIME_OUT (break)
            },
            
            // Sarah Wilson - No records (absent)
        ];
        
        setAttendanceRecords(mockRecords);
    }, [selectedDate]);

    // Process attendance data whenever records or date changes
    useEffect(() => {
        const processedData = processAttendanceRecords(attendanceRecords, selectedDate);
        const allEmployeeData = getAllEmployeesWithAttendance(employees, processedData);
        setDailyAttendance(allEmployeeData);
    }, [attendanceRecords, selectedDate, employees]);

    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    const handleSubmitAttendance = async (formData: AttendanceFormData) => {
        setLoading(true);
        
        try {
            // Mock API call - replace with actual implementation
            const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee_id));
            
            const newRecord: AttendanceRecord = {
                id: attendanceRecords.length + 1,
                employee: selectedEmployee!,
                timestamp: new Date(formData.timestamp).toISOString(),
                attendance_type: parseInt(formData.attendance_type),
            };
            
            setAttendanceRecords([...attendanceRecords, newRecord]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Error creating attendance record:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (attendance: DailyAttendance) => {
        setSelectedAttendance(attendance);
        setShowDetailsModal(true);
    };

    const handleEditRecord = (attendance: DailyAttendance) => {
        // TODO: Implement edit functionality
        console.log("Edit attendance:", attendance);
    };

    // Filter attendance data based on search
    const filteredAttendance = dailyAttendance.filter(attendance =>
        attendance.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats
    const totalEmployees = employees.length;
    const presentCount = dailyAttendance.filter(att => att.status === "Present").length;
    const checkedInCount = dailyAttendance.filter(att => att.status === "Checked In").length;
    const absentCount = dailyAttendance.filter(att => att.status === "Absent").length;
    const onBreakCount = dailyAttendance.filter(att => att.status === "On Break").length;

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

    return (
        <Layout headerTitle="Attendance" headerRightContent={headerRightContent}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* <AttendanceStatsCards
                    totalEmployees={totalEmployees}
                    presentCount={presentCount}
                    checkedInCount={checkedInCount}
                    absentCount={absentCount}
                    onBreakCount={onBreakCount}
                /> */}

                <AttendanceTable
                    attendanceData={filteredAttendance}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onAddRecord={() => setShowAddModal(true)}
                    onViewDetails={handleViewDetails}
                    onEditRecord={handleEditRecord}
                />

                <SessionDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    attendance={selectedAttendance}
                />

                <AddAttendanceModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleSubmitAttendance}
                    employees={employees}
                    loading={loading}
                />
            </div>
        </Layout>
    );
};

export default AttendancePage;