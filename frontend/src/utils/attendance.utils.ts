// utils/attendanceUtils.ts
import {
    type AttendanceRecord,
    type AttendanceSession,
    type DailyAttendance,
    type AttendanceStatus,
} from "../types/attendance";

export const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const calculateMinutesBetween = (start: string, end: string): number => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};

export const processAttendanceRecords = (
    records: AttendanceRecord[],
    targetDate: string
): DailyAttendance[] => {
    // Group records by employee and filter by date
    const employeeRecords = new Map<number, AttendanceRecord[]>();

    records.forEach((record) => {
        // Fix: Extract date part directly to avoid timezone issues
        const recordDate = record.timestamp.split("T")[0];
        if (recordDate === targetDate) {
            const employeeId = record.employee.id;
            if (!employeeRecords.has(employeeId)) {
                employeeRecords.set(employeeId, []);
            }
            employeeRecords.get(employeeId)!.push(record);
        }
    });

    const dailyAttendance: DailyAttendance[] = [];

    employeeRecords.forEach((empRecords, employeeId) => {
        // Sort records by timestamp
        empRecords.sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        );

        const sessions: AttendanceSession[] = [];
        let currentSession: AttendanceSession | null = null;
        let totalMinutes = 0;

        empRecords.forEach((record) => {
            if (record.attendance_type === 1) {
                // TIME_IN
                // If there's already an open session, close it first (handle missing TIME_OUT)
                if (currentSession) {
                    sessions.push(currentSession);
                }
                // Start new session
                currentSession = {
                    time_in: record.timestamp,
                };
            } else if (record.attendance_type === 2 && currentSession) {
                // TIME_OUT
                // End current session
                const duration = calculateMinutesBetween(
                    currentSession.time_in,
                    record.timestamp
                );
                currentSession.time_out = record.timestamp;
                currentSession.duration_minutes = duration;
                totalMinutes += duration;
                sessions.push(currentSession);
                currentSession = null;
            }
        });

        // If there's an open session, add it without time_out
        if (currentSession) {
            sessions.push(currentSession);
        }

        // Determine status
        const status = determineStatus(sessions, targetDate);

        dailyAttendance.push({
            employee: empRecords[0].employee, // Use first record's employee data
            date: targetDate,
            sessions,
            total_hours: totalMinutes / 60,
            status,
            first_in: sessions.length > 0 ? sessions[0].time_in : undefined,
            last_out:
                sessions.length > 0 && sessions[sessions.length - 1].time_out
                    ? sessions[sessions.length - 1].time_out
                    : undefined,
        });
    });

    return dailyAttendance;
};

const determineStatus = (
    sessions: AttendanceSession[],
    targetDate: string
): AttendanceStatus => {
    if (sessions.length === 0) {
        return "Absent";
    }

    const lastSession = sessions[sessions.length - 1];

    // If last session has no time_out, employee is currently checked in
    if (!lastSession.time_out) {
        return "Checked In";
    }

    // Check if it's still working hours and employee might be on break
    const now = new Date();
    const targetDateTime = new Date(targetDate);
    const isToday = targetDateTime.toDateString() === now.toDateString();

    if (isToday) {
        const currentHour = now.getHours();
        const workingHours = currentHour >= 8 && currentHour < 18; // 8 AM to 6 PM

        if (workingHours) {
            const lastOutTime = new Date(lastSession.time_out);
            const minutesSinceLastOut =
                (now.getTime() - lastOutTime.getTime()) / (1000 * 60);

            // If clocked out recently (within 4 hours) during working hours, might be on break
            if (minutesSinceLastOut < 240) {
                return "On Break";
            }
        }
    }

    return "Present";
};

export const getAllEmployeesWithAttendance = (
    allEmployees: any[],
    attendanceData: DailyAttendance[]
): DailyAttendance[] => {
    const attendanceMap = new Map(
        attendanceData.map((att) => [att.employee.id, att])
    );

    return allEmployees.map((employee) => {
        const existing = attendanceMap.get(employee.id);
        if (existing) {
            return existing;
        }

        // Create absent record for employees with no attendance
        return {
            employee,
            date:
                attendanceData.length > 0
                    ? attendanceData[0].date
                    : new Date().toISOString().split("T")[0],
            sessions: [],
            total_hours: 0,
            status: "Absent" as AttendanceStatus,
        };
    });
};
