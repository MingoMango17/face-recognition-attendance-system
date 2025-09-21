// types/payroll.ts

export interface PayrollPeriod {
    id: number;
    name: string;
    frequency: number;
    frequency_display: string;
    start_date: string;
    end_date: string;
    cut_off_date: string;
    pay_date: string;
    status: number;
    status_display: string;
    is_auto_generated: boolean;
    payslips_count: number;
    total_gross_salary: string;
    total_net_salary: string;
    created_at: string;
    updated_at: string;
}

export interface Employee {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        get_full_name: string;
    };
    salary_type: number;
    salary_type_display: string;
    hire_date: string;
    base_salary: string;
    department: string;
    is_active: boolean;
}

export interface Payslip {
    id: number;
    employee: Employee;
    payroll_period: PayrollPeriod;
    total_working_days: number;
    days_worked: string;
    total_hours: string;
    regular_hours: string;
    overtime_hours: string;
    basic_pay: string;
    overtime_pay: string;
    total_allowances: string;
    total_deductions: string;
    gross_salary: string;
    net_salary: string;
    status: number;
    status_display: string;
    start_date: string;
    end_date: string;
    generated_at: string;
    approved_at: string | null;
    paid_at: string | null;
    payslip_allowances: PayslipAllowance[];
    payslip_deductions: PayslipDeduction[];
}

export interface PayslipAllowance {
    id: number;
    allowance_type: number;
    allowance_type_display: string;
    amount: string;
    description: string;
}

export interface PayslipDeduction {
    id: number;
    deduction_type: number;
    deduction_type_display: string;
    amount: string;
    description: string;
}

export interface PayrollSettings {
    id: number;
    default_frequency: number;
    default_frequency_display: string;
    working_days_per_week: number;
    working_hours_per_day: string;
    overtime_multiplier: string;
    overtime_threshold_hours: string;
    auto_generate_periods: boolean;
    auto_generate_days_ahead: number;
    notify_before_cutoff_days: number;
    notify_before_payday_days: number;
}

export interface CreatePeriodData {
    frequency: number;
    start_date: string;
    end_date: string;
    cut_off_date: string;
    pay_date: string;
    name?: string;
}
