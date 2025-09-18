// components/Leave/LeaveTableHeader.tsx
import React from "react";
import { Plus } from "lucide-react";

interface LeaveTableHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddLeave: () => void;
}

const LeaveTableHeader: React.FC<LeaveTableHeaderProps> = ({
    searchTerm,
    onSearchChange,
    onAddLeave,
}) => {
    return (
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search leaves..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={onAddLeave}
                    className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Leave
                </button>
            </div>
        </div>
    );
};

export default LeaveTableHeader;
