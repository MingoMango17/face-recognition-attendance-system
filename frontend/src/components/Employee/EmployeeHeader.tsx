import React from "react";
import { Plus, Filter, Download } from "lucide-react";

interface EmployeeHeaderProps {
    onAddEmployee: () => void;
    onExport?: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
    onAddEmployee,
    onExport,
}) => {
    return (
        <div className="flex items-center space-x-3">
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
