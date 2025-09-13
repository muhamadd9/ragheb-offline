/**
 * Cron Jobs Module
 * 
 * This module contains all scheduled tasks and cron jobs for the application.
 * 
 * Structure:
 * - jobs/ - Individual job implementations
 * - cron.manager.ts - Centralized job management
 * - index.ts - Module exports
 */

export { default as CronManager } from './cron.manager';
export { default as AttendanceJob } from './jobs/attendance.job';

// Re-export for convenience
export { default } from './cron.manager';
