
import type { WorkOrderHistoryEntry } from './types';

/**
 * Calculates the total time elapsed in business hours between a start date and now.
 * Business hours are defined as:
 * - Monday to Friday: 8:00 AM to 6:00 PM (18:00)
 * - Saturday: 8:00 AM to 1:00 PM (13:00)
 * - Sunday & other times: Excluded
 */
export function calculateBusinessTimeInStage(history: WorkOrderHistoryEntry[]): string {
    if (!history || history.length === 0) {
        return '0d 0h 0m';
    }

    // Sort history to be sure, then get the last entry for the current stage start time
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentStageEntry = sortedHistory[sortedHistory.length - 1];
    
    if (!currentStageEntry) {
        return '0d 0h 0m';
    }

    const startDate = new Date(currentStageEntry.date);
    const now = new Date();

    if (startDate > now) {
        return '0d 0h 0m';
    }

    let totalMilliseconds = 0;
    let current = new Date(startDate);

    while (current < now) {
        const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;

        if (isSunday) {
            const nextDay = new Date(current);
            nextDay.setDate(current.getDate() + 1);
            nextDay.setHours(8, 0, 0, 0); // Move to start of next business day
            current = nextDay;
            continue;
        }

        const businessStartHour = 8;
        const businessEndHour = isSaturday ? 13 : 18; // 1 PM on Sat, 6 PM on weekdays

        const startOfBusinessDay = new Date(current);
        startOfBusinessDay.setHours(businessStartHour, 0, 0, 0);

        const endOfBusinessDay = new Date(current);
        endOfBusinessDay.setHours(businessEndHour, 0, 0, 0);

        // Determine the real start and end times for the calculation interval on this day
        const effectiveStart = Math.max(current.getTime(), startOfBusinessDay.getTime());
        const effectiveEnd = Math.min(now.getTime(), endOfBusinessDay.getTime());
        
        if (effectiveEnd > effectiveStart) {
            totalMilliseconds += effectiveEnd - effectiveStart;
        }
        
        // Move to the start of the next calendar day to continue iteration
        const nextDay = new Date(current);
        nextDay.setDate(current.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        current = nextDay;
    }
    
    if (totalMilliseconds < 0) totalMilliseconds = 0;
    
    const BUSINESS_DAY_HOURS = 8; // Assuming an 8-hour business day for display purposes
    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const totalBusinessHours = totalMinutes / 60;
    
    const days = Math.floor(totalBusinessHours / BUSINESS_DAY_HOURS);
    const hours = Math.floor(totalBusinessHours % BUSINESS_DAY_HOURS);
    const minutes = totalMinutes % 60;

    return `${days}d ${hours}h ${minutes}m`;
}

export function calculateBusinessMillisecondsInStage(history: WorkOrderHistoryEntry[]): number {
    if (!history || history.length === 0) return 0;

    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentStageEntry = sortedHistory[sortedHistory.length - 1];
    
    if (!currentStageEntry) return 0;

    const startDate = new Date(currentStageEntry.date);
    const now = new Date();

    if (startDate > now) return 0;

    let totalMilliseconds = 0;
    let current = new Date(startDate);

    while (current < now) {
        const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;

        if (isSunday) {
            const nextDay = new Date(current);
            nextDay.setDate(current.getDate() + 1);
            nextDay.setHours(8, 0, 0, 0); // Move to start of next business day
            current = nextDay;
            continue;
        }

        const businessStartHour = 8;
        const businessEndHour = isSaturday ? 13 : 18; // 1 PM on Sat, 6 PM on weekdays

        const startOfBusinessDay = new Date(current);
        startOfBusinessDay.setHours(businessStartHour, 0, 0, 0);

        const endOfBusinessDay = new Date(current);
        endOfBusinessDay.setHours(businessEndHour, 0, 0, 0);

        const effectiveStart = Math.max(current.getTime(), startOfBusinessDay.getTime());
        const effectiveEnd = Math.min(now.getTime(), endOfBusinessDay.getTime());
        
        if (effectiveEnd > effectiveStart) {
            totalMilliseconds += effectiveEnd - effectiveStart;
        }
        
        const nextDay = new Date(current);
        nextDay.setDate(current.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        current = nextDay;
    }
    
    return totalMilliseconds < 0 ? 0 : totalMilliseconds;
}
