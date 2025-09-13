// DTOs for attendance module
export interface CreateAttendanceDto {
    group_id?: number;
    student_id: number;
    attendance_date?: string;
    status?: 'present' | 'absent';
    recorded_by?: number;
}

export interface UpdateAttendanceDto {
    status?: 'present' | 'absent';
    recorded_by?: number;
}

export interface UpdateAttendanceStatusDto {
    student_id: number;
    group_id?: number;
    attendance_date?: string;
}
