import React from "react";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface LeaveStatsCardsProps {
    totalLeaves: number;
    approvedLeaves: number;
    pendingLeaves: number;
}

const LeaveStatsCards: React.FC<LeaveStatsCardsProps> = ({
    totalLeaves,
    approvedLeaves,
    pendingLeaves,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                        <p className="text-2xl font-semibold text-gray-900">{totalLeaves}</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-2xl font-semibold text-gray-900">{approvedLeaves}</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-semibold text-gray-900">{pendingLeaves}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveStatsCards;