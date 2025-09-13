export interface CreateStudentDto {
    student_id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone_number: string;
    guardian_number: string;
    birth_date?: string | null; // YYYY-MM-DD
    national_id?: string | null;
    gender: string;
    level: number;
    school_name?: string | null;
    is_subscription?: boolean;
    subscription_date?: string | null; // YYYY-MM-DD
    uid: number;
    archived?: boolean;
    blocked?: boolean;
    group_id?: number | null;
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> { }


