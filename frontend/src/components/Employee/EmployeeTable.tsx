import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";

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
            return `$${amount.toFixed(2)}/hr`;
        } else {
            return `$${amount.toLocaleString()}/year`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
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
                                            {employee.user?.email && (
                                                <div className="text-sm text-gray-500">
                                                    {employee.user.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employee.department}
                                </td>
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
                                        {/* <button
                                            onClick={() =>
                                                onViewEmployee(employee)
                                            }
                                            className="text-blue-600 hover:text-blue-900"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button> */}
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
        </div>
    );
};

export default EmployeeTable;
