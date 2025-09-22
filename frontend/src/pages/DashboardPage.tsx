import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

interface DashboardData {
    date_info: {
        target_date: string;
        current_month_start: string;
        current_month_end: string;
    };
    employee_overview: {
        total_active_employees: number;
        salary_type_breakdown: {
            hourly_count: number;
            monthly_count: number;
        };
        department_breakdown: Array<{
            department: string;
            count: number;
        }>;
        average_base_salary: number;
    };
    attendance_summary: {
        date: string;
        employees_present: number;
        total_active_employees: number;
        attendance_rate: number;
        time_in_count: number;
        time_out_count: number;
        records: Array<{
            id: number;
            employee: {
                user: {
                    first_name: string;
                    last_name: string;
                };
            };
            timestamp: string;
            attendance_type: number;
        }>;
        total_records: number;
    };
    payroll_metrics: {
        period: {
            start_date: string;
            end_date: string;
        };
        metrics: {
            total_payslips: number;
            total_gross_salary: string;
            total_net_salary: string;
            total_withholding_tax: string;
            avg_gross_salary: string;
            avg_net_salary: string;
        };
        status_breakdown: Array<{
            status: string;
            status_code: number;
            count: number;
        }>;
    };
    recent_payslips: Array<{
        id: number;
        employee_name: string;
        gross_salary: string;
        net_salary: string;
        status: string;
        generated_at: string;
        pay_period: string;
    }>;
    leave_analytics: {
        current_month_leaves: number;
        pending_approvals: number;
        approved_leaves: number;
        leave_type_breakdown: Array<{
            leave_type: string;
            leave_type_code: number;
            count: number;
        }>;
        recent_leaves: Array<{
            employee_name: string;
            leave_type: string;
            start_date: string;
            end_date: string;
            is_approved: boolean;
            details: string;
        }>;
    };
    financial_summary: {
        payroll_summary: {
            total_gross: string;
            total_net: string;
            total_tax: string;
        };
        active_allowances_total: string;
        active_deductions_total: string;
        estimated_monthly_cost: string;
    };
    trends: {
        payroll_growth: {
            current_month_total: string;
            previous_month_total: string;
            percentage_change: number;
        };
        payslip_count_change: {
            current_count: number;
            previous_count: number;
            percentage_change: number;
        };
    };
    alerts: Array<{
        type: string;
        message: string;
        action_needed: boolean;
    }>;
}

