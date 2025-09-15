import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeePaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const EmployeePagination: React.FC<EmployeePaginationProps> = ({
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
}) => {
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">
                            {Math.min(endIndex, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span>{" "}
                        results
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() =>
                            onPageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <select
                        value={itemsPerPage}
                        onChange={(e) =>
                            onItemsPerPageChange(Number(e.target.value))
                        }
                        className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default EmployeePagination;
