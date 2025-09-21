import React, { useState, useEffect } from "react";

interface Employee {
    id: number;
    user: {
        first_name: string;
        last_name: string;
    };
    department: string;
    is_active: boolean;
}

interface Payslip {
    id: number;
    employee: Employee;
    total_working_days: number;
    days_worked: number;
    start_date: string;
    end_date: string;
}

interface PayslipFormData {
    employee_ids: number[];
    start_date: string;
    end_date: string;
    total_working_days: number;
    auto_calculate_attendance?: boolean;
    pay_frequency: string;
}

interface BulkPayslipFormData {
    start_date: string;
    end_date: string;
    total_working_days: number;
    department?: string;
    employee_ids?: number[];
    auto_calculate_attendance?: boolean;
    pay_frequency: string;
}

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PayslipFormData | BulkPayslipFormData) => void;
    payslip?: Payslip | null;
    employees: Employee[];
    mode: "generate" | "bulk" | "edit";
}

type PeriodType = "custom" | "weekly" | "biweekly" | "monthly";

const PayslipModal: React.FC<PayslipModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    payslip,
    employees,
    mode,
}) => {
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalWorkingDays, setTotalWorkingDays] = useState(22);
    const [autoCalculateAttendance, setAutoCalculateAttendance] =
        useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectAllEmployees, setSelectAllEmployees] = useState(false);
    const [periodType, setPeriodType] = useState<PeriodType>("monthly");
    const [weekOffset, setWeekOffset] = useState(0); // For navigating weeks/periods

    // Get active employees
    const activeEmployees = employees.filter((emp) => emp.is_active);

    // Get unique departments
    const departments = Array.from(
        new Set(activeEmployees.map((emp) => emp.department).filter(Boolean))
    ).sort();

    // Filter employees by department - use useMemo to prevent recreation on every render
    const filteredEmployees = React.useMemo(() => {
        return selectedDepartment
            ? activeEmployees.filter(
                  (emp) => emp.department === selectedDepartment
              )
            : activeEmployees;
    }, [selectedDepartment, activeEmployees]);

    const calculatePeriodDates = (type: PeriodType, offset: number = 0) => {
        let start: Date;
        let end: Date;

        // Helper function to format date as YYYY-MM-DD in local timezone
        const formatLocalDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        switch (type) {
            case "weekly":
                // Get current date and find Monday of current week
                const now = new Date();
                const dayOfWeek = now.getDay();
                const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                start = new Date(now);
                start.setDate(now.getDate() + daysToMonday + offset * 7);
                end = new Date(start);
                end.setDate(start.getDate() + 6); // Sunday
                break;

            case "biweekly":
                // Get current biweek start and add offset biweeks
                const currentDate = new Date();
                const currentWeekStart = new Date(currentDate);
                const currentDayOfWeek = currentDate.getDay();
                const daysToCurrentMonday =
                    currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
                currentWeekStart.setDate(
                    currentDate.getDate() + daysToCurrentMonday
                );

                // Determine if we're in the first or second week of the biweek period
                const weekNumber = Math.floor(
                    currentWeekStart.getTime() / (7 * 24 * 60 * 60 * 1000)
                );
                const isSecondWeek = weekNumber % 2;

                start = new Date(currentWeekStart);
                if (isSecondWeek) {
                    start.setDate(currentWeekStart.getDate() - 7); // Go to first week of biweek
                }
                start.setDate(start.getDate() + offset * 14); // Add offset biweeks

                end = new Date(start);
                end.setDate(start.getDate() + 13); // 14 days total
                break;

            case "monthly":
                // Use current date as reference
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth(); // 0-based (0=Jan, 11=Dec)


                // Calculate target month with offset
                const targetDate = new Date(
                    currentYear,
                    currentMonth + offset, // Fixed: should use offset here
                    1
                );

                // First day of target month
                start = new Date(
                    targetDate.getFullYear(),
                    targetDate.getMonth(),
                    1
                );

                // Last day of target month
                end = new Date(
                    targetDate.getFullYear(),
                    targetDate.getMonth() + 1,
                    0
                );
                break;

            default:
                return null;
        }

        return {
            start: formatLocalDate(start),
            end: formatLocalDate(end),
        };
    };

    const updateDatesForPeriod = (type: PeriodType, offset: number = 0) => {
        if (type === "custom") return;

        const dates = calculatePeriodDates(type, offset);
        if (dates) {
            setStartDate(dates.start);
            setEndDate(dates.end);
        }
    };

    const getPeriodLabel = (type: PeriodType, offset: number = 0) => {
        if (type === "custom") return "Custom Range";

        const dates = calculatePeriodDates(type, offset);
        if (!dates) return "";

        const startDate = new Date(dates.start);
        const endDate = new Date(dates.end);

        const formatOptions: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
        };

        if (startDate.getFullYear() !== endDate.getFullYear()) {
            formatOptions.year = "numeric";
        }

        switch (type) {
            case "weekly":
                return `Week of ${startDate.toLocaleDateString(
                    "en-US",
                    formatOptions
                )}`;
            case "biweekly":
                return `${startDate.toLocaleDateString(
                    "en-US",
                    formatOptions
                )} - ${endDate.toLocaleDateString("en-US", formatOptions)}`;
            case "monthly":
                return startDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                });
            default:
                return "";
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && payslip) {
                setSelectedEmployees([payslip.employee.id]);
                setStartDate(payslip.start_date);
                setEndDate(payslip.end_date);
                setTotalWorkingDays(payslip.total_working_days);
                setPeriodType("custom"); // Edit mode uses custom dates
                setWeekOffset(0);
            } else {
                // Reset form for new generation
                setSelectedEmployees([]);
                setSelectedDepartment("");
                setSelectAllEmployees(false);
                setAutoCalculateAttendance(true);
                setPeriodType("monthly");
                setWeekOffset(0);

                // Set default to current month
                updateDatesForPeriod("monthly", 0);
            }
        }
    }, [isOpen, mode, payslip]);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            setTotalWorkingDays(calculateWorkingDays(start, end));
        }
    }, [startDate, endDate]);

    // Update dates when period type or offset changes
    useEffect(() => {
        updateDatesForPeriod(periodType, weekOffset);
    }, [periodType, weekOffset]);

    // Handle select all employees - separate useEffect with proper dependencies
    useEffect(() => {
        if (selectAllEmployees && filteredEmployees.length > 0) {
            const newSelectedIds = filteredEmployees.map((emp) => emp.id);
            setSelectedEmployees((prev) => {
                // Only update if the arrays are actually different
                if (
                    prev.length !== newSelectedIds.length ||
                    !prev.every((id) => newSelectedIds.includes(id))
                ) {
                    return newSelectedIds;
                }
                return prev;
            });
        } else if (!selectAllEmployees) {
            setSelectedEmployees((prev) => (prev.length > 0 ? [] : prev));
        }
    }, [selectAllEmployees, filteredEmployees.length]);

    // Handle department change - clear selected employees when department changes
    useEffect(() => {
        if (mode !== "edit") {
            setSelectedEmployees([]);
            setSelectAllEmployees(false);
        }
    }, [selectedDepartment, mode]);

    const calculateWorkingDays = (start: Date, end: Date): number => {
        let workingDays = 0;
        const current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Not Sunday (0) or Saturday (6)
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }

        return workingDays;
    };

    const handleEmployeeToggle = (employeeId: number) => {
        setSelectedEmployees((prev) => {
            if (prev.includes(employeeId)) {
                return prev.filter((id) => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handlePeriodTypeChange = (type: PeriodType) => {
        setPeriodType(type);
        if (type !== "custom") {
            setWeekOffset(0); // Reset to current period
        }
    };

    const navigatePeriod = (direction: 1 | -1) => {
        setWeekOffset((prev) => prev + direction);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "bulk") {
            const data: BulkPayslipFormData = {
                start_date: startDate,
                end_date: endDate,
                total_working_days: totalWorkingDays,
                auto_calculate_attendance: autoCalculateAttendance,
                pay_frequency: periodType,
                ...(selectedDepartment && { department: selectedDepartment }),
                ...(selectedEmployees.length > 0 && {
                    employee_ids: selectedEmployees,
                }),
            };
            onSubmit(data);
        } else {
            const data: PayslipFormData = {
                employee_ids: selectedEmployees,
                start_date: startDate,
                end_date: endDate,
                total_working_days: totalWorkingDays,
                auto_calculate_attendance: autoCalculateAttendance,
                pay_frequency: periodType,
            };
            onSubmit(data);
        }

        onClose();
    };

    if (!isOpen) return null;

    const getModalTitle = () => {
        switch (mode) {
            case "generate":
                return "Generate Payslips";
            case "bulk":
                return "Bulk Generate Payslips";
            case "edit":
                return "Edit Payslip";
            default:
                return "Payslip";
        }
    };

    const isFormValid = () => {
        if (!startDate || !endDate || totalWorkingDays <= 0) return false;

        if (mode === "bulk") {
            return selectedDepartment || selectedEmployees.length > 0;
        }

        return selectedEmployees.length > 0;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {getModalTitle()}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Period Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Payroll Period
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {(
                                [
                                    { value: "weekly", label: "Weekly" },
                                    { value: "biweekly", label: "Bi-weekly" },
                                    { value: "monthly", label: "Monthly" },
                                    // { value: "custom", label: "Custom Range" },
                                ] as const
                            ).map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name="periodType"
                                        value={option.value}
                                        checked={periodType === option.value}
                                        onChange={() =>
                                            handlePeriodTypeChange(option.value)
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Period Navigation */}
                        {periodType !== "custom" && (
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => navigatePeriod(-1)}
                                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                    Previous
                                </button>

                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-900">
                                        {getPeriodLabel(periodType, weekOffset)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {startDate &&
                                            endDate &&
                                            `${startDate} to ${endDate}`}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigatePeriod(1)}
                                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                                >
                                    Next
                                    <svg
                                        className="w-4 h-4 ml-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Custom Date Selection */}
                    {periodType === "custom" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Working Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Working Days
                        </label>
                        <input
                            type="number"
                            value={totalWorkingDays}
                            onChange={(e) =>
                                setTotalWorkingDays(
                                    parseInt(e.target.value) || 0
                                )
                            }
                            min="1"
                            max="31"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Automatically calculated based on selected period
                            (excluding weekends)
                        </p>
                    </div>

                    {/* Auto Calculate Attendance */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="autoCalculate"
                            checked={autoCalculateAttendance}
                            onChange={(e) =>
                                setAutoCalculateAttendance(e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="autoCalculate"
                            className="ml-2 text-sm text-gray-700"
                        >
                            Auto-calculate attendance from time tracking records
                        </label>
                    </div>

                    {/* Department Filter (for bulk mode) */}
                    {mode === "bulk" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department (Optional)
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) =>
                                    setSelectedDepartment(e.target.value)
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
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to generate for all employees, or
                                select specific employees below
                            </p>
                        </div>
                    )}

                    {/* Employee Selection */}
                    {mode !== "edit" && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Employees
                                    {mode === "bulk" &&
                                        selectedDepartment &&
                                        " (Optional for bulk)"}
                                </label>
                                {mode !== "bulk" && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="selectAll"
                                            checked={selectAllEmployees}
                                            onChange={(e) =>
                                                setSelectAllEmployees(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="selectAll"
                                            className="ml-2 text-sm text-gray-600"
                                        >
                                            Select All
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                {filteredEmployees.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        No active employees found
                                        {selectedDepartment &&
                                            ` in ${selectedDepartment} department`}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {filteredEmployees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                className="flex items-center p-3 hover:bg-gray-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`employee-${employee.id}`}
                                                    checked={selectedEmployees.includes(
                                                        employee.id
                                                    )}
                                                    onChange={() =>
                                                        handleEmployeeToggle(
                                                            employee.id
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`employee-${employee.id}`}
                                                    className="ml-3 flex-1 cursor-pointer"
                                                >
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {
                                                            employee.user
                                                                .first_name
                                                        }{" "}
                                                        {
                                                            employee.user
                                                                .last_name
                                                        }
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {mode !== "bulk" &&
                                selectedEmployees.length > 0 && (
                                    <p className="text-sm text-blue-600 mt-2">
                                        {selectedEmployees.length} employee(s)
                                        selected
                                    </p>
                                )}

                            {mode === "bulk" && (
                                <p className="text-xs text-gray-500 mt-2">
                                    {selectedEmployees.length > 0
                                        ? `${selectedEmployees.length} specific employee(s) selected`
                                        : selectedDepartment
                                        ? `Will generate for all employees in ${selectedDepartment} department`
                                        : "Will generate for all active employees"}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isFormValid()
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {mode === "edit"
                                ? "Update Payslip"
                                : "Generate Payslips"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayslipModal;
