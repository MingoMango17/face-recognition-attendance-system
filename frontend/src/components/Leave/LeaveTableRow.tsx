// components/Leave/LeaveTableRow.tsx
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { type Leave, LEAVE_TYPES } from "../../types/leave";

interface LeaveTableRowProps {
    leave: Leave;
    onEdit: (leave: Leave) => void;
    onDelete: (id: number) => void;
}

const LeaveTableRow: React.FC<LeaveTableRowProps> = ({
    leave,
    onEdit,
    onDelete,
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                            {leave.employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {leave.employee.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">
                            {leave.employee.department}
                        </div> */}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        LEAVE_TYPES[
                            leave.leave_type as keyof typeof LEAVE_TYPES
                        ].color
                    }`}
                >
                    {
                        LEAVE_TYPES[
                            leave.leave_type as keyof typeof LEAVE_TYPES
                        ].label
                    }
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                    {leave.details}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                    {formatDate(leave.start_date)} -{" "}
                    {formatDate(leave.end_date)}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {calculateDays(leave.start_date, leave.end_date)} day
                {calculateDays(leave.start_date, leave.end_date) > 1 ? "s" : ""}
            </td>
            {/* <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        leave.is_approved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {leave.is_approved ? "Approved" : "Pending"}
                </span>
            </td> */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* <button
                    onClick={() => onEdit(leave)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                    <Edit className="w-4 h-4" />
                </button> */}
                <button
                    onClick={() => onDelete(leave.id)}
                    className="text-red-600 hover:text-red-900"
                >
                    <Trash2 className="w-6 h-6" />
                </button>
            </td>
        </tr>
    );
};

export default LeaveTableRow;
