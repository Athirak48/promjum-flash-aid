import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trophy, Star, Medal, Timer, Globe, User2, Crown, Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface FriendsLeaderboardProps {
  isWidget?: boolean;
}

export function FriendsLeaderboard({ isWidget = false }: FriendsLeaderboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'xp' | 'challenge'>('challenge');
  const [leaderboardScope, setLeaderboardScope] = useState<'world' | 'friends'>('world');

  // Mock data
  const friendsXP = [
    { id: 1, name: "Sarah M.", avatar: "https://i.pravatar.cc/150?u=sarah", xp: 1250, rank: 1, level: 8, isMe: false },
    { id: 2, name: "Mike T.", avatar: "https://i.pravatar.cc/150?u=mike", xp: 1180, rank: 2, level: 7, isMe: false },
    { id: 3, name: "Emily R.", avatar: "https://i.pravatar.cc/150?u=emily", xp: 1050, rank: 3, level: 6, isMe: false },
    { id: 4, name: "David K.", avatar: "https://i.pravatar.cc/150?u=david", xp: 980, rank: 4, level: 5, isMe: false },
    { id: 5, name: "Anna L.", avatar: "https://i.pravatar.cc/150?u=anna", xp: 920, rank: 5, level: 5, isMe: false },
    { id: 6, name: "Tom W.", avatar: "https://i.pravatar.cc/150?u=tom", xp: 880, rank: 6, level: 4, isMe: false },
  ];
  const myXPRank = { id: 99, name: "You", avatar: "https://i.pravatar.cc/150?u=me", xp: 720, rank: 12, level: 4, isMe: true };

  const challengersWorld = [
    { id: 1, name: "Somchai_TH", avatar: "🐰", time: "01:12.45", score: "30/30", rank: 1, isMe: false },
    { id: 2, name: "EmmaW", avatar: "🐱", time: "01:15.20", score: "30/30", rank: 2, isMe: false },
    { id: 3, name: "Kenji_JP", avatar: "🐻", time: "01:16.88", score: "30/30", rank: 3, isMe: false },
    { id: 4, name: "Lisa_KR", avatar: "🐼", time: "01:22.33", score: "29/30", rank: 4, isMe: false },
    { id: 5, name: "Alex_US", avatar: "🦊", time: "01:25.11", score: "29/30", rank: 5, isMe: false },
    { id: 6, name: "Maria_BR", avatar: "🐨", time: "01:28.05", score: "28/30", rank: 6, isMe: false },
  ];

  const challengersFriends = [
    { id: 1, name: "Mike T.", avatar: "🐼", time: "01:35.20", score: "28/30", rank: 1, isMe: false },
    { id: 2, name: "Sarah M.", avatar: "🐱", time: "01:40.50", score: "27/30", rank: 2, isMe: false },
    { id: 3, name: "Emily R.", avatar: "🐶", time: "01:42.10", score: "27/30", rank: 3, isMe: false },
    { id: 4, name: "David K.", avatar: "🐨", time: "01:48.00", score: "26/30", rank: 4, isMe: false },
  ];

  const challengers = leaderboardScope === 'world' ? challengersWorld : challengersFriends;
  const myChallengeRank = { id: 99, name: "You", avatar: "🐰", time: "01:45.30", score: "27/30", rank: leaderboardScope === 'world' ? 15 : 5, isMe: true };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-md shadow-yellow-300/40"><Crown className="w-4 h-4 text-white" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md"><Medal className="w-4 h-4 text-white" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center shadow-md shadow-orange-300/40"><Medal className="w-4 h-4 text-white" /></div>;
    return <span className="w-8 text-center font-black text-slate-400 text-sm">#{rank}</span>;
  };

  const renderXPItem = (friend: typeof friendsXP[0], index: number) => (
    <motion.div
      key={friend.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.01] ${friend.isMe
        ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800"
        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-pink-200"
        }`}
    >
      <div className="flex-shrink-0">{getRankBadge(friend.rank)}</div>
      <div className="relative">
        <Avatar className="w-10 h-10 border-2 border-pink-100 dark:border-pink-800 shadow-sm">
          <AvatarImage src={friend.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-pink-200 to-pink-300 text-pink-700 font-bold">{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-pink-400 text-white text-[8px] font-black px-1.5 py-[1px] rounded-full shadow">
          Lv.{friend.level}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate text-sm ${friend.isMe ? 'text-pink-500' : 'text-slate-700 dark:text-slate-100'}`}>
          {friend.name}
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>{friend.xp.toLocaleString()}</span>
      </div>
    </motion.div>
  );

  const renderChallengeItem = (player: typeof challengers[0], index: number) => (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.01] ${player.isMe
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200"
        }`}
    >
      <div className="flex-shrink-0">{getRankBadge(player.rank)}</div>
      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shadow-inner">
        {player.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate text-sm ${player.isMe ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-100'}`}>
          {player.name}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Timer className="w-3 h-3" />
          <span>{player.time}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
          {player.score}
        </span>
      </div>
    </motion.div>
  );

  return (
    <Card className="h-full bg-white dark:bg-slate-900 border-2 border-pink-100 dark:border-pink-900/30 shadow-lg flex flex-col overflow-hidden rounded-[2rem] hover:shadow-xl hover:border-pink-200 transition-all duration-300">
      <CardHeader className="pb-4 px-5 pt-5">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            {activeTab === 'xp' ? (
              <>
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center shadow-md shadow-pink-300/40">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-pink-500">Friends</span>
                <span className="text-lg animate-wiggle">💖</span>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-300/40">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-emerald-500">Challenge</span>
                <span className="text-lg animate-wiggle">🏆</span>
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-pink-400 hover:text-pink-500 hover:bg-pink-50 rounded-full h-9 w-9">
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Toggle Buttons */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-pink-50 dark:bg-pink-900/20 rounded-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('challenge')}
            className={`rounded-full text-xs font-black transition-all ${activeTab === 'challenge'
              ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'}`}
          >
            🏆 Challenge
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('xp')}
            className={`rounded-full text-xs font-black transition-all ${activeTab === 'xp'
              ? 'bg-white dark:bg-slate-800 text-pink-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'}`}
          >
            ⭐ XP Rank
          </Button>
        </div>

        {/* Scope Toggle */}
        {activeTab === 'challenge' && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeaderboardScope('world')}
              className={`rounded-full px-4 h-8 text-xs font-bold gap-1.5 ${leaderboardScope === 'world'
                ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-500'
                : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeaderboardScope('friends')}
              className={`rounded-full px-4 h-8 text-xs font-bold gap-1.5 ${leaderboardScope === 'friends'
                ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-500'
                : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Heart className="w-3.5 h-3.5" />
              Friends
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0 flex-1 flex flex-col min-h-0">
        <ScrollArea className="h-[240px] px-5 custom-scrollbar">
          <div className="space-y-2 pb-4 pr-2">
            {activeTab === 'xp'
              ? friendsXP.map((friend, i) => renderXPItem(friend, i))
              : challengers.map((player, i) => renderChallengeItem(player, i))
            }
          </div>
        </ScrollArea>

        {/* Your Position */}
        <div className="p-5 pt-3 bg-gradient-to-t from-pink-50/80 dark:from-slate-800/80 to-transparent border-t border-dashed border-pink-200 dark:border-pink-800">
          <p className="text-[10px] text-slate-400 font-black text-center mb-2 uppercase tracking-widest">Your Rank 🌟</p>
          {activeTab === 'xp' ? renderXPItem(myXPRank, 0) : renderChallengeItem(myChallengeRank, 0)}

          {activeTab === 'challenge' && (
            <Button
              variant="link"
              className="w-full mt-2 text-xs text-pink-400 hover:text-pink-500 h-auto py-1 font-bold"
              onClick={() => navigate('/vocab-challenge')}
            >
              View Full Leaderboard →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
