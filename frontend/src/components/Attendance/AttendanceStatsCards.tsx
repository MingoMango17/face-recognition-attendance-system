// components/Attendance/AttendanceStatsCards.tsx
import React from "react";
import { Users, UserCheck, Clock, UserX } from "lucide-react";

interface AttendanceStatsCardsProps {
    totalEmployees: number;
    presentCount: number;
    checkedInCount: number;
    absentCount: number;
    onBreakCount: number;
}

const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({
    totalEmployees,
    presentCount,
    checkedInCount,
    absentCount,
    onBreakCount,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Total Employees
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {totalEmployees}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Present
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {presentCount}
                        </p>
                        <p className="text-xs text-gray-500">Completed work</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Currently In
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {checkedInCount}
                        </p>
                        <p className="text-xs text-gray-500">Checked in now</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <UserX className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            Absent
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {absentCount}
                        </p>
                        {onBreakCount > 0 && (
                            <p className="text-xs text-yellow-600">
                                {onBreakCount} on break
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStatsCards;
