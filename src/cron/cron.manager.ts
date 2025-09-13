import AttendanceJob from './jobs/attendance.job';

/**
 * Cron Job Manager
 * Centralized management of all cron jobs
 */
class CronManager {
    private jobs: Map<string, any> = new Map();
    private isInitialized = false;

    /**
     * Initialize all cron jobs
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('[CRON] Cron manager already initialized');
            return;
        }

        try {
            // Register all jobs
            this.registerJob('attendance', AttendanceJob);

            // Start all jobs
            await this.startAllJobs();

            this.isInitialized = true;
            console.log('[CRON] Cron manager initialized successfully');
        } catch (error) {
            console.error('[CRON] Error initializing cron manager:', error);
            throw error;
        }
    }

    /**
     * Register a cron job
     */
    private registerJob(name: string, jobInstance: any): void {
        this.jobs.set(name, jobInstance);
        console.log(`[CRON] Registered job: ${name}`);
    }

    /**
     * Start all registered jobs
     */
    private async startAllJobs(): Promise<void> {
        for (const [name, job] of this.jobs) {
            try {
                if (typeof job.start === 'function') {
                    job.start();
                    console.log(`[CRON] Started job: ${name}`);
                }
            } catch (error) {
                console.error(`[CRON] Error starting job ${name}:`, error);
            }
        }
    }

    /**
     * Stop all jobs
     */
    public async stopAllJobs(): Promise<void> {
        for (const [name, job] of this.jobs) {
            try {
                if (typeof job.stop === 'function') {
                    job.stop();
                    console.log(`[CRON] Stopped job: ${name}`);
                }
            } catch (error) {
                console.error(`[CRON] Error stopping job ${name}:`, error);
            }
        }
    }

    /**
     * Get status of all jobs
     */
    public getJobsStatus(): Record<string, any> {
        const status: Record<string, any> = {};

        for (const [name, job] of this.jobs) {
            if (typeof job.getStatus === 'function') {
                status[name] = job.getStatus();
            } else {
                status[name] = { running: 'unknown' };
            }
        }

        return status;
    }

    /**
     * Get specific job status
     */
    public getJobStatus(jobName: string): any {
        const job = this.jobs.get(jobName);
        if (!job) {
            return { error: 'Job not found' };
        }

        if (typeof job.getStatus === 'function') {
            return job.getStatus();
        }

        return { running: 'unknown' };
    }

    /**
     * Start a specific job
     */
    public startJob(jobName: string): boolean {
        const job = this.jobs.get(jobName);
        if (!job) {
            console.error(`[CRON] Job ${jobName} not found`);
            return false;
        }

        try {
            if (typeof job.start === 'function') {
                job.start();
                console.log(`[CRON] Started job: ${jobName}`);
                return true;
            }
        } catch (error) {
            console.error(`[CRON] Error starting job ${jobName}:`, error);
        }

        return false;
    }

    /**
     * Stop a specific job
     */
    public stopJob(jobName: string): boolean {
        const job = this.jobs.get(jobName);
        if (!job) {
            console.error(`[CRON] Job ${jobName} not found`);
            return false;
        }

        try {
            if (typeof job.stop === 'function') {
                job.stop();
                console.log(`[CRON] Stopped job: ${jobName}`);
                return true;
            }
        } catch (error) {
            console.error(`[CRON] Error stopping job ${jobName}:`, error);
        }

        return false;
    }
}

export default new CronManager();
