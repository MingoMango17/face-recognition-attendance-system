// components/Leave/LeaveTable.tsx
import React from "react";
import { type Leave } from "../../types/leave";
import LeaveTableHeader from "./LeaveTableHeader";
import LeaveTableRow from "./LeaveTableRow";

interface LeaveTableProps {
    leaves: Leave[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddLeave: () => void;
    onEditLeave: (leave: Leave) => void;
    onDeleteLeave: (id: number) => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({
    leaves,
    searchTerm,
    onSearchChange,
    onAddLeave,
    onEditLeave,
    onDeleteLeave,
}) => {
    return (
        <div className="bg-white rounded-lg shadow">
            <LeaveTableHeader
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onAddLeave={onAddLeave}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Leave Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Days
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
                        {leaves.map((leave) => (
                            <LeaveTableRow
                                key={leave.id}
                                leave={leave}
                                onEdit={onEditLeave}
                                onDelete={onDeleteLeave}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {leaves.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No leaves found</p>
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
                            <span className="font-medium">{leaves.length}</span>{" "}
                            of{" "}
                            <span className="font-medium">{leaves.length}</span>{" "}
                            results
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveTable;
