import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import LeaveTable from "../components/Leave/LeaveTable";
import { type Leave, LEAVE_TYPES } from "../types/leave";
import { api } from "../utils/api";

const LeavePage: React.FC = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getLeaves = async () => {
        const request = await api.get("payroll/leaves/");
        console.log(request.data);
        setLeaves(request.data);
    };

    useEffect(() => {
        getLeaves();
    }, []);
    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    const handleEditLeave = (leave: Leave) => {
        // TODO: Implement edit functionality
        console.log("Edit leave:", leave);
    };

    const handleDeleteLeave = async (id: number) => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this leave request?"
        );

        if (!isConfirmed) {
            return;
        }

        console.log("Delete leave:", id);
        await api.delete("payroll/leaves/", {
            params: {
                leave_id: id,
            },
        });
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
        <Layout headerTitle="Leave" headerRightContent={headerRightContent}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* <LeaveStatsCards
                    totalLeaves={totalLeaves}
                    approvedLeaves={approvedLeaves}
                    pendingLeaves={pendingLeaves}
                /> */}

                <LeaveTable
                    leaves={filteredLeaves}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onEditLeave={handleEditLeave}
                    onDeleteLeave={handleDeleteLeave}
                />
            </div>
        </Layout>
    );
};

export default LeavePage;
