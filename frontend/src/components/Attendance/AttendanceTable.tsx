// components/Attendance/AttendanceTable.tsx
import React from "react";
import { type DailyAttendance } from "../../types/attendance";
import AttendanceTableHeader from "./AttendanceTableHeader";
import AttendanceTableRow from "./AttendanceTableRow";
import { formatDate } from "../../utils/attendance.utils";

interface AttendanceTableProps {
    attendanceData: DailyAttendance[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
    onAddRecord: () => void;
    onViewDetails: (attendance: DailyAttendance) => void;
    onEditRecord: (attendance: DailyAttendance) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
    attendanceData,
    searchTerm,
    onSearchChange,
    selectedDate,
    onDateChange,
    onAddRecord,
    onViewDetails,
    onEditRecord,
}) => {
    return (
        <div className="bg-white rounded-lg shadow">
            <AttendanceTableHeader
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onAddRecord={onAddRecord}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sessions ({formatDate(selectedDate)})
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Hours
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
                        {attendanceData.map((attendance) => (
                            <AttendanceTableRow
                                key={attendance.employee.id}
                                attendance={attendance}
                                onViewDetails={onViewDetails}
                                onEditRecord={onEditRecord}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {attendanceData.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        No attendance records found for this date
                    </p>
                </div>
            )}

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to{" "}
                            <span className="font-medium">
                                {attendanceData.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                                {attendanceData.length}
                            </span>{" "}
                            results
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTable;
