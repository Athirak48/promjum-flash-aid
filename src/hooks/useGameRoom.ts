import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface RoomPlayer {
    id: string;
    userId: string;
    nickname: string;
    avatarUrl: string | null;
    isReady: boolean;
    isHost: boolean;
    totalScore: number;
    totalTimeMs: number;
    finalRank: number | null;
}

export interface GameRoom {
    id: string;
    roomCode: string;
    hostId: string;
    status: 'waiting' | 'selecting' | 'playing' | 'finished';
    maxPlayers: number;
    selectedGames: string[];
    currentGameIndex: number;
    players: RoomPlayer[];
    vocabulary: RoomVocabulary[];
}

export interface RoomVocabulary {
    id: string;
    flashcardId: string;
    frontText: string;
    backText: string;
}

export interface GameResult {
    id: string;
    gameType: string;
    gameIndex: number;
    userId: string;
    score: number;
    timeMs: number;
    correctCount: number;
    totalCount: number;
    rank: number;
}

// Game type definitions
export const GAME_TYPES = {
    TIME_BASED: ['honeycomb', 'matching', 'ninja-slice'],
    SCORE_BASED: ['quiz', 'listen-choose', 'hangman', 'vocab-blinder', 'word-search', 'word-scramble']
} as const;

export const GAME_NAMES: Record<string, string> = {
    'honeycomb': 'Honey Hive',
    'matching': 'Matching Game',
    'ninja-slice': 'Ninja Slice',
    'quiz': 'Quiz Game',
    'listen-choose': 'Listen & Choose',
    'hangman': 'Hangman Master',
    'vocab-blinder': 'Vocab Blinder',
    'word-search': 'Word Search',
    'word-scramble': 'Word Scramble'
};

