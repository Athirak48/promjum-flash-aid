import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trophy, Star, Medal, Timer, Globe, User2, Crown, Heart, Loader2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFriends } from "@/hooks/useFriends";
import { useXP } from "@/hooks/useXP";
import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { FriendRequestsPopover } from "@/components/friends/FriendRequestsPopover";
import { SetNicknameDialog } from "@/components/friends/SetNicknameDialog";

interface FriendsLeaderboardProps {
  isWidget?: boolean;
}

export function FriendsLeaderboard({ isWidget = false }: FriendsLeaderboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'xp' | 'challenge'>('xp');
  const [leaderboardScope, setLeaderboardScope] = useState<'world' | 'friends'>('friends');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showSetNickname, setShowSetNickname] = useState(false);

  // Real data from hooks
  const { friends, pendingRequests, loading: friendsLoading } = useFriends();
  const { xpData } = useXP();

  // Challenge data - will be populated from real database later
  const challengersWorld: any[] = [];
  const myChallengeRank = null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-md"><Crown className="w-4 h-4 text-white" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md"><Medal className="w-4 h-4 text-white" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center shadow-md"><Medal className="w-4 h-4 text-white" /></div>;
    return <span className="w-8 text-center font-black text-white/60 text-sm">#{rank}</span>;
  };

  const renderFriendItem = (friend: typeof friends[0], index: number) => (
    <motion.div
      key={friend.friendId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg bg-white/5 border-white/10 hover:border-purple-400/30 hover:bg-white/10"
    >
      <div className="flex-shrink-0">{getRankBadge(friend.rank)}</div>
      <div className="relative">
        <Avatar className="w-10 h-10 border-2 border-purple-300/50 shadow-sm">
          <AvatarImage src={friend.avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
            {friend.nickname?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-purple-400 text-white text-[8px] font-black px-1.5 py-[1px] rounded-full shadow">
          Lv.{friend.level}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate text-sm text-white">
          {friend.nickname}
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm font-black text-amber-300 bg-amber-400/20 border border-amber-300/40 px-2.5 py-1 rounded-full">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>{friend.totalXP.toLocaleString()}</span>
      </div>
    </motion.div>
  );

  const renderMyPosition = () => {
    const myRank = friends.length > 0 ? friends.length + 1 : 1; // Simplified
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-2xl border transition-all bg-purple-500/20 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
      >
        <div className="flex-shrink-0">{getRankBadge(myRank)}</div>
        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-purple-300/50 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
              ME
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-purple-400 text-white text-[8px] font-black px-1.5 py-[1px] rounded-full shadow">
            Lv.{xpData?.level || 1}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate text-sm text-purple-200">You</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-black text-amber-300 bg-amber-400/20 border border-amber-300/40 px-2.5 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{(xpData?.totalXP || 0).toLocaleString()}</span>
        </div>
      </motion.div>
    );
  };

  const renderChallengeItem = (player: typeof challengersWorld[0], index: number) => (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg ${player.isMe
        ? "bg-teal-500/20 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
        : "bg-white/5 border-white/10 hover:border-teal-400/30 hover:bg-white/10"
        }`}
    >
      <div className="flex-shrink-0">{getRankBadge(player.rank)}</div>
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-xl">
        {player.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate text-sm ${player.isMe ? 'text-teal-300' : 'text-white'}`}>
          {player.name}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-white/60">
          <Timer className="w-3 h-3" />
          <span>{player.time}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-black text-teal-300 bg-teal-400/20 border border-teal-300/40 px-2.5 py-1 rounded-full">
          {player.score}
        </span>
      </div>
    </motion.div>
  );

  return (
    <>
      <Card className="bg-black/30 backdrop-blur-xl border-white/10 h-full flex flex-col overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <CardHeader className="pb-4 p-0">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              {activeTab === 'xp' ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Users className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white drop-shadow-md">Friends</span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                    <Trophy className="w-5 h-5 text-teal-300" />
                  </div>
                  <span className="text-white drop-shadow-md">Challenge</span>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Go to Profile Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
                onClick={() => navigate('/profile')}
                title="โปรไฟล์"
              >
                <User2 className="w-4 h-4" />
              </Button>

              {/* Search Friend Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
                onClick={() => setShowAddFriend(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/10 border border-white/20 rounded-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('xp')}
              className={`rounded-full text-xs font-black transition-all ${activeTab === 'xp'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'}`}
            >
              ⭐ XP Rank
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('challenge')}
              className={`rounded-full text-xs font-black transition-all ${activeTab === 'challenge'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'}`}
            >
              🏆 Challenge
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-4 flex-1 flex flex-col min-h-0">
          <ScrollArea className="h-[240px] pr-2 custom-scrollbar">
            <div className="space-y-2 pb-4">
              {activeTab === 'xp' ? (
                friendsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  </div>
                ) : friends.length > 0 ? (
                  friends.map((friend, i) => renderFriendItem(friend, i))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-white/50">
                    <Users className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm font-medium">ยังไม่มีเพื่อน</p>
                    <Button
                      variant="link"
                      className="text-purple-400 text-xs mt-1"
                      onClick={() => setShowAddFriend(true)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" /> เพิ่มเพื่อนเลย!
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-white/50">
                  <Trophy className="w-12 h-12 mb-2 opacity-30" />
                  <p className="text-sm font-medium">Coming Soon!</p>
                  <p className="text-xs text-white/40 mt-1">Challenge leaderboard กำลังพัฒนา</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Your Position */}
          <div className="pt-3 mt-3 border-t border-dashed border-white/20">
            <p className="text-[10px] text-white/60 font-black text-center mb-2 uppercase tracking-widest">Your Rank 🌟</p>
            {activeTab === 'xp' ? renderMyPosition() : (
              <div className="text-center text-white/40 text-xs py-2">
                เร็วๆ นี้
              </div>
            )}

            {activeTab === 'challenge' && (
              <Button
                variant="link"
                className="w-full mt-2 text-xs text-white/70 hover:text-white h-auto py-1 font-bold"
                onClick={() => navigate('/vocab-challenge')}
              >
                View Full Leaderboard →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Friend Dialog */}
      <AddFriendDialog open={showAddFriend} onOpenChange={setShowAddFriend} />

      {/* Set Nickname Dialog */}
      <SetNicknameDialog open={showSetNickname} onOpenChange={setShowSetNickname} />
    </>
  );
}
