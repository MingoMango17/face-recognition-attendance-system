// pages/LeavePage.tsx
import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import LeaveStatsCards from "../components/Leave/LeaveStatCards";
import LeaveTable from "../components/Leave/LeaveTable";
import AddLeaveModal, {
    type LeaveFormData,
} from "../components/Leave/AddLeaveModal";
import { type Employee, type Leave, LEAVE_TYPES } from "../types/leave";

const LeavePage: React.FC = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data - replace with actual API calls
    useEffect(() => {
        // Mock employees data
        setEmployees([
            {
                id: 1,
                name: "John Doe",
                email: "john@company.com",
                department: "Engineering",
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@company.com",
                department: "Marketing",
            },
            {
                id: 3,
                name: "Mike Johnson",
                email: "mike@company.com",
                department: "Support",
            },
            {
                id: 4,
                name: "Sarah Wilson",
                email: "sarah@company.com",
                department: "Engineering",
            },
        ]);

        // Mock leaves data
        setLeaves([
            {
                id: 1,
                employee: {
                    id: 1,
                    name: "John Doe",
                    email: "john@company.com",
                    department: "Engineering",
                },
                leave_type: 0,
                details: "Family vacation",
                start_date: "2025-10-15",
                end_date: "2025-10-20",
                is_approved: true,
            },
            {
                id: 2,
                employee: {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@company.com",
                    department: "Marketing",
                },
                leave_type: 1,
                details: "Flu symptoms",
                start_date: "2025-09-20",
                end_date: "2025-09-22",
                is_approved: true,
            },
            {
                id: 3,
                employee: {
                    id: 3,
                    name: "Mike Johnson",
                    email: "mike@company.com",
                    department: "Support",
                },
                leave_type: 3,
                details: "Personal matters",
                start_date: "2025-11-01",
                end_date: "2025-11-03",
                is_approved: false,
            },
        ]);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    const handleSubmitLeave = async (formData: LeaveFormData) => {
        setLoading(true);

        try {
            // Mock API call - replace with actual implementation
            const selectedEmployee = employees.find(
                (emp) => emp.id === parseInt(formData.employee_id)
            );

            const newLeave: Leave = {
                id: leaves.length + 1,
                employee: selectedEmployee!,
                leave_type: parseInt(formData.leave_type),
                details: formData.details,
                start_date: formData.start_date,
                end_date: formData.end_date,
                is_approved: false,
            };

            setLeaves([...leaves, newLeave]);
            setShowModal(false);
        } catch (error) {
            console.error("Error creating leave:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditLeave = (leave: Leave) => {
        // TODO: Implement edit functionality
        console.log("Edit leave:", leave);
    };

    const handleDeleteLeave = (id: number) => {
        // TODO: Implement delete functionality
        console.log("Delete leave:", id);
        setLeaves(leaves.filter((leave) => leave.id !== id));
    };

    const filteredLeaves = leaves.filter(
        (leave) =>
            leave.employee.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            leave.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            LEAVE_TYPES[leave.leave_type as keyof typeof LEAVE_TYPES].label
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter((leave) => leave.is_approved).length;
    const pendingLeaves = leaves.filter((leave) => !leave.is_approved).length;

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
        <Layout headerTitle="Leave" headerRightContent={headerRightContent} showDateTime={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LeaveStatsCards
                    totalLeaves={totalLeaves}
                    approvedLeaves={approvedLeaves}
                    pendingLeaves={pendingLeaves}
                />

                <LeaveTable
                    leaves={filteredLeaves}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onAddLeave={() => setShowModal(true)}
                    onEditLeave={handleEditLeave}
                    onDeleteLeave={handleDeleteLeave}
                />

                <AddLeaveModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmitLeave}
                    employees={employees}
                    loading={loading}
                />
            </div>
        </Layout>
    );
};

export default LeavePage;
