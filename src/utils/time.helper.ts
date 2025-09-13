/**
 * Time utility functions for attendance system
 */

export interface TimeWindow {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    isActive: boolean;
}

/**
 * Get current day name in English (e.g., "Monday", "Tuesday")
 */
export const getCurrentDay = (): string => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get current time in HH:MM format
 */
export const getCurrentTime = (): string => {
    return new Date().toTimeString().slice(0, 5);
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if current time is within a time window (1 hour before + 1 hour after start time)
 */
export const isWithinTimeWindow = (startTime: string, beforeMinutes: number = 60, afterMinutes: number = 60): boolean => {
    const currentTime = getCurrentTime();
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(startTime);

    const timeDifference = currentMinutes - startMinutes;
    // Allow attendance from 1 hour before to 1 hour after start time
    return timeDifference >= -beforeMinutes && timeDifference <= afterMinutes;
};

/**
 * Get time window information for a given start time (1 hour before + 1 hour after)
 */
export const getTimeWindow = (startTime: string, beforeMinutes: number = 60, afterMinutes: number = 60): TimeWindow => {
    const startMinutes = timeToMinutes(startTime);
    const windowStartMinutes = startMinutes - beforeMinutes;
    const windowEndMinutes = startMinutes + afterMinutes;

    return {
        startTime: minutesToTime(windowStartMinutes),
        endTime: minutesToTime(windowEndMinutes),
        isActive: isWithinTimeWindow(startTime, beforeMinutes, afterMinutes)
    };
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Format time difference in a human-readable way
 */
export const formatTimeDifference = (startTime: string): string => {
    const currentTime = getCurrentTime();
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(startTime);

    const difference = currentMinutes - startMinutes;

    if (difference < 0) {
        const absDiff = Math.abs(difference);
        const hours = Math.floor(absDiff / 60);
        const minutes = absDiff % 60;
        return `${hours}h ${minutes}m before start`;
    } else if (difference === 0) {
        return "Just started";
    } else {
        const hours = Math.floor(difference / 60);
        const minutes = difference % 60;
        return `${hours}h ${minutes}m after start`;
    }
};

/**
 * Day groups for attendance tracking
 * Students can only attend once per group of days
 */
export const DAY_GROUPS = {
    GROUP_1: ['Saturday', 'Sunday', 'Monday'],
    GROUP_2: ['Tuesday', 'Wednesday', 'Thursday']
} as const;

/**
 * Get the day group that contains the given day
 */
export const getDayGroup = (day: string): readonly string[] | null => {
    if (DAY_GROUPS.GROUP_1.includes(day as any)) {
        return DAY_GROUPS.GROUP_1;
    }
    if (DAY_GROUPS.GROUP_2.includes(day as any)) {
        return DAY_GROUPS.GROUP_2;
    }
    return null;
};

/**
 * Check if two days are in the same group
 */
export const areDaysInSameGroup = (day1: string, day2: string): boolean => {
    const group1 = getDayGroup(day1);
    const group2 = getDayGroup(day2);
    return group1 !== null && group2 !== null && group1 === group2;
};
