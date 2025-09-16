import React from "react";
import { X } from "lucide-react";
import { useEmployeeModal } from "./Modal/useEmployeeModal";
import BasicInfoSection from "./Modal/BasicInfoSection";
import DeductionsSection from "./Modal/DeductionsSection";
import AllowancesSection from "./Modal/AllowancesSection";

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    password: string;
    salary: string;
    salary_type: "hourly" | "monthly";
    deductions: Array<{ type: number; amount: string }>;
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
    const {
        formData,
        loading,
        handleChange,
        resetFormData,
        addDeduction,
        updateDeduction,
        removeDeduction,
        addAllowance,
        updateAllowance,
        removeAllowance,
    } = useEmployeeModal({ mode, employee, isOpen });

    // Constants
    const departments = ["Engineering", "Marketing", "HR", "Finance", "Sales"];
    const deductionTypes = [
        "Tax",
        "Health Insurance",
        "Social Security",
        "Other",
    ];
    const allowanceTypes = ["Meal", "Transportation", "Medical", "Bonus"];

    const handleSubmit = () => {
        onSubmit(formData);
        if (mode === "add") {
            resetFormData();
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
                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                                Loading employee data...
                            </span>
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <BasicInfoSection
                        formData={formData}
                        departments={departments}
                        mode={mode}
                        loading={loading}
                        onChange={handleChange}
                    />

                    {/* Deductions Section */}
                    <DeductionsSection
                        deductions={formData.deductions}
                        deductionTypes={deductionTypes}
                        loading={loading}
                        onAdd={addDeduction}
                        onUpdate={updateDeduction}
                        onRemove={removeDeduction}
                    />

                    {/* Allowances Section */}
                    <AllowancesSection
                        allowances={formData.allowances}
                        allowanceTypes={allowanceTypes}
                        loading={loading}
                        onAdd={addAllowance}
                        onUpdate={updateAllowance}
                        onRemove={removeAllowance}
                    />

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : submitButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeModal;
