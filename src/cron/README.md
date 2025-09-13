# Cron Jobs Module

This module contains all scheduled tasks and cron jobs for the application.

## Structure

```
src/cron/
├── jobs/                    # Individual job implementations
│   └── attendance.job.ts   # Attendance automation job
├── cron.manager.ts         # Centralized job management
├── index.ts               # Module exports
└── README.md              # This file
```

## Jobs

### Attendance Job

**Schedule**: Every hour from 09:00 to 23:59 (15 times per day)
**Purpose**: Automatically mark students as absent if they haven't attended within 1 hour of group start time

**Logic**:
1. Runs every hour from 9 AM to 11 PM
2. Finds all groups scheduled for the current day
3. For each group where start time has passed by more than 1 hour:
   - Gets all active students in the group
   - Checks which students haven't attended today
   - Creates absent attendance records for those students

## Usage

### Initialize Cron Jobs

```typescript
import CronManager from './cron';

// Initialize all cron jobs
await CronManager.initialize();
```

### Get Job Status

```typescript
// Get status of all jobs
const status = CronManager.getJobsStatus();

// Get status of specific job
const attendanceStatus = CronManager.getJobStatus('attendance');
```

### Control Jobs

```typescript
// Start a specific job
CronManager.startJob('attendance');

// Stop a specific job
CronManager.stopJob('attendance');

// Stop all jobs
await CronManager.stopAllJobs();
```

## Configuration

### Timezone
The cron jobs use 'Asia/Riyadh' timezone by default. You can change this in the job files.

### Schedule
- **Attendance Job**: `0 9-23 * * *` (every hour from 9 AM to 11 PM)

## Adding New Jobs

1. Create a new job file in `jobs/` directory
2. Implement the job class with `start()`, `stop()`, and `getStatus()` methods
3. Register the job in `cron.manager.ts`
4. Export it in `index.ts`

## Example Job Structure

```typescript
import cron from 'node-cron';

class MyJob {
    private cronExpression = '0 */2 * * *'; // Every 2 hours
    private job: cron.ScheduledTask | null = null;

    public start(): void {
        this.job = cron.schedule(this.cronExpression, async () => {
            // Job logic here
        }, {
            scheduled: false,
            timezone: 'Asia/Riyadh'
        });
        
        this.job.start();
    }

    public stop(): void {
        if (this.job) {
            this.job.stop();
            this.job = null;
        }
    }

    public getStatus(): { running: boolean; expression: string } {
        return {
            running: this.job !== null,
            expression: this.cronExpression
        };
    }
}

export default new MyJob();
```
