export interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
}

export interface Leave {
    id: number;
    employee: Employee;
    leave_type: number;
    details: string;
    start_date: string;
    end_date: string;
    is_approved: boolean;
}

export interface LeavePayload {
    employee: number;
    leave_type: number;
    details: string;
    start_date: string;
    end_date: string;
    is_approved: boolean;
}

export interface LeaveFormData {
    employee_id: string;
    leave_type: string;
    details: string;
    start_date: string;
    end_date: string;
}

export const LEAVE_TYPES = {
    0: { label: "PAID LEAVE", color: "bg-green-100 text-green-800" },
    1: { label: "SICK", color: "bg-yellow-100 text-yellow-800" },
    2: { label: "MATERNITY", color: "bg-pink-100 text-pink-800" },
    3: { label: "LEAVE WITHOUT PAY", color: "bg-gray-100 text-gray-800" },
    4: { label: "HALF DAY LEAVE", color: "bg-blue-100 text-blue-800"}
};
