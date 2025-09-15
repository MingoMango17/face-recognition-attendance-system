import React from "react";
import { Plus, Filter, Download } from "lucide-react";

interface EmployeeHeaderProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    onAddEmployee: () => void;
    onExport?: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
    showFilters,
    onToggleFilters,
    onAddEmployee,
    onExport,
}) => {
    return (
        <div className="flex items-center space-x-3">
            {/* <button
                onClick={onToggleFilters}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
            </button> */}
            <button
                onClick={onExport}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
            </button>
            <button
                onClick={onAddEmployee}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
            </button>
        </div>
    );
};

export default EmployeeHeader;