const DashboardPage: React.FC = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    const fetchDashboardData = async (date?: string) => {
        setLoading(true);
        setError(null);

        try {
            const url = date
                ? `payroll/dashboard/?date=${date}`
                : "payroll/dashboard/";

            const response = await api.get(url);
            setDashboardData(response.data);
        } catch (err: any) {
            setError(
                err.response?.data?.error || "Failed to fetch dashboard data"
            );
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteAllData = async () => {
        setLoading(true);
        setError(null);
        if (window.confirm("Are you sure you want to delete all the data? ")) {
            try {
                const response = await api.delete("payroll/delete-all/");
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to delete data");
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
                setDashboardData(null);
            }
        }
    };
    useEffect(() => {
        fetchDashboardData(selectedDate);
    }, [selectedDate]);

    const handleLogout = async () => {
        await logout();
        navigate(0);
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(parseFloat(amount.toString() || "0"));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAttendanceTypeLabel = (type: number) => {
        return type === 1 ? "Time In" : "Time Out";
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            case "info":
                return "bg-blue-50 border-blue-200 text-blue-800";
            default:
                return "bg-gray-50 border-gray-200 text-gray-800";
        }
    };

    const getTrendColor = (percentage: number) => {
        if (percentage > 0) return "text-green-600";
        if (percentage < 0) return "text-red-600";
        return "text-gray-600";
    };

    const getTrendIcon = (percentage: number) => {
        if (percentage > 0) {
            return (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 17l9.2-9.2M17 17V7h-10"
                    />
                </svg>
            );
        }
        if (percentage < 0) {
            return (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 7l-9.2 9.2M7 7v10h10"
                    />
                </svg>
            );
        }
        return (
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 12H4"
                />
            </svg>
        );
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
                headerTitle="Dashboard"
                headerRightContent={headerRightContent}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Loading dashboard...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout
                headerTitle="Dashboard"
                headerRightContent={headerRightContent}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="text-red-600">
                            <p className="text-lg font-semibold">
                                Error loading dashboard
                            </p>
                            <p className="mt-2">{error}</p>
                            <button
                                onClick={() => fetchDashboardData(selectedDate)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!dashboardData) return null;

    return (
        <Layout headerTitle="Dashboard" headerRightContent={headerRightContent}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-600">
                                Showing data for{" "}
                                {formatDate(
                                    dashboardData.date_info.target_date
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                                onClick={() => fetchDashboardData(selectedDate)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => deleteAllData()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete All Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {dashboardData.alerts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Alerts
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border ${getAlertColor(
                                        alert.type
                                    )}`}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium">
                                            {alert.message}
                                        </span>
                                        {alert.action_needed && (
                                            <span className="ml-2 px-2 py-1 bg-white rounded text-xs font-medium">
                                                Action Required
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Employees */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Total Employees
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        dashboardData.employee_overview
                                            .total_active_employees
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Attendance Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        dashboardData.attendance_summary
                                            .attendance_rate
                                    }
                                    %
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Payroll */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Monthly Payroll
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(
                                        dashboardData.payroll_metrics.metrics
                                            .total_gross_salary || 0
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Leaves */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Pending Leaves
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        dashboardData.leave_analytics
                                            .pending_approvals
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Attendance Summary */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Today's Attendance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Present Today
                                </span>
                                <span className="font-semibold">
                                    {
                                        dashboardData.attendance_summary
                                            .employees_present
                                    }{" "}
                                    /{" "}
                                    {
                                        dashboardData.attendance_summary
                                            .total_active_employees
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Time In Records
                                </span>
                                <span className="font-semibold">
                                    {
                                        dashboardData.attendance_summary
                                            .time_in_count
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Time Out Records
                                </span>
                                <span className="font-semibold">
                                    {
                                        dashboardData.attendance_summary
                                            .time_out_count
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Recent Attendance Records */}
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Recent Records
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {dashboardData.attendance_summary.records.map(
                                    (record) => (
                                        <div
                                            key={record.id}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span>
                                                {
                                                    record.employee.user
                                                        .first_name
                                                }{" "}
                                                {record.employee.user.last_name}
                                            </span>
                                            <div className="text-right">
                                                <div
                                                    className={`inline-block px-2 py-1 rounded text-xs ${
                                                        record.attendance_type ===
                                                        1
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {getAttendanceTypeLabel(
                                                        record.attendance_type
                                                    )}
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    {formatDateTime(
                                                        record.timestamp
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Financial Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Total Gross Salary
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(
                                        dashboardData.financial_summary
                                            .payroll_summary.total_gross || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Total Net Salary
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(
                                        dashboardData.financial_summary
                                            .payroll_summary.total_net || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Total Withholding Tax
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(
                                        dashboardData.financial_summary
                                            .payroll_summary.total_tax || 0
                                    )}
                                </span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Active Allowances
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            dashboardData.financial_summary
                                                .active_allowances_total
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Active Deductions
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            dashboardData.financial_summary
                                                .active_deductions_total
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Trends */}
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Month-over-Month Trends
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Payroll Growth
                                    </span>
                                    <div
                                        className={`flex items-center ${getTrendColor(
                                            dashboardData.trends.payroll_growth
                                                .percentage_change
                                        )}`}
                                    >
                                        {getTrendIcon(
                                            dashboardData.trends.payroll_growth
                                                .percentage_change
                                        )}
                                        <span className="ml-1 text-sm font-semibold">
                                            {
                                                dashboardData.trends
                                                    .payroll_growth
                                                    .percentage_change
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Payslip Count
                                    </span>
                                    <div
                                        className={`flex items-center ${getTrendColor(
                                            dashboardData.trends
                                                .payslip_count_change
                                                .percentage_change
                                        )}`}
                                    >
                                        {getTrendIcon(
                                            dashboardData.trends
                                                .payslip_count_change
                                                .percentage_change
                                        )}
                                        <span className="ml-1 text-sm font-semibold">
                                            {
                                                dashboardData.trends
                                                    .payslip_count_change
                                                    .percentage_change
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Payslips */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Payslips
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">
                                            Employee
                                        </th>
                                        <th className="text-right py-2">
                                            Net Salary
                                        </th>
                                        <th className="text-center py-2">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recent_payslips.map(
                                        (payslip) => (
                                            <tr
                                                key={payslip.id}
                                                className="border-b"
                                            >
                                                <td className="py-2">
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                payslip.employee_name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {payslip.pay_period}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right py-2 font-medium">
                                                    {formatCurrency(
                                                        payslip.net_salary
                                                    )}
                                                </td>
                                                <td className="text-center py-2">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                        {payslip.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Leaves */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Leave Requests
                        </h3>
                        <div className="space-y-3">
                            {dashboardData.leave_analytics.recent_leaves.map(
                                (leave, index) => (
                                    <div key={index} className="border-b pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {leave.employee_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {leave.leave_type}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(
                                                        leave.start_date
                                                    )}{" "}
                                                    -{" "}
                                                    {formatDate(leave.end_date)}
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    leave.is_approved
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {leave.is_approved
                                                    ? "Approved"
                                                    : "Pending"}
                                            </span>
                                        </div>
                                        {leave.details && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {leave.details}
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;
