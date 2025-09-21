import React from "react";

interface Employee {
    id: number;
    user: {
        first_name: string;
        last_name: string;
    };
    department: string;
}

interface Payslip {
    id: number;
    employee: Employee;
    start_date: string;
    end_date: string;
}

interface PayslipFilters {
    status: string;
    department: string;
    employee: string;
    period: string;
}

interface PayslipSearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filters: PayslipFilters;
    onFiltersChange: (filters: PayslipFilters) => void;
    employees: Employee[];
    payslips: Payslip[];
    showFilters: boolean;
    onToggleFilters: (show: boolean) => void;
}

const PayslipSearchBar: React.FC<PayslipSearchBarProps> = ({
    searchTerm,
    onSearchChange,
    filters,
    onFiltersChange,
    employees,
    payslips,
    showFilters,
    onToggleFilters,
}) => {
    const statusOptions = [
        { value: "1", label: "Draft" },
        { value: "2", label: "Generated" },
        { value: "3", label: "Approved" },
        { value: "4", label: "Paid" },
        { value: "5", label: "Cancelled" },
    ];

    // Get unique departments
    const departments = Array.from(
        new Set(employees.map((emp) => emp.department).filter(Boolean))
    ).sort();

    // Get unique periods (YYYY-MM format)
    const periods = Array.from(
        new Set(
            payslips
                .map((payslip) => payslip.start_date.substring(0, 7))
                .filter(Boolean)
        )
    )
        .sort()
        .reverse();

    const handleFilterChange = (key: keyof PayslipFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: "",
            department: "",
            employee: "",
            period: "",
        });
    };

    const hasActiveFilters = Object.values(filters).some(
        (filter) => filter !== ""
    );

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search payslips by employee name"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}

                    <button
                        onClick={() => onToggleFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            showFilters
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
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
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                            />
                        </svg>
                        Filters
                        {hasActiveFilters && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                {
                                    Object.values(filters).filter(
                                        (f) => f !== ""
                                    ).length
                                }
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Department Filter */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                value={filters.department}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "department",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* Employee Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee
                            </label>
                            <select
                                value={filters.employee}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "employee",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Employees</option>
                                {employees.map((emp) => (
                                    <option
                                        key={emp.id}
                                        value={emp.id.toString()}
                                    >
                                        {emp.user.first_name}{" "}
                                        {emp.user.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Period Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Period
                            </label>
                            <select
                                value={filters.period}
                                onChange={(e) =>
                                    handleFilterChange("period", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Periods</option>
                                {periods.map((period) => (
                                    <option key={period} value={period}>
                                        {new Date(
                                            period + "-01"
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayslipSearchBar;
