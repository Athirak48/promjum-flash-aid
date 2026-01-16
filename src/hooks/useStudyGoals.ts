import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { StudyGoal, CreateGoalInput } from '@/types/goals';
import { calculateGoalRequirements } from '@/types/goals';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

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

        // console.log("Unpacking goal title:", row.title);

        if (match) {
            name = match[1];
            duration = parseInt(match[2]) || 30;
            if (match[3]) sessionsPerDay = parseInt(match[3]);
            if (match[4]) {
                deckIds = [match[4]]; // Captures the UUID after __K
            }
        } else {
            // Fallback for simple titles or legacy format
            // Just take the title as name, assume defaults
            name = row.title;
            // console.warn("Failed to parse goal title, using defaults");
        }

        // Calculate dynamic properties
        const createdAt = row.created_at || new Date().toISOString();

        // CRITICAL FIX: Calendar-Based Day Calculation
        // ... (comments retained)

        const goalStartDate = startOfDay(parseISO(createdAt));
        const today = startOfDay(new Date());
        const daysSinceStart = differenceInDays(today, goalStartDate);

        // current_day = days since start + 1 (Day 1 on creation day)
        // Capped at duration + 1 for "Victory" day
        const currentDay = Math.min(Math.max(1, daysSinceStart + 1), duration + 1);

        // Infer sessions from target/duration if not saved
        // FIX: Naive division (Target / Duration) fails because it ignores Non-Learning Days (Tests/Consolidation).
        // For a 7-day goal, we might only have 4-5 actual learning days.
        // We apple a "Safety Buffer" of ~20% for overhead days to boost daily intensity.
        const effectiveDuration = Math.max(1, Math.floor(duration * 0.8));
        const wordsPerDay = Math.ceil(row.target_value / effectiveDuration);

        let sessionsCalc = sessionsPerDay;

        // Recalculate 'words_per_session' dynamically
        // Note: srs_per_day is loaded from Title (S tag) usually.
        const wordsPerSession = Math.max(1, Math.ceil(wordsPerDay / sessionsPerDay));

        // Calculate sessions completed based on progress
        let sessionsCompleted = Math.floor(row.current_value / wordsPerSession);

        // FIX: For Day 1 (Pre-Test), if ANY progress is made (words learned > 0), 
        // we must count it as at least 1 session completed. 
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
            is_active: !row.is_completed,
            created_at: createdAt,
            sessions_completed: sessionsCompleted,
            words_learned: row.current_value,
            current_value: row.current_value || 0,
            current_day: currentDay,
            deck_ids: deckIds.length > 0 ? deckIds : []
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
    }, []); // Removed 'toast' dependency to stabilize reference

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
                .eq('goal_type', 'study_plan');
            // .eq('is_completed', false); // Removing this ensures even NULL or weird states are archived

            // Determine primary deck ID
            const primaryDeckId = input.deckIds?.[0] || input.deckId;

            // FIX: If user explicit set duration (Duration Mode), we MUST respect it.
            // verifying that 'smartDuration' suggests a safe buffer, but user authority is final.
            const isDurationMode = input.planningMode === 'duration' || !input.planningMode;
            const finalDuration = isDurationMode ? input.durationDays : (requirements.smartDuration || input.durationDays);

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

    // Delete goal (Cascade manually + SRS Deep Clean)
    const deleteGoal = useCallback(async (goalId: string) => {
        try {
            console.log("Deleting goal:", goalId);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 0. FETCH GOAL DETAILS for SRS RESET
            const { data: goalRaw } = await supabase
                .from('user_goals')
                .select('*')
                .eq('id', goalId)
                .single();

            if (goalRaw) {
                const goal = unpackGoal(goalRaw);
                const deckIds = goal.deck_ids;

                if (deckIds && deckIds.length > 0) {
                    console.log(`🧹 SRS Deep Clean: Resetting progress for decks: ${deckIds.join(',')}`);

                    // 1. Fetch related card IDs
                    // Check User Flashcards
                    const { data: userCards } = await supabase
                        .from('user_flashcards')
                        .select('id')
                        .in('flashcard_set_id', deckIds);
                    const userCardIds = userCards?.map(c => c.id) || [];

                    // Check System/Community Flashcards
                    const { data: sysCards } = await supabase
                        .from('flashcards')
                        .select('id')
                        .in('subdeck_id', deckIds);
                    const sysCardIds = sysCards?.map(c => c.id) || [];

                    const allCardIds = [...userCardIds, ...sysCardIds];

                    if (allCardIds.length > 0) {
                        // 2. DELETE PROGRESS (Hard Reset)
                        // Delete by flashcard_id (System cards)
                        if (sysCardIds.length > 0) {
                            await supabase
                                .from('user_flashcard_progress')
                                .delete()
                                .eq('user_id', user.id)
                                .in('flashcard_id', sysCardIds);
                        }

                        // Delete by user_flashcard_id (User cards)
                        if (userCardIds.length > 0) {
                            await supabase
                                .from('user_flashcard_progress')
                                .delete()
                                .eq('user_id', user.id)
                                .in('user_flashcard_id', userCardIds);
                        }

                        console.log(`✨ Wiped SRS memory for ${allCardIds.length} cards.`);

                        toast({
                            title: 'Memory Reset 🧠',
                            description: `Reset progress for ${allCardIds.length} words. Fresh start!`,
                        });
                    }
                }
            }

            // 1. Delete dependent assessments
            // @ts-ignore
            const { error: assessError } = await supabase
                .from('goal_assessments')
                .delete()
                .eq('goal_id', goalId);

            if (assessError) console.warn("Error deleting assessments for goal:", assessError);

            // 2. Delete dependent practice sessions
            const { error: sessionError } = await supabase
                .from('practice_sessions')
                .delete()
                .eq('goal_id', goalId);

            if (sessionError) console.warn("Error deleting sessions for goal:", sessionError);

            // 3. Delete the goal itself
            const { error } = await supabase
                .from('user_goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;

            toast({
                title: 'ลบเป้าหมายแล้ว',
                description: 'ลบเป้าหมายและข้อมูลการจำทั้งหมดเรียบร้อยแล้ว'
            });

            // Reset active goal immediately in local state
            setActiveGoal(null);

            await fetchGoals();
        } catch (error: any) {
            console.error('Error deleting goal:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบเป้าหมายได้: ' + (error.message || ''),
                variant: 'destructive'
            });
        }
    }, [fetchGoals, toast]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Start Smart Session (Logic Engine)
    const startSmartSession = useCallback(async (
        goal: StudyGoal,
        navigate: any,
        isBonus: boolean = false,
        bonusType: 'random' | 'weak' = 'random',
        customLimit?: number,
        goalConfig?: any // Added for Pacing Strategy
    ) => {
        console.log("🚀 ========== START SMART SESSION DEBUG ==========");
        console.log("Goal object:", JSON.stringify(goal, null, 2));
        console.log("Goal deck_ids:", goal.deck_ids);
        console.log("Bonus Mode:", isBonus, "Type:", bonusType, "Limit:", customLimit);

        try {
            if (!goal) {
                console.error("❌ CRITICAL: Goal is null or undefined!");
                toast({
                    title: 'ข้อผิดพลาด',
                    description: 'ไม่พบข้อมูลเป้าหมาย กรุณาลองรีเฟรชหน้าเว็บ',
                    variant: 'destructive'
                });
                return;
            }

            setLoading(true);
            const currentDay = goal.current_day;
            const isPreTestDay = currentDay === 1;
            const isPostTestDay = currentDay === goal.duration_days;

            console.log("📅 Current Day:", currentDay);
            console.log("📝 Is Pre-Test Day:", isPreTestDay);

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
                // Fix: Check if Pre-Test is ACTUALLY done (via assessments table)
                // because sessions_completed might be 0 if they learned 0 words (rare but possible)
                console.log("Checking if Pre-Test is already completed...");
                const { data: existingPreTest } = await supabase
                    .from('goal_assessments')
                    .select('id')
                    .eq('goal_id', goal.id)
                    .eq('assessment_type', 'pre-test')
                    .maybeSingle();

                if (!existingPreTest) {
                    console.log("✅ Triggering Pre-Test Page");
                    console.log("Navigation params:", {
                        goalId: goal.id,
                        deckIds: goal.deck_ids,
                        totalWords: goal.target_words
                    });

                    if (!goal.deck_ids || goal.deck_ids.length === 0) {
                        console.error("❌ CRITICAL: deck_ids is empty or undefined!");
                        toast({
                            title: 'ข้อมูลเป้าหมายไม่สมบูรณ์ ⚠️',
                            description: 'เป้าหมายนี้ไม่มีข้อมูล Deck\nกรุณาลบเป้าหมายแล้วสร้างใหม่อีกครั้ง',
                            variant: 'destructive'
                        });
                        setLoading(false);
                        return;
                    }

                    navigate('/pre-test', {
                        state: {
                            goalId: goal.id,
                            deckIds: goal.deck_ids,
                            totalWords: goal.target_words // Optional hint
                        }
                    });
                    console.log("✅ Navigation to /pre-test executed");
                    return;
                } else {
                    console.log("⚠️ Pre-Test found in history! Proceeding to Standard Session.");
                }
            }

            console.log("⏭️ Skipping Pre-Test (sessions_completed:", goal.sessions_completed, ")");

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

            // ---------------------------------------------------------
            // 2. NORMAL SESSION: Navigate to Multi-Game Session Wrapper
            // ---------------------------------------------------------
            // We pass the "goal" context. The Session Page will use useOptimalCards to fetch cards.
            console.log("🚀 Navigating to Multi-Game Session...");
            navigate('/multi-game-session', {
                state: {
                    goalId: goal.id,
                    mode: isBonus ? 'bonus' : 'start', // 'start' = Pacing logic, 'bonus' = Review logic
                    bonusType: isBonus ? bonusType : undefined,
                    goalName: goal.goal_name,
                    customLimit: customLimit,
                    goalConfig: goalConfig // New: Pass config for Pacing Strategy
                }
            });
            return; // EXIT HERE to bypass legacy logic

            const primaryDeckId = goal.deck_ids?.[0];
            console.log("Primary Deck ID:", primaryDeckId);
            console.log("All deck_ids:", goal.deck_ids);

            if (!primaryDeckId || !goal.deck_ids || goal.deck_ids.length === 0) {
                console.error("Missing deck_ids in goal:", goal);
                toast({
                    title: 'ข้อมูลเป้าหมายไม่สมบูรณ์ ⚠️',
                    description: 'ไม่พบข้อมูล Deck ในเป้าหมายนี้ กรุณาสร้างเป้าหมายใหม่',
                    variant: 'destructive'
                });
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
