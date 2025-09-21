import React, { useState } from "react";
import { Edit, Trash2, CalendarMinus } from "lucide-react";
import AddLeaveModal from "../Leave/AddLeaveModal";
import type { LeaveFormData, LeavePayload } from "../../types/leave";
import { api } from "../../utils/api";

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

interface EmployeeTableProps {
    employees: Employee[];
    loading: boolean;
    onViewEmployee: (employee: Employee) => void;
    onEditEmployee: (employee: Employee) => void;
    onDeleteEmployee: (employee: Employee) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
    employees,
    loading,
    onViewEmployee,
    onEditEmployee,
    onDeleteEmployee,
}) => {
    const getSalaryTypeLabel = (type: 1 | 2) => {
        return type === 1 ? "Hourly" : "Monthly";
    };

    const getSalaryTypeColor = (type: 1 | 2) => {
        return type === 1
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800";
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    const formatSalary = (salary: string, type: 1 | 2) => {
        const amount = parseFloat(salary);
        if (type === 1) {
            return `PHP${amount.toFixed(2)}/hr`;
        } else {
            return `PHP${amount.toLocaleString()}/month`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const [showModal, setShowModal] = useState(false);
    const [loadingLeave, setLoadingLeave] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );
    const handleSubmitLeave = async (formData: LeaveFormData) => {
        setLoadingLeave(true);

        try {
            // Mock API call - replace with actual implementation
            // const selectedEmployee = employees.find(
            //     (emp) => emp.id === parseInt(formData.employee_id)
            // );
            if (!selectedEmployee) {
                console.error("No employee selected");
                return;
            }

            const newLeave: LeavePayload = {
                employee: selectedEmployee.id,
                leave_type: parseInt(formData.leave_type),
                details: formData.details,
                start_date: formData.start_date,
                end_date: formData.end_date,
                is_approved: true,
            };

            const request = api.post("payroll/leaves/", newLeave);

            setShowModal(false);
        } catch (error) {
            console.error("Error creating leave:", error);
        } finally {
            setLoadingLeave(false);
        }
    };

    const onAddLeaveEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Salary Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hire Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-purple-700">
                                                {employee.user.first_name.charAt(
                                                    0
                                                )}
                                                {employee.user.last_name.charAt(
                                                    0
                                                )}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.user.first_name}{" "}
                                                {employee.user.last_name}
                                            </div>
                                            {/* {employee.user?.email && (
                                                <div className="text-sm text-gray-500">
                                                    {employee.user.email}
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employee.department}
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSalaryTypeColor(
                                            employee.salary_type
                                        )}`}
                                    >
                                        {getSalaryTypeLabel(
                                            employee.salary_type
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatSalary(
                                        employee.base_salary,
                                        employee.salary_type
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(employee.hire_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                            employee.is_active
                                        )}`}
                                    >
                                        {employee.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                onAddLeaveEmployee(employee)
                                            }
                                            className="text-blue-600 hover:text-blue-900"
                                            title="View Details"
                                        >
                                            <CalendarMinus className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                onEditEmployee(employee)
                                            }
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Edit Employee"
                                        >
                                            <Edit className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                onDeleteEmployee(employee)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Employee"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddLeaveModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitLeave}
                // employees={employees}
                loading={loadingLeave}
            />
        </div>
    );
};

export default EmployeeTable;
