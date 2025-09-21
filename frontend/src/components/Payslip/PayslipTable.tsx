import React from "react";

interface Employee {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        email?: string;
    };
    department: string;
}

interface Payslip {
    id: number;
    employee: Employee;
    total_working_days: number;
    days_worked: number;
    total_hours: number;
    regular_hours: number;
    gross_salary: string;
    net_salary: string;
    status: 1 | 2 | 3 | 4 | 5;
    start_date: string;
    end_date: string;
    generated_at: string;
    approved_at?: string;
}

interface StatusOption {
    value: number;
    label: string;
    color: string;
}

interface PayslipTableProps {
    payslips: Payslip[];
    loading: boolean;
    onViewPayslip: (payslip: Payslip) => void;
    onEditPayslip: (payslip: Payslip) => void;
    onDeletePayslip: (payslip: Payslip) => void;
    onUpdateStatus: (payslip: Payslip, newStatus: number) => void;
    statusOptions: StatusOption[];
}

const PayslipTable: React.FC<PayslipTableProps> = ({
    payslips,
    loading,
    onViewPayslip,
    onEditPayslip,
    onDeletePayslip,
    onUpdateStatus,
    statusOptions,
}) => {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(parseFloat(amount || "0"));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: number) => {
        const statusOption = statusOptions.find((opt) => opt.value === status);
        if (!statusOption) return null;

        const colorClasses = {
            gray: "bg-gray-100 text-gray-800",
            blue: "bg-blue-100 text-blue-800",
            green: "bg-green-100 text-green-800",
            purple: "bg-purple-100 text-purple-800",
            red: "bg-red-100 text-red-800",
        };

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                    colorClasses[
                        statusOption.color as keyof typeof colorClasses
                    ]
                }`}
            >
                {statusOption.label}
            </span>
        );
    };

    const canUpdateStatus = (currentStatus: number, newStatus: number) => {
        // Define allowed status transitions
        const allowedTransitions: { [key: number]: number[] } = {
            1: [2], // Draft -> Generated
            2: [3, 5], // Generated -> Approved, Cancelled
            3: [4, 5], // Approved -> Paid, Cancelled
            4: [], // Paid -> No transitions
            5: [], // Cancelled -> No transitions
        };

        return allowedTransitions[currentStatus]?.includes(newStatus) || false;
    };

    const getNextStatusOptions = (currentStatus: number) => {
        return statusOptions.filter((option) =>
            canUpdateStatus(currentStatus, option.value)
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (payslips.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg
                        className="w-full h-full"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payslips found
                </h3>
                <p className="text-gray-500 mb-4">
                    Get started by generating payslips for your employees.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Days Worked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gross Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Generated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payslips.map((payslip) => (
                        <tr key={payslip.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {payslip.employee.user.first_name}{" "}
                                        {payslip.employee.user.last_name}
                                    </div>
                                    {/* <div className="text-sm text-gray-500">
                                        {payslip.employee.department}
                                    </div> */}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatDate(payslip.start_date)} -{" "}
                                    {formatDate(payslip.end_date)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {payslip.days_worked} /{" "}
                                    {payslip.total_working_days}
                                </div>
                                {payslip.total_hours > 0 && (
                                    <div className="text-xs text-gray-500">
                                        {payslip.total_hours} hours
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(payslip.gross_salary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(payslip.net_salary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(payslip.status)}
                                    {getNextStatusOptions(payslip.status)
                                        .length > 0 && (
                                        <div className="relative group">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                {getNextStatusOptions(
                                                    payslip.status
                                                ).map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() =>
                                                            onUpdateStatus(
                                                                payslip,
                                                                option.value
                                                            )
                                                        }
                                                        className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payslip.generated_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onViewPayslip(payslip)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                        title="View Payslip"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </button>

                                    {/* {payslip.status === 1 && (
                                        <button
                                            onClick={() =>
                                                onEditPayslip(payslip)
                                            }
                                            className="text-green-600 hover:text-green-900 transition-colors"
                                            title="Edit Payslip"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                    )} */}

                                    {[1, 2].includes(payslip.status) && (
                                        <button
                                            onClick={() =>
                                                onDeletePayslip(payslip)
                                            }
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete Payslip"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PayslipTable;
