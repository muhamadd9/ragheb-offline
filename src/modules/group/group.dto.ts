import { DayOfWeek } from "../../DB/model/Group.model";

export interface CreateGroupDto {
    group_name: string;
    start_time: string; // e.g. HH:MM
    level: number; // 1..3
    days: DayOfWeek[];
}

export interface UpdateGroupDto extends Partial<CreateGroupDto> { }


