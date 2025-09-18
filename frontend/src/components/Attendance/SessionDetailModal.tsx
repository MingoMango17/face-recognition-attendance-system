// components/Attendance/SessionDetailsModal.tsx
import React from "react";
import { X, Clock, CheckCircle, Play } from "lucide-react";
import { type DailyAttendance } from "../../types/attendance";
import {
    formatTime,
    formatDuration,
    formatDate,
} from "../../utils/attendance.utils";

interface SessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: DailyAttendance | null;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
    isOpen,
    onClose,
    attendance,
}) => {
    if (!isOpen || !attendance) return null;

    return (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Attendance Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Employee Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-purple-600">
                                {attendance.employee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </span>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">
                                {attendance.employee.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                                {formatDate(attendance.date)} •{" "}
                                {attendance.employee.department}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-xl font-semibold text-blue-600">
                            {formatDuration(
                                Math.round(attendance.total_hours * 60)
                            )}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Sessions</p>
                        <p className="text-xl font-semibold text-green-600">
                            {attendance.sessions.length}
                        </p>
                    </div>
                </div>

                {/* Sessions */}
                <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                        Work Sessions
                    </h5>
                    {attendance.sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No attendance records for this day</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attendance.sessions.map((session, index) => (
                                <div
                                    key={index}
                                    className="flex items-center p-3 border rounded-lg"
                                >
                                    <div className="flex-shrink-0">
                                        {session.time_out ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Play className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900">
                                                Session {index + 1}
                                            </span>
                                            {session.duration_minutes && (
                                                <span className="text-sm text-gray-600">
                                                    {formatDuration(
                                                        session.duration_minutes
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {formatTime(session.time_in)} -{" "}
                                            {session.time_out ? (
                                                formatTime(session.time_out)
                                            ) : (
                                                <span className="text-blue-600 font-medium">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsModal;