export function useGameRoom() {
    const { user } = useAuth();
    const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

    // Create a new room
    const createRoom = useCallback(async (maxPlayers: number = 5): Promise<{ success: boolean; roomCode?: string; error?: string }> => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc('create_game_room', {
                p_host_id: user.id,
                p_max_players: maxPlayers
            });

            if (rpcError) {
                setError(rpcError.message);
                return { success: false, error: rpcError.message };
            }

            if (data && data.length > 0) {
                const roomCode = data[0].room_code;
                // Load the room details
                await loadRoom(roomCode);
                return { success: true, roomCode };
            }

            return { success: false, error: 'Failed to create room' };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Join room by code
    const joinRoom = useCallback(async (roomCode: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc('join_room_by_code', {
                p_user_id: user.id,
                p_room_code: roomCode.toUpperCase()
            });

            if (rpcError) {
                setError(rpcError.message);
                return { success: false, error: rpcError.message };
            }

            const result = data?.[0];
            if (result?.success) {
                await loadRoom(roomCode);
                return { success: true };
            }

            return { success: false, error: result?.message || 'Failed to join room' };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load room details
    const loadRoom = useCallback(async (roomCode: string) => {
        try {
            // Get room
            const { data: roomData } = await supabase
                .from('game_rooms')
                .select('*')
                .eq('room_code', roomCode.toUpperCase())
                .single();

            if (!roomData) return;

            // Get players
            const { data: playersData } = await supabase
                .from('room_players')
                .select('*')
                .eq('room_id', roomData.id)
                .order('joined_at', { ascending: true });

            let playersWithProfile = [];

            if (playersData && playersData.length > 0) {
                const userIds = playersData.map(p => p.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, nickname, avatar_url')
                    .in('id', userIds);

                playersWithProfile = playersData.map(p => {
                    const profile = profilesData?.find(prof => prof.id === p.user_id);
                    return {
                        id: p.id,
                        userId: p.user_id,
                        nickname: profile?.nickname || p.nickname || 'Player',
                        avatarUrl: profile?.avatar_url || p.avatar_url,
                        isReady: p.is_ready,
                        isHost: p.is_host,
                        totalScore: p.total_score || 0,
                        totalTimeMs: p.total_time_ms || 0,
                        finalRank: p.final_rank
                    };
                });
            }

            // Get vocabulary
            const { data: vocabData } = await supabase
                .from('room_vocabulary')
                .select('*')
                .eq('room_id', roomData.id);

            const room: GameRoom = {
                id: roomData.id,
                roomCode: roomData.room_code,
                hostId: roomData.host_id,
                status: (roomData.status as GameRoom['status']) || 'waiting',
                maxPlayers: roomData.max_players,
                selectedGames: roomData.selected_games || [],
                currentGameIndex: roomData.current_game_index || 0,
                players: playersWithProfile,
                vocabulary: (vocabData || []).map(v => ({
                    id: v.id,
                    flashcardId: v.flashcard_id,
                    frontText: v.front_text,
                    backText: v.back_text
                }))
            };

            setCurrentRoom(room);
        } catch (err) {
            console.error('Error loading room:', err);
        }
    }, []);

    // Setup realtime subscription when room changes
    useEffect(() => {
        if (currentRoom?.id) {
            setupRealtime(currentRoom.id);
        }
    }, [currentRoom?.id]);

    // Setup realtime subscription
    const setupRealtime = useCallback((roomId: string) => {
        // Clean up existing subscription
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
        }

        const channel = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'game_rooms',
                filter: `id=eq.${roomId}`
            }, (payload) => {
                console.log('Room updated:', payload);
                if (currentRoom) {
                    loadRoom(currentRoom.roomCode);
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_players',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                console.log('Players updated:', payload);
                if (currentRoom) {
                    loadRoom(currentRoom.roomCode);
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_vocabulary',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                console.log('Vocabulary updated:', payload);
                if (currentRoom) {
                    loadRoom(currentRoom.roomCode);
                }
            })
            .subscribe();

        setRealtimeChannel(channel);
    }, [currentRoom, realtimeChannel, loadRoom]);

    // Toggle ready status
    const toggleReady = useCallback(async () => {
        if (!user || !currentRoom) return;

        const { error } = await supabase.rpc('toggle_player_ready', {
            p_room_id: currentRoom.id,
            p_user_id: user.id
        });

        if (error) {
            console.error('Error toggling ready:', error);
        }

        await loadRoom(currentRoom.roomCode);
    }, [user, currentRoom, loadRoom]);

    // Update room games
    const updateGames = useCallback(async (games: string[]) => {
        if (!user || !currentRoom || currentRoom.hostId !== user.id) return;

        await supabase
            .from('game_rooms')
            .update({ selected_games: games })
            .eq('id', currentRoom.id);

        await loadRoom(currentRoom.roomCode);
    }, [user, currentRoom, loadRoom]);

    // Add vocabulary to room
    const addVocabulary = useCallback(async (flashcards: Array<{ id: string; front: string; back: string }>) => {
        if (!user || !currentRoom) return;

        const vocabItems = flashcards.map(f => ({
            room_id: currentRoom.id,
            flashcard_id: f.id,
            front_text: f.front,
            back_text: f.back,
            added_by: user.id
        }));

        await supabase
            .from('room_vocabulary')
            .insert(vocabItems);

        await loadRoom(currentRoom.roomCode);
    }, [user, currentRoom, loadRoom]);

    // Clear vocabulary
    const clearVocabulary = useCallback(async () => {
        if (!currentRoom) return;

        await supabase
            .from('room_vocabulary')
            .delete()
            .eq('room_id', currentRoom.id);

        await loadRoom(currentRoom.roomCode);
    }, [currentRoom, loadRoom]);

    // Start game
    const startGame = useCallback(async () => {
        if (!user || !currentRoom || currentRoom.hostId !== user.id) return;

        // Check if all players are ready
        const allReady = currentRoom.players.every(p => p.isReady);
        if (!allReady) return { success: false, error: 'Not all players are ready' };

        // Check if games and vocabulary are selected
        if (currentRoom.selectedGames.length === 0) {
            return { success: false, error: 'Please select at least 1 game' };
        }
        if (currentRoom.vocabulary.length < 10) {
            return { success: false, error: 'Please add at least 10 vocabulary words' };
        }

        await supabase
            .from('game_rooms')
            .update({ status: 'playing', started_at: new Date().toISOString() })
            .eq('id', currentRoom.id);

        return { success: true };
    }, [user, currentRoom]);

    // Submit game result
    const submitResult = useCallback(async (
        gameType: string,
        score: number,
        timeMs: number,
        correctCount: number,
        totalCount: number
    ) => {
        if (!user || !currentRoom) return;

        await supabase.rpc('submit_game_result', {
            p_room_id: currentRoom.id,
            p_user_id: user.id,
            p_game_type: gameType,
            p_game_index: currentRoom.currentGameIndex,
            p_score: score,
            p_time_ms: timeMs,
            p_correct_count: correctCount,
            p_total_count: totalCount
        });
    }, [user, currentRoom]);

    // Next game
    const nextGame = useCallback(async () => {
        if (!user || !currentRoom || currentRoom.hostId !== user.id) return;

        const nextIndex = currentRoom.currentGameIndex + 1;

        if (nextIndex >= currentRoom.selectedGames.length) {
            // All games finished
            await supabase.rpc('calculate_final_rankings', {
                p_room_id: currentRoom.id
            });
        } else {
            await supabase
                .from('game_rooms')
                .update({ current_game_index: nextIndex })
                .eq('id', currentRoom.id);
        }
    }, [user, currentRoom]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (!user || !currentRoom) return;

        try {
            const { error } = await supabase.rpc('leave_game_room', {
                p_room_id: currentRoom.id,
                p_user_id: user.id
            });

            if (error) {
                console.error('Error leaving room:', error);
            }
        } catch (err) {
            console.error('Error calling leave_game_room:', err);
        }

        // Clean up
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
        }
        setCurrentRoom(null);
    }, [user, currentRoom, realtimeChannel]);

    // Get game results
    const getGameResults = useCallback(async (gameIndex?: number): Promise<GameResult[]> => {
        if (!currentRoom) return [];

        let query = supabase
            .from('game_results')
            .select('*')
            .eq('room_id', currentRoom.id);

        if (gameIndex !== undefined) {
            query = query.eq('game_index', gameIndex);
        }

        const { data } = await query.order('rank', { ascending: true });

        return (data || []).map(r => ({
            id: r.id,
            gameType: r.game_type,
            gameIndex: r.game_index,
            userId: r.user_id,
            score: r.score,
            timeMs: r.time_ms,
            correctCount: r.correct_count,
            totalCount: r.total_count,
            rank: r.rank
        }));
    }, [currentRoom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
            }
        };
    }, [realtimeChannel]);

    // Check if current user is host
    const isHost = user && currentRoom ? currentRoom.hostId === user.id : false;

    // Check if all players are ready
    const allPlayersReady = currentRoom ? currentRoom.players.every(p => p.isReady) : false;

    // Get current user's player data
    const currentPlayer = user && currentRoom
        ? currentRoom.players.find(p => p.userId === user.id)
        : null;

    return {
        currentRoom,
        loading,
        error,
        isHost,
        allPlayersReady,
        currentPlayer,
        createRoom,
        joinRoom,
        loadRoom,
        toggleReady,
        updateGames,
        addVocabulary,
        clearVocabulary,
        startGame,
        submitResult,
        nextGame,
        leaveRoom,
        getGameResults
    };
}
