// templates/payslipTemplate.ts

interface TemplateData {
    employee: {
        id: number;
        user: {
            first_name: string;
            last_name: string;
        };
        department: string;
        salary_type: 1 | 2;
    };
    payPeriod: {
        start_date: string;
        end_date: string;
        generated_at: string;
        pay_frequency?: string;
    };
    attendance: {
        total_working_days: number;
        days_worked: number;
        total_hours: number;
        regular_hours: number;
    };
    financial: {
        calculatedBasePay: number;
        gross_salary: string;
        net_salary: string;
    };
    allowancesRows: string;
    deductionsRows: string;
    totalAllowances: number;
    totalDeductions: number;
    status: string;
    withholding_tax: number;
    formatCurrency: (amount: string | number) => string;
    formatDate: (dateString: string) => string;
}

export const payslipTemplate = (data: TemplateData): string => {
    const {
        employee,
        payPeriod,
        attendance,
        financial,
        withholding_tax,
        allowancesRows,
        deductionsRows,
        totalAllowances,
        totalDeductions,
        status,
        formatCurrency,
        formatDate,
    } = data;

    const getPayFrequencyLabel = (frequency?: string) => {
        const frequencyMap = {
            weekly: "Weekly",
            biweekly: "Bi-weekly",
            semi_monthly: "Semi-monthly",
            monthly: "Monthly",
        };
        return (
            frequencyMap[frequency as keyof typeof frequencyMap] || "Monthly"
        );
    };

    const withholdingTaxAmount = parseFloat(withholding_tax?.toString() || "0");
    const totalAllDeductions = totalDeductions + withholdingTaxAmount;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Payslip - ${employee.user.first_name} ${
        employee.user.last_name
    }</title>
        <style>
            ${getPayslipStyles()}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="payslip-title">Payslip</div>
            <div class="pay-period">
                <strong>Pay Period:</strong> ${formatDate(
                    payPeriod.start_date
                )} - ${formatDate(payPeriod.end_date)}
            </div>
            ${
                payPeriod.pay_frequency
                    ? `
            <div class="pay-frequency">
                <strong>Pay Frequency:</strong> ${getPayFrequencyLabel(
                    payPeriod.pay_frequency
                )}
            </div>
            `
                    : ""
            }
        </div>

        <div class="employee-info">
            <div class="info-column">
                <div class="info-item">
                    <span class="label">Employee Name:</span>
                    ${employee.user.first_name} ${employee.user.last_name}
                </div>
                <div class="info-item">
                    <span class="label">Pay Type:</span>
                    ${employee.salary_type === 1 ? "Hourly" : "Monthly"}
                </div>
            </div>
            <div class="info-column">
                <div class="info-item">
                    <span class="label">Status:</span>
                    ${status}
                </div>
                <div class="info-item">
                    <span class="label">Generated:</span>
                    ${formatDate(payPeriod.generated_at)}
                </div>
            </div>
        </div>

        <div class="attendance-summary">
            <div class="attendance-title">Attendance Summary</div>
            <div class="attendance-grid">
                <div class="attendance-item">
                    <div class="attendance-label">Total Working Days</div>
                    <div class="attendance-value">${
                        attendance.total_working_days
                    }</div>
                </div>
                <div class="attendance-item">
                    <div class="attendance-label">Days Worked</div>
                    <div class="attendance-value">${
                        attendance.days_worked
                    }</div>
                </div>
                <div class="attendance-item">
                    <div class="attendance-label">Total Hours</div>
                    <div class="attendance-value">${
                        attendance.total_hours
                    }</div>
                </div>
                <div class="attendance-item">
                    <div class="attendance-label">Regular Hours</div>
                    <div class="attendance-value">${
                        attendance.regular_hours
                    }</div>
                </div>
            </div>
        </div>

        <div class="earnings-deductions">
            <div class="earnings-section">
                <div class="section-title">Earnings</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Base Salary</td>
                            <td class="amount">${formatCurrency(
                                financial.calculatedBasePay
                            )}</td>
                        </tr>
                        ${allowancesRows}
                        <tr class="total-row">
                            <td>Gross Salary</td>
                            <td class="amount">${formatCurrency(
                                financial.gross_salary
                            )}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="deductions-section">
                <div class="section-title">Deductions</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                Withholding Tax
                                <div class="tax-note">Philippine Income Tax</div>
                            </td>
                            <td class="amount">${formatCurrency(
                                withholdingTaxAmount
                            )}</td>
                        </tr>
                        ${deductionsRows}
                        <tr class="total-row">
                            <td>Total Deductions</td>
                            <td class="amount">${formatCurrency(
                                totalAllDeductions
                            )}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="net-pay">
            <div class="net-pay-label">Net Pay</div>
            <div class="net-pay-amount">${formatCurrency(
                financial.net_salary
            )}</div>
        </div>

        <div class="footer">
            <p>This payslip is computer generated and does not require a signature.</p>
            <p>Generated on ${formatDate(payPeriod.generated_at)}</p>
            ${
                payPeriod.pay_frequency && payPeriod.pay_frequency !== "monthly"
                    ? `
            <p class="proration-note">
                * Allowances and deductions have been prorated based on ${getPayFrequencyLabel(
                    payPeriod.pay_frequency
                ).toLowerCase()} pay frequency
            </p>
            `
                    : ""
            }
            <p class="tax-note">* Withholding tax calculated based on Philippine Income Tax Law</p>
        </div>
    </body>
    </html>
    `;
};

const getPayslipStyles = (): string => {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.4;
            color: #333;
            font-size: 14px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .payslip-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .pay-period {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .pay-frequency {
            font-size: 14px;
            color: #666;
        }
        
        .employee-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .info-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }
        
        .info-item {
            margin-bottom: 8px;
        }
        
        .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 120px;
        }
        
        .attendance-summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .attendance-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .attendance-grid {
            display: table;
            width: 100%;
        }
        
        .attendance-item {
            display: table-cell;
            text-align: center;
            width: 25%;
        }
        
        .attendance-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .attendance-value {
            font-size: 18px;
            font-weight: bold;
        }
        
        .earnings-deductions {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .earnings-section, .deductions-section {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        
        .earnings-section {
            padding-right: 20px;
        }
        
        .deductions-section {
            padding-left: 20px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
        }
        
        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 13px;
        }
        
        .table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #555;
        }
        
        .table .amount {
            text-align: right;
        }
        
        .table .total-row {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .tax-note {
            font-size: 11px;
            color: #dc3545;
            font-style: italic;
            margin-top: 2px;
        }
        
        .net-pay {
            background-color: #d4edda;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .net-pay-label {
            font-size: 20px;
            font-weight: bold;
            color: #155724;
            margin-bottom: 10px;
        }
        
        .net-pay-amount {
            font-size: 32px;
            font-weight: bold;
            color: #155724;
        }
        
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            margin-top: 40px;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
        .proration-note {
            color: #007bff !important;
        }
        
        .footer .tax-note {
            color: #dc3545 !important;
        }
        
        @media print {
            body { 
                margin: 20px; 
            }
            .no-print { 
                display: none; 
            }
        }
    `;
};
