// components/Attendance/AddAttendanceModal.tsx
import React, { useState } from "react";
import { type Employee, ATTENDANCE_TYPES } from "../../types/attendance";

interface AddAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: AttendanceFormData) => void;
    employees: Employee[];
    loading: boolean;
}

export interface AttendanceFormData {
    employee_id: string;
    attendance_type: string;
    timestamp: string;
}

const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    employees,
    loading,
}) => {
    const [formData, setFormData] = useState<AttendanceFormData>({
        employee_id: "",
        attendance_type: "",
        timestamp: "",
    });

    React.useEffect(() => {
        if (isOpen) {
            // Set default timestamp to current date and time
            const now = new Date();
            const localDateTime = new Date(
                now.getTime() - now.getTimezoneOffset() * 60000
            )
                .toISOString()
                .slice(0, 16);
            setFormData((prev) => ({
                ...prev,
                timestamp: localDateTime,
            }));
        }
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
            attendance_type: "",
            timestamp: "",
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
                        Add Attendance Record
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
                                Action
                            </label>
                            <select
                                name="attendance_type"
                                value={formData.attendance_type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="">Select Action</option>
                                {Object.entries(ATTENDANCE_TYPES).map(
                                    ([key, value]) => (
                                        <option key={key} value={key}>
                                            {value}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                name="timestamp"
                                value={formData.timestamp}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Set the exact time for this attendance record
                            </p>
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
                                {loading ? "Adding..." : "Add Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAttendanceModal;
