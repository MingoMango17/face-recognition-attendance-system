import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

interface Employee {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        email?: string;
        username: string;
    };
    salary_type: 1 | 2;
    department: string;
    base_salary: string;
}

interface Allowance {
    id: number;
    value: string;
    description: string;
    allowance_type: number;
    is_taxable: boolean;
    is_active: boolean;
}

interface Deduction {
    id: number;
    value: string;
    deduction_type: number;
    is_active: boolean;
}

interface Leave {
    id: number;
    employee: number;
    leave_type: number;
    details: string;
    start_date: string;
    end_date: string;
    is_approved: boolean;
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
    withholding_tax: string; // Added withholding tax field
    status: 1 | 2 | 3 | 4 | 5;
    start_date: string;
    end_date: string;
    generated_at: string;
    approved_at?: string;
    pay_frequency?: "weekly" | "biweekly" | "semi_monthly" | "monthly";
}

interface PayslipViewerProps {
    payslip: Payslip;
    isOpen: boolean;
    onClose: () => void;
    onDownloadPDF: (data: {
        payslip: Payslip;
        allowances: Allowance[];
        deductions: Deduction[];
        leaves: Leave[];
    }) => void;
}

const PayslipViewer: React.FC<PayslipViewerProps> = ({
    payslip,
    isOpen,
    onClose,
    onDownloadPDF,
}) => {
    const [allowances, setAllowances] = useState<Allowance[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(false);

    const allowanceTypeNames = {
        0: "Meal Allowance",
        1: "Transportation Allowance",
        2: "Medical Allowance",
        3: "Bonus",
    };

    const deductionTypeNames = {
        0: "Loan",
        1: "Health Insurance",
        2: "Social Security",
        3: "Others",
    };

    const leaveTypeNames = {
        0: "Paid Leave",
        1: "Sick Leave",
        2: "Maternity Leave",
        3: "Leave Without Pay",
    };

    // Convert monthly amount to appropriate pay period amount
    const convertMonthlyToPayPeriod = (
        monthlyAmount: number,
        payFrequency?: string
    ): number => {
        const frequency = payFrequency || "monthly";

        switch (frequency) {
            case "weekly":
                // Monthly ÷ 4.33 weeks per month (52 weeks ÷ 12 months)
                return monthlyAmount / 4.33;
            case "biweekly":
                // Monthly ÷ 2.17 (26 pay periods ÷ 12 months)
                return monthlyAmount / 2.17;
            case "semi_monthly":
                // Paid twice per month (24 pay periods per year)
                return monthlyAmount / 2;
            default: // monthly
                return monthlyAmount;
        }
    };

    // Get prorated value for display
    const getProratedValue = (value: string): number => {
        const originalValue = parseFloat(value);
        return convertMonthlyToPayPeriod(originalValue, payslip.pay_frequency);
    };

    useEffect(() => {
        if (isOpen && payslip && payslip.employee && payslip.employee.id) {
            fetchAllowancesAndDeductions();
        }
    }, [isOpen, payslip]);

    const fetchAllowancesAndDeductions = async () => {
        if (!payslip || !payslip.employee || !payslip.employee.id) {
            console.error(
                "Cannot fetch allowances/deductions: Invalid payslip data"
            );
            return;
        }

        setLoading(true);
        try {
            const [allowancesResponse, deductionsResponse, leavesResponse] =
                await Promise.all([
                    api.get(
                        `payroll/allowances/?employee_id=${payslip.employee.id}`
                    ),
                    api.get(
                        `payroll/deductions/?employee_id=${payslip.employee.id}`
                    ),
                    api.get(
                        `payroll/leaves/?employee_id=${payslip.employee.id}&start_date=${payslip.start_date}&end_date=${payslip.end_date}`
                    ),
                ]);

            setAllowances(allowancesResponse.data || []);
            setDeductions(deductionsResponse.data || []);
            setLeaves(leavesResponse.data || []);
        } catch (error) {
            console.error(
                "Error fetching allowances, deductions, and leaves:",
                error
            );
            setAllowances([]);
            setDeductions([]);
            setLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    // Early return if no payslip or modal is closed
    if (!isOpen || !payslip) return null;

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

    const getStatusLabel = (status: number) => {
        const statusMap = {
            1: "Draft",
            2: "Generated",
            3: "Approved",
            4: "Paid",
            5: "Cancelled",
        };
        return statusMap[status as keyof typeof statusMap] || "Unknown";
    };

    const getPayFrequencyLabel = (frequency?: string) => {
        const frequencyMap = {
            weekly: "Weekly",
            biweekly: "Bi-weekly",
            semi_monthly: "Semi-monthly",
            monthly: "Monthly",
        };
        return (
            frequencyMap[frequency as keyof typeof frequencyMap] || "Monthly"
        );
    };

    // Calculate breakdown based on available data
    const baseSalary = parseFloat(payslip.employee.base_salary);
    const grossSalary = parseFloat(payslip.gross_salary);
    const netSalary = parseFloat(payslip.net_salary);
    const withholdingTax = parseFloat(payslip.withholding_tax || "0");

    // Calculate base pay
    let calculatedBasePay = 0;
    if (payslip.employee.salary_type === 1) {
        // Hourly
        calculatedBasePay =
            baseSalary * parseFloat(payslip.regular_hours.toString());
    } else {
        // Monthly
        const daysRatio = payslip.days_worked / payslip.total_working_days;
        if (payslip.pay_frequency === "weekly") {
            calculatedBasePay = (baseSalary / 4.33) * daysRatio;
        } else if (payslip.pay_frequency === "biweekly") {
            calculatedBasePay = (baseSalary / 2.17) * daysRatio;
        } else if (payslip.pay_frequency === "semi_monthly") {
            calculatedBasePay = (baseSalary / 4.33) * daysRatio;
        } else {
            calculatedBasePay = baseSalary * daysRatio;
        }
    }

    // Calculate totals from actual allowances and deductions (using prorated values)
    const totalAllowances = allowances.reduce(
        (sum, allowance) => sum + getProratedValue(allowance.value),
        0
    );

    const totalDeductions = deductions.reduce(
        (sum, deduction) => sum + getProratedValue(deduction.value),
        0
    );

    // Calculate total deductions including withholding tax
    const totalAllDeductions = totalDeductions + withholdingTax;

    // Calculate paid leave compensation
    const calculateLeaveCompensation = () => {
        const dailyRate =
            payslip.employee.salary_type === 1
                ? parseFloat(payslip.employee.base_salary) * 8 // Assuming 8 hours per day for hourly
                : parseFloat(payslip.employee.base_salary) /
                  payslip.total_working_days; // Daily rate for monthly

        let totalLeaveCompensation = 0;

        leaves.forEach((leave) => {
            if (leave.is_approved && [0, 1].includes(leave.leave_type)) {
                // Paid Leave (0) or Sick Leave (1)
                const leaveStart = new Date(
                    Math.max(
                        new Date(leave.start_date).getTime(),
                        new Date(payslip.start_date).getTime()
                    )
                );
                const leaveEnd = new Date(
                    Math.min(
                        new Date(leave.end_date).getTime(),
                        new Date(payslip.end_date).getTime()
                    )
                );

                if (leaveStart <= leaveEnd) {
                    const leaveDays =
                        Math.ceil(
                            (leaveEnd.getTime() - leaveStart.getTime()) /
                                (1000 * 60 * 60 * 24)
                        ) + 1;
                    const compensationRate = leave.leave_type === 1 ? 0.5 : 1.0; // Sick leave at 50%, paid leave at 100%
                    totalLeaveCompensation +=
                        leaveDays * dailyRate * compensationRate;
                }
            }
        });

        return totalLeaveCompensation;
    };

    const leaveCompensation = calculateLeaveCompensation();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Payslip Preview
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                onDownloadPDF({
                                    payslip: payslip,
                                    allowances: allowances,
                                    deductions: deductions,
                                    leaves: leaves,
                                })
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Download PDF
                        </button>
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
                </div>

                {/* Payslip Content */}
                <div id="payslip-content" className="p-8 bg-white">
                    {/* Company Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Payslip
                        </h1>
                        <div className="text-lg text-gray-600">
                            <strong>Pay Period:</strong>{" "}
                            {formatDate(payslip.start_date)} -{" "}
                            {formatDate(payslip.end_date)}
                        </div>
                        {payslip.pay_frequency && (
                            <div className="text-sm text-gray-500 mt-1">
                                <strong>Pay Frequency:</strong>{" "}
                                {getPayFrequencyLabel(payslip.pay_frequency)}
                            </div>
                        )}
                    </div>

                    {/* Employee Information */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                            <div>
                                <span className="font-semibold text-gray-700">
                                    Employee Name:
                                </span>
                                <span className="ml-2 text-gray-900">
                                    {payslip.employee.user.first_name}{" "}
                                    {payslip.employee.user.last_name}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">
                                    Pay Type:
                                </span>
                                <span className="ml-2 text-gray-900">
                                    {payslip.employee.salary_type === 1
                                        ? "Hourly"
                                        : "Monthly"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="font-semibold text-gray-700">
                                    Status:
                                </span>
                                <span className="ml-2 text-gray-900">
                                    {getStatusLabel(payslip.status)}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">
                                    Generated:
                                </span>
                                <span className="ml-2 text-gray-900">
                                    {formatDate(payslip.generated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Attendance Summary
                        </h3>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">
                                    Total Working Days:
                                </span>
                                <div className="text-lg font-semibold text-gray-900">
                                    {payslip.total_working_days}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Days Worked:
                                </span>
                                <div className="text-lg font-semibold text-gray-900">
                                    {payslip.days_worked}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Total Hours:
                                </span>
                                <div className="text-lg font-semibold text-gray-900">
                                    {payslip.total_hours}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Regular Hours:
                                </span>
                                <div className="text-lg font-semibold text-gray-900">
                                    {payslip.regular_hours}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings and Deductions Table */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Earnings */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                Earnings
                            </h3>
                            <table className="w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                                            Description
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-700">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                            Base Salary
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                            {formatCurrency(calculatedBasePay)}
                                        </td>
                                    </tr>
                                    {leaveCompensation > 0 && (
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                Paid Leave Compensation
                                                <div className="text-xs text-gray-500">
                                                    {
                                                        leaves.filter(
                                                            (l) =>
                                                                l.is_approved &&
                                                                [0, 1].includes(
                                                                    l.leave_type
                                                                )
                                                        ).length
                                                    }{" "}
                                                    leave(s) applied
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                                {formatCurrency(
                                                    leaveCompensation
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                                            >
                                                Loading allowances...
                                            </td>
                                        </tr>
                                    ) : allowances.length > 0 ? (
                                        allowances.map((allowance) => {
                                            const originalValue = parseFloat(
                                                allowance.value
                                            );
                                            const proratedValue =
                                                getProratedValue(
                                                    allowance.value
                                                );
                                            const isProrated =
                                                payslip.pay_frequency &&
                                                payslip.pay_frequency !==
                                                    "monthly";

                                            return (
                                                <tr key={allowance.id}>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                        {allowance.description ||
                                                            allowanceTypeNames[
                                                                allowance.allowance_type as keyof typeof allowanceTypeNames
                                                            ]}
                                                        {allowance.is_taxable && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                (Taxable)
                                                            </span>
                                                        )}
                                                        {isProrated && (
                                                            <div className="text-xs text-blue-600">
                                                                Monthly:{" "}
                                                                {formatCurrency(
                                                                    originalValue
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                                        {formatCurrency(
                                                            proratedValue
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-500 italic">
                                                No allowances
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right text-gray-500">
                                                {formatCurrency(0)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                            Gross Salary
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                            {formatCurrency(
                                                payslip.gross_salary
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                Deductions
                            </h3>
                            <table className="w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                                            Description
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-700">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Withholding Tax - Always show first */}
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                            Withholding Tax
                                            <div className="text-xs text-red-600">
                                                Philippine Income Tax
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                            {formatCurrency(withholdingTax)}
                                        </td>
                                    </tr>

                                    {/* Regular Deductions */}
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                                            >
                                                Loading deductions...
                                            </td>
                                        </tr>
                                    ) : deductions.length > 0 ? (
                                        deductions.map((deduction) => {
                                            const originalValue = parseFloat(
                                                deduction.value
                                            );
                                            const proratedValue =
                                                getProratedValue(
                                                    deduction.value
                                                );
                                            const isProrated =
                                                payslip.pay_frequency &&
                                                payslip.pay_frequency !==
                                                    "monthly";

                                            return (
                                                <tr key={deduction.id}>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                        {
                                                            deductionTypeNames[
                                                                deduction.deduction_type as keyof typeof deductionTypeNames
                                                            ]
                                                        }
                                                        {isProrated && (
                                                            <div className="text-xs text-blue-600">
                                                                Monthly:{" "}
                                                                {formatCurrency(
                                                                    originalValue
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                                        {formatCurrency(
                                                            proratedValue
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-500 italic">
                                                No other deductions
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right text-gray-500">
                                                {formatCurrency(0)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                            Total Deductions
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-right text-gray-900">
                                            {formatCurrency(totalAllDeductions)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Net Pay */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-green-800">
                                Net Pay
                            </h3>
                            <div className="text-2xl font-bold text-green-800">
                                {formatCurrency(payslip.net_salary)}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                        <p>
                            This payslip is computer generated and does not
                            require a signature.
                        </p>
                        <p>Generated on {formatDate(payslip.generated_at)}</p>
                        {payslip.pay_frequency &&
                            payslip.pay_frequency !== "monthly" && (
                                <p className="text-blue-600 mt-2">
                                    * Allowances and deductions have been
                                    prorated based on{" "}
                                    {getPayFrequencyLabel(
                                        payslip.pay_frequency
                                    ).toLowerCase()}{" "}
                                    pay frequency
                                </p>
                            )}
                        <p className="text-red-600 mt-2">
                            * Withholding tax calculated based on Philippine
                            Income Tax Law
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipViewer;
