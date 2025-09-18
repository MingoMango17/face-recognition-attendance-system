// types/attendance.ts
export interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
}

export interface AttendanceRecord {
    id: number;
    employee: Employee;
    timestamp: string; // ISO datetime string
    attendance_type: number; // 1 = TIME_IN, 2 = TIME_OUT
}

export interface AttendanceSession {
    time_in: string;
    time_out?: string; // undefined if still active
    duration_minutes?: number; // only if time_out exists
}

export interface DailyAttendance {
    employee: Employee;
    date: string; // YYYY-MM-DD format
    sessions: AttendanceSession[];
    total_hours: number;
    status: AttendanceStatus;
    first_in?: string;
    last_out?: string;
}

export type AttendanceStatus = 
    | "Present"      // Completed all sessions for the day
    | "Checked In"   // Currently has an open session
    | "On Break"     // Had sessions but currently clocked out during work hours
    | "Absent";      // No records for the day

export const ATTENDANCE_TYPES = {
    1: "TIME IN",
    2: "TIME OUT",
};

export const STATUS_COLORS = {
    "Present": "bg-green-100 text-green-800",
    "Checked In": "bg-blue-100 text-blue-800", 
    "On Break": "bg-yellow-100 text-yellow-800",
    "Absent": "bg-red-100 text-red-800",
};