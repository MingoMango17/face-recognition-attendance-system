// components/Attendance/AttendanceTableRow.tsx
import React from "react";
import { Eye, Edit } from "lucide-react";
import { type DailyAttendance, STATUS_COLORS } from "../../types/attendance";
import { formatTime, formatDuration } from "../../utils/attendance.utils";

interface AttendanceTableRowProps {
    attendance: DailyAttendance;
    onViewDetails: (attendance: DailyAttendance) => void;
    onEditRecord: (attendance: DailyAttendance) => void;
}

const AttendanceTableRow: React.FC<AttendanceTableRowProps> = ({
    attendance,
    onViewDetails,
    onEditRecord,
}) => {
    const renderSessions = () => {
        if (attendance.sessions.length === 0) {
            return <span className="text-gray-400">-</span>;
        }

        const visibleSessions = attendance.sessions.slice(0, 2);
        const remainingSessions = attendance.sessions.length - 2;

        return (
            <div className="text-sm">
                {visibleSessions.map((session, index) => (
                    <div key={index} className="text-gray-900">
                        {formatTime(session.time_in)} -{" "}
                        {session.time_out ? (
                            formatTime(session.time_out)
                        ) : (
                            <span className="text-blue-600 font-medium">
                                Active
                            </span>
                        )}
                    </div>
                ))}
                {remainingSessions > 0 && (
                    <div className="text-gray-500 text-xs">
                        +{remainingSessions} more session
                        {remainingSessions > 1 ? "s" : ""}
                    </div>
                )}
            </div>
        );
    };

    const getTotalHoursDisplay = () => {
        if (attendance.total_hours === 0) {
            return <span className="text-gray-400">-</span>;
        }

        const totalMinutes = Math.round(attendance.total_hours * 60);
        return formatDuration(totalMinutes);
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                            {attendance.employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {attendance.employee.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">
                            {attendance.employee.department}
                        </div> */}
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">{renderSessions()}</td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getTotalHoursDisplay()}
            </td>

            {/* <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        STATUS_COLORS[attendance.status]
                    }`}
                >
                    {attendance.status}
                </span>
            </td> */}

            {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    onClick={() => onViewDetails(attendance)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="View Details"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onEditRecord(attendance)}
                    className="text-gray-600 hover:text-gray-900"
                    title="Edit Record"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </td> */}
        </tr>
    );
};

export default AttendanceTableRow;
