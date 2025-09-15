import React from "react";
import { Users, Calendar } from "lucide-react";

interface Employee {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        username: string;
    };
    salary_type: 1 | 2;
    hire_date: string;
    base_salary: string;
    department: string;
    details: string;
    is_active: boolean;
}

interface EmployeeStatsCardsProps {
    employees: Employee[];
}

const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
    employees,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Total Employees
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {employees.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Active
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {employees.filter((emp) => emp.is_active).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            New This Month
                        </p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeStatsCards;
