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

        try {
            const { data, error } = await supabase.rpc('get_friends_leaderboard', {
                p_user_id: user.id
            });

            if (error) {
                console.error('Error loading friends:', error);
                return;
            }

            if (data) {
                setFriends(data.map((f: any) => ({
                    friendId: f.friend_id,
                    nickname: f.nickname || 'Unknown',
                    avatarUrl: f.avatar_url,
                    totalXP: f.total_xp || 0,
                    level: f.level || 1,
                    rank: f.rank
                })));
            }
        } catch (err) {
            console.error('Error in loadFriends:', err);
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

        try {
            const { data, error } = await supabase.rpc('get_pending_friend_requests', {
                p_user_id: user.id
            });

            if (error) {
                console.error('Error loading pending requests:', error);
                return;
            }

            if (data) {
                setPendingRequests(data.map((r: any) => ({
                    requestId: r.request_id,
                    requesterId: r.requester_id,
                    nickname: r.nickname || 'Unknown',
                    avatarUrl: r.avatar_url,
                    totalXP: r.total_xp || 0,
                    level: r.level || 1,
                    requestedAt: r.requested_at
                })));
            }
        } catch (err) {
            console.error('Error in loadPendingRequests:', err);
        }
    }, [user]);

    // Search users by nickname
    const searchUsers = useCallback(async (query: string) => {
        if (!user || !query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const { data, error } = await supabase.rpc('search_users_by_nickname', {
                p_search_query: query.trim(),
                p_current_user_id: user.id
            });

            if (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
                return;
            }

            if (data) {
                setSearchResults(data.map((u: any) => ({
                    userId: u.user_id,
                    nickname: u.nickname || 'Unknown',
                    avatarUrl: u.avatar_url,
                    totalXP: u.total_xp || 0,
                    level: u.level || 1,
                    friendshipStatus: u.friendship_status
                })));
            }
        } catch (err) {
            console.error('Error in searchUsers:', err);
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
            const { data, error } = await supabase.rpc('send_friend_request', {
                p_requester_id: user.id,
                p_addressee_id: addresseeId
            });

            if (error) {
                console.error('Error sending friend request:', error);
                return { success: false, message: error.message };
            }

            const result = data?.[0];
            if (result) {
                // Refresh search results to update status
                return { success: result.success, message: result.message };
            }

            return { success: false, message: 'Unknown error' };
        } catch (err) {
            console.error('Error in sendFriendRequest:', err);
            return { success: false, message: 'Failed to send request' };
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
