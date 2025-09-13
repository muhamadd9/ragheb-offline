import * as cron from 'node-cron';
import { Op } from 'sequelize';
import { sequelize } from '../../DB/dbConfig';
import Attendance from '../../DB/model/Attendance.model';
import Student from '../../DB/model/Student.model';
import Group from '../../DB/model/Group.model';
import { getCurrentDay, getTodayDate } from '../../utils/time.helper';

/**
 * Attendance Automation Job
 * Runs every hour from 09:00 to 23:59
 * Marks students as absent if they haven't attended within 1 hour of group start time
 */
class AttendanceJob {
    private cronExpression = '0 9-23 * * *'; // Every hour from 9 AM to 11 PM
    private job: cron.ScheduledTask | null = null;

    /**
     * Start the attendance automation job
     */
    public start(): void {
        if (this.job) {
            console.log('[CRON] Attendance job is already running');
            return;
        }

        this.job = cron.schedule(this.cronExpression, async () => {
            try {
                console.log(`[CRON] Running attendance automation at ${new Date().toISOString()}`);
                await this.processAttendanceAutomation();
            } catch (error) {
                console.error('[CRON] Error in attendance automation:', error);
            }
        }, {
            timezone: 'Asia/Riyadh' // Adjust timezone as needed
        });

        this.job.start();
        console.log('[CRON] Attendance automation job started');
    }

    /**
     * Stop the attendance automation job
     */
    public stop(): void {
        if (this.job) {
            this.job.stop();
            this.job = null;
            console.log('[CRON] Attendance automation job stopped');
        }
    }

    /**
     * Process attendance automation
     */
    private async processAttendanceAutomation(): Promise<void> {
        const currentDay = getCurrentDay();
        const today = getTodayDate();
        const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
        const currentHour = new Date().getHours();

        console.log(`[CRON] Processing attendance for ${currentDay} at ${currentTime}`);

        // Find all groups that are scheduled for today
        const groupsForToday = await Group.findAll({
            where: {
                [Op.and]: [
                    sequelize.literal(`JSON_CONTAINS(days, '"${currentDay}"')`)
                ]
            }
        });

        console.log(`[CRON] Found ${groupsForToday.length} groups scheduled for ${currentDay}`);

        for (const group of groupsForToday) {
            await this.processGroupAttendance(group, today, currentHour);
        }
    }

    /**
     * Process attendance for a specific group
     */
    private async processGroupAttendance(group: any, today: string, currentHour: number): Promise<void> {
        const groupId = group.get('id');
        const groupName = group.get('group_name');
        const startTime = group.get('start_time');
        const [startHour] = startTime.split(':').map(Number);

        // Check if group start time has passed by more than 1 hour
        const timeDifference = currentHour - startHour;

        if (timeDifference < 1) {
            console.log(`[CRON] Group "${groupName}" (${startTime}) - Start time not yet passed 1 hour`);
            return;
        }

        console.log(`[CRON] Processing group "${groupName}" (${startTime}) - Start time passed 1 hour ago`);

        // Get all students in this group
        const students = await Student.findAll({
            where: {
                group_id: groupId,
                blocked: false,
                archived: false
            }
        });

        if (students.length === 0) {
            console.log(`[CRON] No active students found in group "${groupName}"`);
            return;
        }

        // Get students who already have attendance records for today
        const existingAttendance = await Attendance.findAll({
            where: {
                group_id: groupId,
                attendance_date: today
            },
            attributes: ['student_id']
        });

        const attendedStudentIds = existingAttendance.map(att => att.get('student_id'));

        // Find students who haven't attended
        const absentStudents = students.filter(student =>
            !attendedStudentIds.includes(student.get('student_id'))
        );

        if (absentStudents.length === 0) {
            console.log(`[CRON] All students in group "${groupName}" have already attended`);
            return;
        }

        // Create absent attendance records
        const absentRecords = absentStudents.map(student => ({
            group_id: groupId,
            student_id: student.get('student_id'),
            attendance_date: today,
            status: 'absent' as const,
            recorded_by: null, // System recorded
            recorded_at: new Date()
        }));

        try {
            await Attendance.bulkCreate(absentRecords);
            console.log(`[CRON] Created ${absentRecords.length} absent records for group "${groupName}"`);
        } catch (error) {
            console.error(`[CRON] Error creating absent records for group "${groupName}":`, error);
        }
    }

    /**
     * Get job status
     */
    public getStatus(): { running: boolean; expression: string } {
        return {
            running: this.job !== null,
            expression: this.cronExpression
        };
    }
}

export default new AttendanceJob();
