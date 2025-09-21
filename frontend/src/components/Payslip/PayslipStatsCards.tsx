import React from "react";

interface Payslip {
    id: number;
    employee: {
        id: number;
        user: {
            first_name: string;
            last_name: string;
        };
        department: string;
    };
    status: 1 | 2 | 3 | 4 | 5;
    gross_salary: string;
    net_salary: string;
}

interface PayslipStatsCardsProps {
    payslips: Payslip[];
}

const PayslipStatsCards: React.FC<PayslipStatsCardsProps> = ({ payslips }) => {
    const stats = {
        total: payslips.length,
        draft: payslips.filter((p) => p.status === 1).length,
        generated: payslips.filter((p) => p.status === 2).length,
        approved: payslips.filter((p) => p.status === 3).length,
        paid: payslips.filter((p) => p.status === 4).length,
        cancelled: payslips.filter((p) => p.status === 5).length,
        totalGrossPay: payslips
            .filter((p) => p.status !== 5) // Exclude cancelled
            .reduce((sum, p) => sum + parseFloat(p.gross_salary || "0"), 0),
        totalNetPay: payslips
            .filter((p) => p.status !== 5) // Exclude cancelled
            .reduce((sum, p) => sum + parseFloat(p.net_salary || "0"), 0),
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const cards = [
        {
            title: "Total Payslips",
            value: stats.total,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                </svg>
            ),
            color: "bg-blue-500",
        },
        {
            title: "Pending Approval",
            value: stats.generated,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
            ),
            color: "bg-yellow-500",
        },
        {
            title: "Approved",
            value: stats.approved,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
            ),
            color: "bg-green-500",
        },
        {
            title: "Paid",
            value: stats.paid,
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                </svg>
            ),
            color: "bg-purple-500",
        },
        {
            title: "Total Gross Pay",
            value: formatCurrency(stats.totalGrossPay),
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
            ),
            color: "bg-indigo-500",
        },
        {
            title: "Total Net Pay",
            value: formatCurrency(stats.totalNetPay),
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm12-4h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04-.39.08-.74.28-1.01.55-.18.18-.33.4-.43.64-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78.1.23.25.45.43.64.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                </svg>
            ),
            color: "bg-green-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                        <div
                            className={`${card.color} p-2 rounded-lg text-white mr-3`}
                        >
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {card.value}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PayslipStatsCards;
