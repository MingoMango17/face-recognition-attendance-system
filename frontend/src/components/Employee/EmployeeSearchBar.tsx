import React from "react";
import { Search } from "lucide-react";

interface EmployeeSearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const EmployeeSearchBar: React.FC<EmployeeSearchBarProps> = ({
    searchTerm,
    onSearchChange,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSearchBar;
