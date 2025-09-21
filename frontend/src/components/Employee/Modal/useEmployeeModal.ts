import { useState, useEffect } from "react";
import { api } from "../../../utils/api";

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    username: string;
    department?: string;
    password: string;
    salary: string;
    salary_type: "hourly" | "monthly";
    deductions: Array<{ type: number; amount: string }>;
    allowances: Array<{ type: number; amount: string; taxable: boolean }>;
}

interface Employee {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        username: string;
    };
    salary_type: 1 | 2;
    hire_date: string;
    base_salary: string;
    department: string;
    details: string;
    is_active: boolean;
}

interface UseEmployeeModalProps {
    mode: "add" | "edit";
    employee?: Employee | null;
    isOpen: boolean;
}

const deductionTypes = ["Loan", "Health Insurance", "Social Security", "Other"];
const allowanceTypes = ["Meal", "Transportation", "Medical", "Bonus"];

export const useEmployeeModal = ({
    mode,
    employee,
    isOpen,
}: UseEmployeeModalProps) => {
    const [formData, setFormData] = useState<EmployeeFormData>({
        first_name: "",
        last_name: "",
        username: "",
        department: "",
        password: "",
        salary: "",
        salary_type: "monthly",
        deductions: [],
        allowances: [],
    });

    const [loading, setLoading] = useState(false);

    const resetFormData = () => {
        setFormData({
            first_name: "",
            last_name: "",
            username: "",
            department: "",
            password: "",
            salary: "",
            salary_type: "monthly",
            deductions: [],
            allowances: [],
        });
    };

    const initializeFormData = async () => {
        if (mode === "edit" && employee) {
            setLoading(true);

            // Set basic employee data first
            setFormData({
                first_name: employee.user.first_name,
                last_name: employee.user.last_name,
                username: employee.user.username,
                department: employee.department,
                password: "", // Don't populate password for security
                salary: employee.base_salary,
                salary_type: employee.salary_type === 1 ? "hourly" : "monthly",
                deductions: [],
                allowances: [],
            });

            try {
                // Fetch deductions for this employee
                const deductionsResponse = await api.get(
                    "payroll/deductions/",
                    {
                        params: {
                            employee_id: employee.id,
                        },
                    }
                );

                // Transform the API response to match your form structure
                const formattedDeductions = deductionsResponse.data.map(
                    (deduction: any) => {
                        return {
                            type: deduction.deduction_type,
                            amount: deduction.value?.toString() || "0",
                        };
                    }
                );

                setFormData((prev) => ({
                    ...prev,
                    deductions: formattedDeductions,
                }));

                const allowancesResponse = await api.get(
                    "payroll/allowances/",
                    {
                        params: { employee_id: employee.id },
                    }
                );

                const formattedAllowances = allowancesResponse.data.map(
                    (allowance: any) => ({
                        type:
                            allowance.type ||
                            allowance.allowance_type ||
                            "0",
                        amount: allowance.value?.toString() || "0",
                        taxable: allowance.taxable || true,
                    })
                );

                setFormData((prev) => ({
                    ...prev,
                    allowances: formattedAllowances,
                }));
            } catch (error) {
                console.error("Error fetching employee data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            resetFormData();
        }
    };

    useEffect(() => {
        if (isOpen) {
            initializeFormData();
        }
    }, [mode, employee, isOpen]);

    const handleChange = (field: keyof EmployeeFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addDeduction = () => {
        setFormData((prev) => ({
            ...prev,
            deductions: [...prev.deductions, { type: 0, amount: "0" }],
        }));
    };

    const updateDeduction = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            deductions: prev.deductions.map((item, i) => {
                if (i === index) {
                    if (field === "type") {
                        const typeIndex = deductionTypes.indexOf(value);
                        return {
                            ...item,
                            [field]: typeIndex !== -1 ? typeIndex : value,
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            }),
        }));
    };

    const removeDeduction = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deductions: prev.deductions.filter((_, i) => i !== index),
        }));
    };

    const addAllowance = () => {
        setFormData((prev) => ({
            ...prev,
            allowances: [
                ...prev.allowances,
                { type: 0, amount: "0", taxable: true },
            ],
        }));
    };

    const updateAllowance = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            allowances: prev.allowances.map((item, i) => {
                if (i === index) {
                    if (field === "type") {
                        const typeIndex = allowanceTypes.indexOf(value);
                        return {
                            ...item,
                            [field]: typeIndex !== -1 ? typeIndex : value,
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            }),
        }));
    };

    const removeAllowance = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index),
        }));
    };

    return {
        formData,
        loading,
        handleChange,
        resetFormData,
        // Deduction handlers
        addDeduction,
        updateDeduction,
        removeDeduction,
        // Allowance handlers
        addAllowance,
        updateAllowance,
        removeAllowance,
    };
};
