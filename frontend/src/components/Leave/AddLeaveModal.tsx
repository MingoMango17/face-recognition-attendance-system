// components/Leave/AddLeaveModal.tsx
import React, { useState } from "react";
import { type Employee, LEAVE_TYPES } from "../../types/leave";

interface AddLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: LeaveFormData) => void;
    employees: Employee[];
    loading: boolean;
}

export interface LeaveFormData {
    employee_id: string;
    leave_type: string;
    details: string;
    start_date: string;
    end_date: string;
}

const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    employees,
    loading,
}) => {
    const [formData, setFormData] = useState<LeaveFormData>({
        employee_id: "",
        leave_type: "",
        details: "",
        start_date: "",
        end_date: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            employee_id: "",
            leave_type: "",
            details: "",
            start_date: "",
            end_date: "",
        });
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Add New Leave
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee
                            </label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((employee) => (
                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.name} - {employee.department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Leave Type
                            </label>
                            <select
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="">Select Leave Type</option>
                                {Object.entries(LEAVE_TYPES).map(
                                    ([key, value]) => (
                                        <option key={key} value={key}>
                                            {value.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Details
                            </label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter leave details..."
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Leave"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddLeaveModal;
