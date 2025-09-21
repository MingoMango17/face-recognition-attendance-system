// utils/pdfGenerator.ts

import { payslipTemplate } from "./payslipTemplate";

interface Employee {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        email?: string;
        username: string;
    };
    salary_type: 1 | 2;
    department: string;
    base_salary: string;
}

interface Allowance {
    id: number;
    value: string;
    description: string;
    allowance_type: number;
    is_taxable: boolean;
    is_active: boolean;
}

interface Deduction {
    id: number;
    value: string;
    deduction_type: number;
    is_active: boolean;
}

interface Payslip {
    id: number;
    employee: Employee;
    total_working_days: number;
    days_worked: number;
    total_hours: number;
    regular_hours: number;
    gross_salary: string;
    net_salary: string;
    status: 1 | 2 | 3 | 4 | 5;
    start_date: string;
    end_date: string;
    generated_at: string;
    approved_at?: string;
    withholding_tax?: float;
}

// We'll pass the fetched data to avoid API calls in the PDF generator
interface PayslipPDFData {
    payslip: Payslip;
    allowances: Allowance[];
    deductions: Deduction[];
}

const allowanceTypeNames: Record<number, string> = {
    0: "Meal Allowance",
    1: "Transportation Allowance", 
    2: "Medical Allowance",
    3: "Bonus"
};

const deductionTypeNames: Record<number, string> = {
    0: "Loan",
    1: "Health Insurance",
    2: "Social Security",
    3: "Others"
};

const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
    }).format(parseFloat(amount.toString() || "0"));
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const getStatusLabel = (status: number): string => {
    const statusMap: Record<number, string> = {
        1: "Draft",
        2: "Generated", 
        3: "Approved",
        4: "Paid",
        5: "Cancelled"
    };
    return statusMap[status] || "Unknown";
};

const generateAllowancesRows = (allowances: Allowance[]): string => {
    if (allowances.length === 0) {
        return `<tr><td style="font-style: italic; color: #666;">No allowances</td><td class="amount">${formatCurrency(0)}</td></tr>`;
    }
    
    return allowances.map(allowance => {
        const description = allowance.description || allowanceTypeNames[allowance.allowance_type] || "Unknown Allowance";
        const taxableText = allowance.is_taxable ? " (Taxable)" : "";
        return `
            <tr>
                <td>${description}${taxableText}</td>
                <td class="amount">${formatCurrency(allowance.value)}</td>
            </tr>
        `;
    }).join("");
};

const generateDeductionsRows = (deductions: Deduction[]): string => {
    if (deductions.length === 0) {
        return `<tr><td style="font-style: italic; color: #666;">No deductions</td><td class="amount">${formatCurrency(0)}</td></tr>`;
    }
    
    return deductions.map(deduction => {
        const description = deductionTypeNames[deduction.deduction_type] || "Unknown Deduction";
        return `
            <tr>
                <td>${description}</td>
                <td class="amount">${formatCurrency(deduction.value)}</td>
            </tr>
        `;
    }).join("");
};

const calculateBasePay = (payslip: Payslip): number => {
    const baseSalary = parseFloat(payslip.employee.base_salary);
    
    if (payslip.employee.salary_type === 1) { // Hourly
        return baseSalary * parseFloat(payslip.regular_hours.toString());
    } else { // Monthly
        const daysRatio = payslip.days_worked / payslip.total_working_days;
        return baseSalary * daysRatio;
    }
};

const calculateTotals = (allowances: Allowance[], deductions: Deduction[]) => {
    const totalAllowances = allowances.reduce((sum, allowance) => 
        sum + parseFloat(allowance.value), 0
    );
    
    const totalDeductions = deductions.reduce((sum, deduction) => 
        sum + parseFloat(deduction.value), 0
    );
    
    return { totalAllowances, totalDeductions };
};

export const generatePayslipPDF = (data: PayslipPDFData): void => {
    console.log('data', data.payslip);
    const { payslip, allowances, deductions } = data;
    const calculatedBasePay = calculateBasePay(payslip);
    const { totalAllowances, totalDeductions } = calculateTotals(allowances, deductions);
    
    const allowancesRows = generateAllowancesRows(allowances);
    const deductionsRows = generateDeductionsRows(deductions);

    const templateData = {
        employee: payslip.employee,
        payPeriod: {
            start_date: payslip.start_date,
            end_date: payslip.end_date,
            generated_at: payslip.generated_at,
        },
        attendance: {
            total_working_days: payslip.total_working_days,
            days_worked: payslip.days_worked,
            total_hours: payslip.total_hours,
            regular_hours: payslip.regular_hours,
        },
        financial: {
            calculatedBasePay,
            gross_salary: payslip.gross_salary,
            net_salary: payslip.net_salary,
        },
        withholding_tax: payslip.withholding_tax,
        allowancesRows,
        deductionsRows,
        totalAllowances,
        totalDeductions,
        status: getStatusLabel(payslip.status),
        formatCurrency,
        formatDate,
    };
    const htmlContent = payslipTemplate(templateData)

    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Could not open print window. Please check your browser settings.');
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again or check your browser settings.");
    }
};

// Export function that accepts the data directly
export const downloadPayslipPDF = (data: PayslipPDFData): void => {
    generatePayslipPDF(data);
};