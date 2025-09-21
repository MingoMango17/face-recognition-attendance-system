// components/Leave/LeaveTableHeader.tsx
import React from "react";
import { Plus } from "lucide-react";

interface LeaveTableHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const LeaveTableHeader: React.FC<LeaveTableHeaderProps> = ({
    searchTerm,
    onSearchChange,
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
            </div>
        </div>
    );
};

export default LeaveTableHeader;
