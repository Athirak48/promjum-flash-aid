import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FriendProfile {
    userId: string;
    nickname: string;
    avatarUrl: string | null;
    totalXP: number;
    level: number;
    friendshipStatus: 'pending' | 'accepted' | 'rejected' | 'blocked' | null;
}

export interface Friend {
    friendId: string;
    nickname: string;
    avatarUrl: string | null;
    totalXP: number;
    level: number;
    rank: number;
}

export interface FriendRequest {
    requestId: string;
    requesterId: string;
    nickname: string;
    avatarUrl: string | null;
    totalXP: number;
    level: number;
    requestedAt: string;
}

export function useFriends() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
    const [searching, setSearching] = useState(false);

    // Load friends list
    const loadFriends = useCallback(async () => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        console.log('🔄 Loading friends for user:', user.id);

        try {
            const { data, error } = await supabase.rpc('get_friends_leaderboard', {
                p_user_id: user.id
            });

            console.log('📊 Friends data:', { data, error });

            if (error) {
                console.error('❌ Error loading friends:', error);
                return;
            }

            if (data) {
                console.log('✅ Friends loaded:', data.length);
                setFriends(data.map((f: any) => ({
                    friendId: f.friend_id,
                    nickname: f.nickname || 'Unknown',
                    avatarUrl: f.avatar_url,
                    totalXP: f.total_xp || 0,
                    level: f.level || 1,
                    rank: f.rank
                })));
            } else {
                console.log('⚠️ No friends data returned');
            }
        } catch (err) {
            console.error('💥 Error in loadFriends:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load pending requests
    const loadPendingRequests = useCallback(async () => {
        if (!user) {
            setPendingRequests([]);
            return;
        }

        console.log('📨 Loading pending requests for:', user.id);

        try {
            const { data, error } = await supabase.rpc('get_pending_friend_requests', {
                p_user_id: user.id
            });

            console.log('📬 Pending requests data:', { data, error });

            if (error) {
                console.error('❌ Error loading pending requests:', error);
                return;
            }

            if (data && data.length > 0) {
                console.log('✅ Found pending requests:', data.length);
                setPendingRequests(data.map((r: any) => ({
                    requestId: r.request_id,
                    requesterId: r.requester_id,
                    nickname: r.nickname || 'Unknown',
                    avatarUrl: r.avatar_url,
                    totalXP: r.total_xp || 0,
                    level: r.level || 1,
                    requestedAt: r.requested_at
                })));
            } else {
                console.log('⚠️ No pending requests found');
                setPendingRequests([]);
            }
        } catch (err) {
            console.error('💥 Error in loadPendingRequests:', err);
        }
    }, [user]);



    // Search users by nickname using database function
    const searchUsers = useCallback(async (query: string) => {
        if (!user || !query.trim()) {
            setSearchResults([]);
            return;
        }

        const searchQuery = query.trim();
        console.log('🔍 Searching users with query:', searchQuery);

        setSearching(true);
        try {
            // Use RPC function for proper search
            const { data, error } = await supabase.rpc('search_users_by_nickname', {
                p_search_query: searchQuery,
                p_current_user_id: user.id
            });

            console.log('📋 Search results:', { data, error });

            if (error) {
                console.error('❌ Search error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log('⚠️ No users found');
                setSearchResults([]);
                return;
            }

            console.log('✅ Found users:', data.length);

            // Map results to FriendProfile type
            const results: FriendProfile[] = data.map((u: any) => ({
                userId: u.user_id,
                nickname: u.nickname || 'Unknown',
                avatarUrl: u.avatar_url,
                totalXP: u.total_xp || 0,
                level: u.level || 1,
                friendshipStatus: u.friendship_status || null
            }));

            console.log('✅ Final results:', results);
            setSearchResults(results);

        } catch (err) {
            console.error('💥 Error in searchUsers:', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [user]);



    // Send friend request
    const sendFriendRequest = useCallback(async (addresseeId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            // Check if already friends or pending
            const { data: existing, error: checkError } = await supabase
                .from('friendships')
                .select('id, status')
                .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
                .maybeSingle();

            if (existing) {
                if (existing.status === 'accepted') return { success: false, message: 'เป็นเพื่อนกันอยู่แล้ว' };
                if (existing.status === 'pending') return { success: false, message: 'รอการตอบกลับ' };
                if (existing.status === 'blocked') return { success: false, message: 'ไม่สามารถส่งคำขอได้' };
            }

            // Direct Insert
            console.log('📤 Inserting friendship:', { requester_id: user.id, addressee_id: addresseeId });

            const { error } = await supabase
                .from('friendships')
                .insert({
                    requester_id: user.id,
                    addressee_id: addresseeId,
                    status: 'pending'
                });

            if (error) {
                console.error('❌ Error sending friend request:', error);
                // Handle specific error codes
                if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('409')) {
                    return { success: false, message: 'ได้ส่งคำขอไปแล้ว' };
                }
                return { success: false, message: error.message || 'ไม่สามารถส่งคำขอได้' };
            }

            console.log('✅ Friend request sent successfully!');
            return { success: true, message: 'Friend request sent' };

        } catch (err: any) {
            console.error('💥 Error in sendFriendRequest:', err);
            return { success: false, message: err?.message || 'Failed to send request' };
        }
    }, [user]);

    // Accept friend request
    const acceptRequest = useCallback(async (requestId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase.rpc('accept_friend_request', {
                p_user_id: user.id,
                p_request_id: requestId
            });

            if (error) {
                console.error('Error accepting request:', error);
                return { success: false, message: error.message };
            }

            const result = data?.[0];
            if (result?.success) {
                // Refresh lists
                await Promise.all([loadFriends(), loadPendingRequests()]);
            }

            return { success: result?.success || false, message: result?.message || 'Unknown error' };
        } catch (err) {
            console.error('Error in acceptRequest:', err);
            return { success: false, message: 'Failed to accept request' };
        }
    }, [user, loadFriends, loadPendingRequests]);

    // Reject friend request
    const rejectRequest = useCallback(async (requestId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase.rpc('reject_friend_request', {
                p_user_id: user.id,
                p_request_id: requestId
            });

            if (error) {
                console.error('Error rejecting request:', error);
                return { success: false, message: error.message };
            }

            const result = data?.[0];
            if (result?.success) {
                // Refresh pending list
                await loadPendingRequests();
            }

            return { success: result?.success || false, message: result?.message || 'Unknown error' };
        } catch (err) {
            console.error('Error in rejectRequest:', err);
            return { success: false, message: 'Failed to reject request' };
        }
    }, [user, loadPendingRequests]);

    // Remove friend
    const removeFriend = useCallback(async (friendId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase.rpc('remove_friend', {
                p_user_id: user.id,
                p_friend_id: friendId
            });

            if (error) {
                console.error('Error removing friend:', error);
                return { success: false, message: error.message };
            }

            const result = data?.[0];
            if (result?.success) {
                // Refresh friends list
                await loadFriends();
            }

            return { success: result?.success || false, message: result?.message || 'Unknown error' };
        } catch (err) {
            console.error('Error in removeFriend:', err);
            return { success: false, message: 'Failed to remove friend' };
        }
    }, [user, loadFriends]);

    // Clear search results
    const clearSearch = useCallback(() => {
        setSearchResults([]);
    }, []);

    // Initial load
    useEffect(() => {
        loadFriends();
        loadPendingRequests();
    }, [loadFriends, loadPendingRequests]);

    return {
        friends,
        pendingRequests,
        searchResults,
        loading,
        searching,
        searchUsers,
        sendFriendRequest,
        acceptRequest,
        rejectRequest,
        removeFriend,
        clearSearch,
        refreshFriends: loadFriends,
        refreshRequests: loadPendingRequests,
    };
}
