import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    password: string;
    salary: string;
    salary_type: "hourly" | "monthly";
    deductions: Array<{ type: string; amount: string }>;
    allowances: Array<{ type: string; amount: string; taxable: boolean }>;
}

interface Employee {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        username: string;
    };
    salary_type: 1 | 2; // 1 = HOURLY, 2 = MONTHLY
    hire_date: string;
    base_salary: string;
    department: string;
    details: string;
    is_active: boolean;
}

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeFormData) => void;
    employee?: Employee | null; // Optional employee for editing
    mode: "add" | "edit";
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    employee,
    mode,
}) => {
    const [formData, setFormData] = useState<EmployeeFormData>({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        password: "",
        salary: "",
        salary_type: "monthly",
        deductions: [],
        allowances: [],
    });

    const departments = ["Engineering", "Marketing", "HR", "Finance", "Sales"];
    const deductionTypes = [
        "Tax",
        "Health Insurance",
        "Social Security",
        "Other",
    ];
    const allowanceTypes = ["Meal", "Transportation", "Medical", "Bonus"];

    // Initialize form data when employee prop changes (for edit mode)
    useEffect(() => {
        if (mode === "edit" && employee) {
            setFormData({
                first_name: employee.user.first_name,
                last_name: employee.user.last_name,
                email: employee.user.email,
                department: employee.department,
                password: "", // Don't populate password for security
                salary: employee.base_salary,
                salary_type: employee.salary_type === 1 ? "hourly" : "monthly",
                deductions: [], // You might want to fetch these from API
                allowances: [], // You might want to fetch these from API
            });
        } else {
            // Reset form for add mode
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                department: "",
                password: "",
                salary: "",
                salary_type: "monthly",
                deductions: [],
                allowances: [],
            });
        }
    }, [mode, employee, isOpen]);

    const handleChange = (field: keyof EmployeeFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addDeduction = () => {
        setFormData((prev) => ({
            ...prev,
            deductions: [...prev.deductions, { type: "Tax", amount: "0" }],
        }));
    };

    const updateDeduction = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            deductions: prev.deductions.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
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
                { type: "Meal", amount: "0", taxable: true },
            ],
        }));
    };

    const updateAllowance = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            allowances: prev.allowances.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const removeAllowance = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
        if (mode === "add") {
            // Reset form only for add mode
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                department: "",
                password: "",
                salary: "",
                salary_type: "monthly",
                deductions: [],
                allowances: [],
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    const modalTitle = mode === "add" ? "Add New Employee" : "Edit Employee";
    const submitButtonText =
        mode === "add" ? "Add Employee" : "Update Employee";

    return (
        <div className="text-black fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">{modalTitle}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) =>
                                    handleChange("first_name", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) =>
                                    handleChange("last_name", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Department
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) =>
                                    handleChange("department", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Password field - only show for add mode or if user wants to change password */}
                        {mode === "add" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}
                        {mode === "edit" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    New Password (optional)
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Salary Type *
                            </label>
                            <select
                                value={formData.salary_type}
                                onChange={(e) =>
                                    handleChange(
                                        "salary_type",
                                        e.target.value as "hourly" | "monthly"
                                    )
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Salary *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.salary}
                                onChange={(e) =>
                                    handleChange("salary", e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder={
                                    formData.salary_type === "hourly"
                                        ? "Per hour"
                                        : "Monthly amount"
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">Deductions</h3>
                            <button
                                type="button"
                                onClick={addDeduction}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </div>
                        {formData.deductions.map((deduction, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2 mb-2"
                            >
                                <select
                                    value={deduction.type}
                                    onChange={(e) =>
                                        updateDeduction(
                                            index,
                                            "type",
                                            e.target.value
                                        )
                                    }
                                    className="flex-1 border rounded px-2 py-1"
                                >
                                    {deductionTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={deduction.amount}
                                    onChange={(e) =>
                                        updateDeduction(
                                            index,
                                            "amount",
                                            e.target.value
                                        )
                                    }
                                    className="w-24 border rounded px-2 py-1"
                                    placeholder="Amount"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeDeduction(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Allowances */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">Allowances</h3>
                            <button
                                type="button"
                                onClick={addAllowance}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </div>
                        {formData.allowances.map((allowance, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2 mb-2"
                            >
                                <select
                                    value={allowance.type}
                                    onChange={(e) =>
                                        updateAllowance(
                                            index,
                                            "type",
                                            e.target.value
                                        )
                                    }
                                    className="flex-1 border rounded px-2 py-1"
                                >
                                    {allowanceTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={allowance.amount}
                                    onChange={(e) =>
                                        updateAllowance(
                                            index,
                                            "amount",
                                            e.target.value
                                        )
                                    }
                                    className="w-24 border rounded px-2 py-1"
                                    placeholder="Amount"
                                />
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={allowance.taxable}
                                        onChange={(e) =>
                                            updateAllowance(
                                                index,
                                                "taxable",
                                                e.target.checked
                                            )
                                        }
                                        className="mr-1"
                                    />
                                    Taxable
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeAllowance(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {submitButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeModal;
