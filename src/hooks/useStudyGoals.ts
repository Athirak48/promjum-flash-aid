import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { StudyGoal, CreateGoalInput } from '@/types/goals';
import { calculateGoalRequirements } from '@/types/goals';
import { differenceInDays, parseISO } from 'date-fns';

export function useStudyGoals() {
    const [goals, setGoals] = useState<StudyGoal[]>([]);
    const [activeGoal, setActiveGoal] = useState<StudyGoal | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Helper: Parse Metadata from Title (Hack due to missing table columns)
    // Format: "RealTitle__D{duration}__S{sessions}__K{deckId}"
    const unpackGoal = (row: any): StudyGoal => {
        let name = row.title;
        let duration = 30; // default
        let sessionsPerDay = 1;
        let deckIds: string[] = [];

        // Parse packed metadata using Regex for reliability
        // Format: Name__D{duration}__S{sessions}__K{deckId}
        const regex = /^(.*?)__D(\d+)(?:__S(\d+))?(?:__K([a-zA-Z0-9-]+))?$/;
        const match = row.title.match(regex);

        console.log("Unpacking goal title:", row.title);
        console.log("Regex match result:", match);

        if (match) {
            name = match[1];
            duration = parseInt(match[2]) || 30;
            if (match[3]) sessionsPerDay = parseInt(match[3]);
            if (match[4]) {
                deckIds = [match[4]]; // Captures the UUID after __K
                console.log("Extracted deck ID:", match[4]);
            }
        } else {
            // Fallback for simple titles or legacy format
            // Just take the title as name, assume defaults
            name = row.title;
            console.warn("Failed to parse goal title, using defaults");
        }

        // Calculate dynamic properties
        const createdAt = row.created_at || new Date().toISOString();

        // Calculate based on Progress (Flexible Pacing) instead of Calendar
        // This ensures if a user misses a few days, they don't jump ahead to "Day 5" without doing the work.
        const sessionsCompletedCalc = Math.floor(row.current_value / Math.max(1, Math.ceil(row.target_value / duration / Math.max(1, (sessionsPerDay || 1)))));

        // Use sessions_per_day to determine "Day"
        // Day 1 = Sessions 0 to (sessionsPerDay-1)
        // Day 2 = Sessions (sessionsPerDay) to (2*sessionsPerDay - 1)
        const calculatedDay = Math.floor((sessionsCompletedCalc) / Math.max(1, sessionsPerDay)) + 1;

        const currentDay = Math.min(Math.max(1, calculatedDay), duration + 1); // +1 allows "Victory" day logic

        // Infer sessions from target/duration if not saved
        if (sessionsPerDay === 1 && row.target_value > 0) {
            const wordsPerDay = Math.ceil(row.target_value / duration);
            // Formula: min(20, (day/2) + 3)
            const cap = Math.min(20, Math.floor((wordsPerDay / 2) + 3));
            sessionsPerDay = Math.ceil(wordsPerDay / Math.max(1, cap));
        }

        const wordsPerDay = Math.ceil(row.target_value / duration);
        let sessionsCalc = sessionsPerDay;

        // Recalculate to be sure (in case DB has old 'sessions' count but we want dynamic view)
        // Actually, we should trust saved sessionsPerDay if it was explicit?
        // But for "unpackGoal", we often rely on the 'S' tag.
        // If 'S' tag exists, use it. If standard fallback, use logic.

        const wordsPerSession = Math.ceil(wordsPerDay / sessionsPerDay);

        // Calculate sessions completed based on progress
        let sessionsCompleted = Math.floor(row.current_value / wordsPerSession);

        // FIX: For Day 1 (Pre-Test), if ANY progress is made (words learned > 0), 
        // we must count it as at least 1 session completed. 
        // Otherwise, low scores (e.g. 9 words < 20 words/session) result in 0 sessions 
        // and the "Start Pre-Test" button remains active.
        if (currentDay === 1 && row.current_value > 0) {
            sessionsCompleted = Math.max(1, sessionsCompleted);
        }

        return {
            id: row.id,
            user_id: row.user_id,
            goal_name: name,
            target_words: row.target_value,
            duration_days: duration,
            words_per_session: wordsPerSession,
            sessions_per_day: sessionsPerDay,
            is_active: !row.is_completed, // map generic is_completed to is_active logic
            created_at: createdAt,
            sessions_completed: sessionsCompleted, // Approx session count
            words_learned: row.current_value,
            current_day: currentDay,
            deck_ids: deckIds
        };
    };

    // Helper: Pack Metadata into Title
    const packTitle = (name: string, duration: number, sessions: number, deckId?: string) => {
        let title = `${name}__D${duration}__S${sessions}`;
        if (deckId) {
            title += `__K${deckId}`;
        }
        return title;
    };

    // Fetch all goals for current user
    const fetchGoals = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_goals')
                .select('*')
                .eq('user_id', user.id)
                .eq('goal_type', 'study_plan') // Filter only our hacked study plans
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedGoals = (data || []).map(unpackGoal);
            setGoals(mappedGoals);

            // Set active goal (first incomplete one)
            const active = mappedGoals.find(g => g.is_active) || null;
            setActiveGoal(active);
        } catch (error: any) {
            console.error('Error fetching goals:', error);
            // Silent error for UX
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Create new goal
    const createGoal = useCallback(async (input: CreateGoalInput & { deckIds?: string[] }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

            // Calculate requirements with Smart Logic
            const requirements = calculateGoalRequirements(
                input.targetWords,
                input.durationDays,
                input.targetSessionCap || 20,
                input.targetSessionsPerDay || 2,
                input.planningMode || 'duration'
            );

            // Deactivate any existing active goal
            await supabase
                .from('user_goals')
                .update({ is_completed: true })
                .eq('user_id', user.id)
                .eq('goal_type', 'study_plan')
                .eq('is_completed', false);

            // Determine primary deck ID
            const primaryDeckId = input.deckIds?.[0] || input.deckId;

            // Use SMART DURATION for persistence if available
            const finalDuration = requirements.smartDuration || input.durationDays;

            const packedTitle = packTitle(
                input.goalName,
                finalDuration,
                requirements.sessionsPerDay,
                primaryDeckId
            );

            // Create new goal
            // IMPORTANT: generic 'user_goals' table does NOT have deck_id column.
            console.log("Creating goal in DB...");
            console.log("Packed Title:", packedTitle);
            console.log("Primary Deck ID to save:", primaryDeckId);
            const { data, error } = await supabase
                .from('user_goals')
                .insert({
                    user_id: user.id,
                    title: packedTitle,
                    target_value: input.targetWords,
                    current_value: 0,
                    goal_type: 'study_plan',
                    is_completed: false, // active
                    icon_name: 'book', // default
                    emoji: '📚'
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase Insert Error:", error);
                throw error;
            }

            console.log("Goal created:", data);

            toast({
                title: 'สร้างเป้าหมายสำเร็จ! 🎯',
                description: `${input.goalName}: ${input.targetWords} คำ ใน ${input.durationDays} วัน`
            });

            console.log("Fetching latest goals...");
            await fetchGoals();
            console.log("Unpacking goal...");
            return unpackGoal(data);
        } catch (error: any) {
            console.error('Error creating goal (Caught):', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: error.message || 'ไม่สามารถสร้างเป้าหมายได้',
                variant: 'destructive'
            });
            return null;
        }
    }, [fetchGoals, toast]);

    // Update goal progress
    const updateProgress = useCallback(async (
        goalId: string,
        sessionsCompleted: number, // Unused in generic table directly, derived from words
        wordsLearned: number
    ) => {
        try {
            // Update words_learned (current_value)
            const { error } = await supabase
                .from('user_goals')
                .update({
                    current_value: wordsLearned
                })
                .eq('id', goalId);

            if (error) throw error;

            fetchGoals();
        } catch (error: any) {
            console.error('Error updating progress:', error);
        }
    }, [fetchGoals]);

    // Complete goal
    const completeGoal = useCallback(async (goalId: string) => {
        try {
            const { error } = await supabase
                .from('user_goals')
                .update({
                    is_completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', goalId);

            if (error) throw error;

            toast({
                title: 'เป้าหมายสำเร็จ! 🎉',
                description: 'ยินดีด้วย! คุณทำสำเร็จแล้ว'
            });

            fetchGoals();
        } catch (error: any) {
            console.error('Error completing goal:', error);
        }
    }, [fetchGoals, toast]);

    // Delete goal
    const deleteGoal = useCallback(async (goalId: string) => {
        try {
            const { error } = await supabase
                .from('user_goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;

            toast({
                title: 'ลบเป้าหมายแล้ว',
                description: 'ลบเป้าหมายเรียบร้อยแล้ว'
            });

            fetchGoals();
        } catch (error: any) {
            console.error('Error deleting goal:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบเป้าหมายได้',
                variant: 'destructive'
            });
        }
    }, [fetchGoals, toast]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Start Smart Session (Logic Engine)
    const startSmartSession = useCallback(async (goal: StudyGoal, navigate: any, isBonus: boolean = false, bonusType: 'random' | 'weak' = 'random', customLimit?: number) => {
        console.log("🚀 Starting Smart Session", goal, "Bonus Mode:", isBonus, "Type:", bonusType, "Limit:", customLimit);
        console.log("Goal deck_ids:", goal.deck_ids);
        try {

            setLoading(true);
            const currentDay = goal.current_day;
            const isPreTestDay = currentDay === 1;
            const isPostTestDay = currentDay === goal.duration_days;

            // Logic for Interim Tests: "At least 2 times"
            let isInterimTestDay = false;
            if (goal.duration_days < 14) {
                isInterimTestDay = (currentDay === 3 || currentDay === 6);
            } else {
                isInterimTestDay = (currentDay > 1 && currentDay % 7 === 0);
            }
            if (isPostTestDay) isInterimTestDay = false;

            // 1. EARLY EXIT: Assessments (Pre/Post/Interim)
            // Navigate directly to dedicated pages WITHOUT fetching cards here

            // Pre-Test
            if (isPreTestDay && goal.sessions_completed === 0 && !isBonus) {
                console.log("Triggering Pre-Test Page");
                navigate('/pre-test', {
                    state: {
                        goalId: goal.id,
                        deckIds: goal.deck_ids,
                        totalWords: goal.target_words // Optional hint
                    }
                });
                return;
            }

            // Post-Test
            if (isPostTestDay && goal.sessions_completed === 0 && !isBonus) {
                console.log("Triggering Final Post-Test");
                navigate('/post-test', {
                    state: {
                        goalId: goal.id,
                        deckIds: goal.deck_ids,
                        goalName: goal.goal_name
                    }
                });
                return;
            }

            // Interim Test
            if (isInterimTestDay && goal.sessions_completed === 0 && !isBonus) {
                console.log("Triggering Interim Test");
                navigate('/interim-test', {
                    state: {
                        goalId: goal.id,
                        deckIds: goal.deck_ids,
                        testNumber: Math.floor(currentDay / 7),
                        currentDay: currentDay
                    }
                });
                return;
            }

            const primaryDeckId = goal.deck_ids?.[0];
            console.log("Primary Deck ID:", primaryDeckId);

            if (!primaryDeckId) {
                console.error("Missing deck_ids in goal:", goal);
                throw new Error('ไม่พบข้อมูล Deck ในเป้าหมาย กรุณาลองสร้างเป้าหมายใหม่');
            }

            // Fetch flashcards from deck
            // Try user flashcard sets first (most common for goals)
            console.log("Fetching flashcards for deck:", primaryDeckId);
            // Query user deck: user_flashcard_sets -> user_flashcards
            let { data: userSets, error: setsError } = await supabase
                .from('user_flashcard_sets')
                .select('id')
                .eq('deck_id', primaryDeckId)
                .limit(100);

            let deckCards: any[] = [];
            let isUserDeck = false;

            if (userSets && userSets.length > 0) {
                // ... (existing logic)
                const setIds = userSets.map(s => s.id);
                const { data: userCards } = await supabase
                    .from('user_flashcards')
                    .select('*')
                    .in('flashcard_set_id', setIds)
                    .limit(500);

                if (userCards && userCards.length > 0) {
                    deckCards = userCards;
                    isUserDeck = true;
                }
            }

            // If no user cards found, try shared flashcards
            if (deckCards.length === 0) {
                const { data: sharedCards } = await supabase
                    .from('flashcards')
                    .select('*')
                    .eq('subdeck_id', primaryDeckId)
                    .limit(100);

                if (sharedCards && sharedCards.length > 0) {
                    deckCards = sharedCards;
                    isUserDeck = false;
                }
            }

            if (deckCards.length === 0) {
                throw new Error('Deck นี้ไม่มีคำศัพท์เลย กรุณาเพิ่มคำศัพท์ก่อนเริ่มเรียน');
            }

            console.log(`Found ${deckCards.length} flashcards`);

            // Normalize field names
            const normalizedCards = deckCards.map(card => ({
                id: card.id,
                front: isUserDeck ? card.front_text : card.front,
                back: isUserDeck ? card.back_text : card.back,
                deck_id: card.flashcard_set_id || card.subdeck_id,
                created_at: card.created_at
            }));

            // 2. Logic: Select Words based on Mode
            let sessionCards = [];
            let sessionPhases = ['flashcard', 'game'];
            let gameType = null;
            const isConsolidationDay = currentDay > 1 && currentDay % 5 === 0;

            if (isBonus) {
                // BONUS MODE logic
                sessionPhases = ['game'];
                gameType = 'quiz';

                if (bonusType === 'weak') {
                    const cardIds = normalizedCards.map(c => c.id);
                    const { data: progressData } = await supabase
                        .from('user_flashcard_progress')
                        .select('flashcard_id, srs_score')
                        .in('flashcard_id', cardIds);

                    const weakIds = (progressData || [])
                        .filter(p => p.srs_score < 3)
                        .map(p => p.flashcard_id);

                    sessionCards = normalizedCards.filter(c => weakIds.includes(c.id));

                    if (sessionCards.length === 0) {
                        sessionCards = normalizedCards.sort(() => 0.5 - Math.random()).slice(0, 20);
                        toast({ title: "No weak words found, using random selection." });
                    } else {
                        const limit = customLimit || 30;
                        sessionCards = sessionCards.slice(0, limit);
                        toast({
                            title: "Dangerous Words Review ⚠️",
                            description: `Focusing on ${sessionCards.length} critical words.`,
                            className: "bg-red-500 text-white border-red-600"
                        });
                    }
                } else {
                    sessionCards = normalizedCards.sort(() => 0.5 - Math.random()).slice(0, 20);
                    toast({
                        title: "Bonus Round Activated! 🔥",
                        description: "ฝึกฝนพิเศษกับคำศัพท์แบบสุ่ม x20 คำ",
                        className: "bg-pink-500 text-white border-pink-600"
                    });
                }
            } else if (isConsolidationDay) {
                // Consolidation Day logic
                const cardIds = normalizedCards.map(c => c.id);
                const { data: progressData } = await supabase
                    .from('user_flashcard_progress')
                    .select('flashcard_id, srs_score')
                    .in('flashcard_id', cardIds);

                const weakIds = (progressData || [])
                    .filter(p => p.srs_score < 3)
                    .map(p => p.flashcard_id);

                const weakCards = normalizedCards.filter(c => weakIds.includes(c.id));
                const otherCards = normalizedCards.filter(c => !weakIds.includes(c.id));

                const selectedWeak = weakCards.sort(() => 0.5 - Math.random()).slice(0, 14);
                const selectedOthers = otherCards.sort(() => 0.5 - Math.random()).slice(0, 20 - selectedWeak.length);

                sessionCards = [...selectedWeak, ...selectedOthers];
                sessionPhases = ['flashcard', 'game'];

                toast({
                    title: "Consolidation Day 🧠",
                    description: `ทบทวนจุดอ่อน ${selectedWeak.length} คำ + ทั่วไป ${selectedOthers.length} คำ`,
                    className: "bg-emerald-500 text-white border-emerald-600"
                });
            } else {
                // Normal Day - SMART LOGIC (Respect Pre-Test & Progress)

                // 1. Fetch Progress for ALL candidate cards
                const cardIds = normalizedCards.map(c => c.id);
                // Chunking request if too large? (assume < 500 for now)

                const { data: progressData } = await supabase
                    .from('user_flashcard_progress')
                    .select('flashcard_id, srs_level')
                    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                    .in('flashcard_id', cardIds);

                const knownMap = new Set((progressData || [])
                    .filter(p => p.srs_level >= 3)
                    .map(p => p.flashcard_id)
                );

                // 2. Filter out Known Words
                const unknownCards = normalizedCards.filter(c => !knownMap.has(c.id));
                const knownCards = normalizedCards.filter(c => knownMap.has(c.id));

                console.log(`Smart Session: ${unknownCards.length} new/learning words, ${knownCards.length} known words.`);

                // 3. Select Next Batch
                // We use goal.words_learned as a cursor, but we must apply it to the UNKNOWN pool.
                // Actually, simply taking the first N unknown cards is the most robust "flow".
                // Since we sorted/retrieved deckCards earlier, if they have an order, we respect it.
                // If the deck is random, this is random.

                const limit = goal.words_per_session || 20;

                if (unknownCards.length > 0) {
                    sessionCards = unknownCards.slice(0, limit);

                    // If we ran out of new words but need to fill the session?
                    // Maybe mix in some review words (goldilocks zone srs 2)?
                    if (sessionCards.length < limit) {
                        const reviewFiller = knownCards.slice(0, limit - sessionCards.length);
                        sessionCards = [...sessionCards, ...reviewFiller];
                    }
                } else {
                    // All words known! Review Mode? or just grab random knowns?
                    sessionCards = knownCards.sort(() => 0.5 - Math.random()).slice(0, limit);
                    toast({
                        title: "All words mastered! 🎓",
                        description: "Reviewing known words to keep them fresh."
                    });
                }
            }

            // 3. Map to VocabItem
            const selectedVocab = sessionCards.map(c => ({
                id: c.id,
                front_text: c.front,
                back_text: c.back,
                part_of_speech: 'noun',
                isUserFlashcard: false
            }));

            navigate('/learning-session', {
                state: {
                    phases: sessionPhases,
                    selectedVocab,
                    selectedModes: { flashcard: true, game: true },
                    gameType,
                    showPreTestIntro: false, // Explicitly false now as handled by dedicated page
                    activeGoalId: isBonus ? null : goal.id
                }
            });

        } catch (e: any) {
            console.error('Start session error:', e);
            toast({
                title: "Error starting session",
                description: e.message || "ไม่สามารถเริ่มบทเรียนได้ กรุณาลองใหม่",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        goals,
        activeGoal,
        loading,
        createGoal,
        updateProgress,
        completeGoal,
        deleteGoal,
        refetch: fetchGoals,
        startSmartSession
    };
}
