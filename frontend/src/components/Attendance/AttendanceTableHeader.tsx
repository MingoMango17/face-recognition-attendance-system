// components/Attendance/AttendanceTableHeader.tsx
import React from "react";
import { Plus, Calendar } from "lucide-react";

interface AttendanceTableHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
    onAddRecord: () => void;
}

const AttendanceTableHeader: React.FC<AttendanceTableHeaderProps> = ({
    searchTerm,
    onSearchChange,
    selectedDate,
    onDateChange,
    onAddRecord,
}) => {
    return (
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    {/* Date Picker */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <button
                    onClick={onAddRecord}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                </button>
            </div>
        </div>
    );
};

export default AttendanceTableHeader;
