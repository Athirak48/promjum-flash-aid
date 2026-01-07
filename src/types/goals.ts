import { Database } from '@/integrations/supabase/types';

// Study Goal types - Manually defined to bridge the gap with user_goals table
export interface StudyGoal {
    id: string;
    user_id: string;
    goal_name: string;
    target_words: number;
    duration_days: number;
    words_per_session?: number;
    sessions_per_day?: number;
    is_active: boolean;
    created_at: string;
    sessions_completed: number;
    words_learned: number;
    current_day: number;
    deck_ids?: string[];
}
// export type StudyGoal = Database['public']['Tables']['user_goals']['Row'];
export type StudyGoalInsert = Database['public']['Tables']['user_goals']['Insert'];
export type StudyGoalUpdate = Database['public']['Tables']['user_goals']['Update'];

// Goal calculation result
// Goal calculation result
export interface GoalRequirements {
    wordsPerDay: number;
    sessionsPerDay: number;
    wordsPerSession: number;
    estimatedTimePerDay: number; // minutes
    difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Intense' | 'Extreme';
    // Smart Stats
    totalReps?: number;
    consolidationDays?: number;
    assessmentDays?: number;
    smartDuration?: number;
}

// Goal creation input
export interface CreateGoalInput {
    goalName: string;
    targetWords: number;
    durationDays: number;
    deckId: string;
    // Smart inputs
    planningMode?: 'duration' | 'intensity';
    targetSessionCap?: number;
    targetSessionsPerDay?: number;
}

// Helper function to calculate goal requirements
export function calculateGoalRequirements(
    targetWords: number,
    durationDays: number | null,
    targetSessionCap: number = 20,
    targetSessionsPerDay: number = 2,
    planningMode: 'duration' | 'intensity' = 'duration'
): GoalRequirements {
    // Safety checks
    const safeTarget = Math.max(0, targetWords || 0);

    // --- 1. Total Rep Volume (The "Hidden Workload") ---
    // Formula: Target Words * 2.0 (Safety Buffer for Reviews)
    const totalRepVolume = Math.ceil(safeTarget * 2.0);

    // --- 2. Daily Capacity Strategy ---
    let dailyCapacity = 0;

    // Effective Session Cap: User Input clamped at 20 (Hard Cap) 
    // Actually user might want lower (e.g. 15), but we never allow > 20.
    const effectiveSessionCap = Math.min(20, Math.max(5, targetSessionCap));

    if (planningMode === 'intensity') {
        // Mode B: User fixes "Words/Round" (Intensity)
        // Daily Capacity = WordsPerSession * SessionsPerDay
        dailyCapacity = effectiveSessionCap * Math.max(1, targetSessionsPerDay);
    } else {
        // Mode A: User fixes "Duration"
        // We try to fit into the duration, but we check if it breaks the bucket.
        // For calculation simplicity, let's reverse derive.
        const requestedDuration = Math.max(1, durationDays || 1);
        dailyCapacity = Math.ceil(totalRepVolume / requestedDuration);
    }

    // --- 3. Raw Learning Duration (Bucket Calculation) ---
    // How many days to clear the "Rep Volume" with "Daily Capacity"?
    const rawLearningDays = Math.ceil(totalRepVolume / Math.max(1, dailyCapacity));

    // --- 4. Periodization (The "4:1 Cycle") ---
    // Every 4 days of learning -> 1 Consolidation Day
    const consolidationDays = Math.floor(rawLearningDays / 4);

    // --- 5. Assessment Days (The "Sprint") ---
    // Pre-Test (1) + Post-Test (1) + Interim (At least 2, or every 7 days)
    // User Request: "Want at least 2 interim tests"
    const standardInterim = Math.floor(rawLearningDays / 7);
    const interimTests = Math.max(2, standardInterim);

    // Safety: If raw learning is tiny (< 3 days), maybe 2 interim is too much?
    // But user requested "At least 2". Let's honor it, worst case plan is longer.

    const assessmentDays = 1 + 1 + interimTests; // Pre + Post + Interim (~4 days min)

    // --- 6. Total Smart Duration ---
    let calculatedDuration = rawLearningDays + consolidationDays + assessmentDays;

    // Constraint: Minimum 5 Days
    if (calculatedDuration < 5) {
        calculatedDuration = 5;
    }

    // --- Final Mapping ---
    // If Mode is Duration, we stick to user duration for the "Display", 
    // BUT we should warn if calculatedDuration > durationDays (Impossible).
    // For this helper, we return the "Smart" values.

    // Derived Average Stats (for Display)
    const finalDuration = (planningMode === 'duration' && durationDays) ? durationDays : calculatedDuration;
    const wordsPerDay = Math.ceil(safeTarget / finalDuration);

    // For sessions per day:
    // If Intensity Mode: use input.
    // If Duration Mode: derive from capacity needed.
    let sessionsPerDay = targetSessionsPerDay;
    if (planningMode === 'duration') {
        // Capacity needed covers the volume.
        // effectiveSessionCap is the max we allow per session.
        const requiredDailyReps = Math.ceil(totalRepVolume / finalDuration);
        sessionsPerDay = Math.ceil(requiredDailyReps / effectiveSessionCap);
    }

    // Estimate time per day (10 min per session)
    const timePerDay = sessionsPerDay * 10;

    // Determine difficulty
    let difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Intense' | 'Extreme';
    if (sessionsPerDay === 1) difficulty = 'Easy';
    else if (sessionsPerDay === 2) difficulty = 'Moderate';
    else if (sessionsPerDay === 3) difficulty = 'Challenging';
    else if (sessionsPerDay <= 5) difficulty = 'Intense';
    else difficulty = 'Extreme'; // > 5 sessions/day is unrealistic

    return {
        wordsPerDay, // Display Only
        sessionsPerDay,
        wordsPerSession: effectiveSessionCap,
        estimatedTimePerDay: timePerDay,
        difficulty,
        // Smart Stats
        totalReps: totalRepVolume,
        consolidationDays,
        assessmentDays,
        smartDuration: calculatedDuration
    };
}
