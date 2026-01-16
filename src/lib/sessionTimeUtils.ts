import { differenceInMinutes, setHours, setMinutes, startOfDay, endOfDay, addMinutes, format } from 'date-fns';

export interface SessionTimeWindow {
    start: Date;
    end: Date;
    canStart: boolean;
    status: 'locked' | 'ready' | 'missed' | 'completed';
    minutesUntilStart?: number;
}

/**
 * Calculate Time Window using Midpoint Rule
 * - First Session: 00:00 to Midpoint
 * - Middle Session: Prev Midpoint to Next Midpoint
 * - Last Session: Prev Midpoint to 23:59
 */
export function getSessionWindow(
    allSessionTimes: string[],
    index: number,
    currentTime: Date = new Date()
): SessionTimeWindow {
    const today = startOfDay(currentTime);

    // Helper to parser time string "HH:mm" to Date object for today
    const getTimeDate = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return setMinutes(setHours(today, hours), minutes);
    };

    let startTime: Date;
    let endTime: Date;

    const currentSessionTime = getTimeDate(allSessionTimes[index]);

    // --- 1. Calculate Start Time ---
    if (index === 0) {
        // First Session: Starts at 00:00
        startTime = today;
    } else {
        // Middle/Last Session: Starts at midpoint of previous gap
        const prevSessionTime = getTimeDate(allSessionTimes[index - 1]);
        const diffMinutes = differenceInMinutes(currentSessionTime, prevSessionTime);
        const halfDiff = Math.floor(diffMinutes / 2); // Round down to give overlap safety

        // Start = Prev + Half
        startTime = addMinutes(prevSessionTime, halfDiff);
    }

    // --- 2. Calculate End Time ---
    if (index === allSessionTimes.length - 1) {
        // Last Session: Ends at 23:59
        endTime = endOfDay(today);
    } else {
        // Middle Session: Ends at midpoint of next gap (-1 minute)
        const nextSessionTime = getTimeDate(allSessionTimes[index + 1]);
        const diffMinutes = differenceInMinutes(nextSessionTime, currentSessionTime);
        const halfDiff = Math.floor(diffMinutes / 2);

        // End = Current + Half - 1 minute
        endTime = addMinutes(currentSessionTime, halfDiff - 1); // -1 minute to prevent exact overlap
    }

    // --- 3. Determine Status ---
    const now = currentTime;
    let status: 'locked' | 'ready' | 'missed' = 'locked';
    let minutesUntilStart: number | undefined;

    if (now >= startTime && now <= endTime) {
        status = 'ready';
    } else if (now < startTime) {
        status = 'locked';
        minutesUntilStart = differenceInMinutes(startTime, now);
    } else if (now > endTime) {
        status = 'missed';
    }

    return {
        start: startTime,
        end: endTime,
        canStart: status === 'ready',
        status: status as any, // 'completed' is handled by caller checking DB
        minutesUntilStart
    };
}

/**
 * Get formatted time range string (e.g., "00:00 - 11:29")
 */
export function getWindowLabel(window: SessionTimeWindow): string {
    return `${format(window.start, 'HH:mm')} - ${format(window.end, 'HH:mm')}`;
}
