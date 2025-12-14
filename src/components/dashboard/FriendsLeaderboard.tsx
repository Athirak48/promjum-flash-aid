import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trophy, Star, Medal, Timer, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface FriendsLeaderboardProps {
  isWidget?: boolean;
}

export function FriendsLeaderboard({ isWidget = false }: FriendsLeaderboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'xp' | 'challenge'>('challenge');

  // Mock data for XP (more items for scrolling)
  const friendsXP = [
    { id: 1, name: "Sarah M.", avatar: "https://i.pravatar.cc/150?u=sarah", xp: 1250, rank: 1, level: 8, isMe: false },
    { id: 2, name: "Mike T.", avatar: "https://i.pravatar.cc/150?u=mike", xp: 1180, rank: 2, level: 7, isMe: false },
    { id: 3, name: "Emily R.", avatar: "https://i.pravatar.cc/150?u=emily", xp: 1050, rank: 3, level: 6, isMe: false },
    { id: 4, name: "David K.", avatar: "https://i.pravatar.cc/150?u=david", xp: 980, rank: 4, level: 5, isMe: false },
    { id: 5, name: "Anna L.", avatar: "https://i.pravatar.cc/150?u=anna", xp: 920, rank: 5, level: 5, isMe: false },
    { id: 6, name: "Tom W.", avatar: "https://i.pravatar.cc/150?u=tom", xp: 880, rank: 6, level: 4, isMe: false },
    { id: 7, name: "Lisa P.", avatar: "https://i.pravatar.cc/150?u=lisa", xp: 850, rank: 7, level: 4, isMe: false },
  ];
  const myXPRank = { id: 99, name: "You", avatar: "https://i.pravatar.cc/150?u=me", xp: 720, rank: 12, level: 4, isMe: true };

  // Mock data for Challenge (more items for scrolling)
  const challengers = [
    { id: 1, name: "Somchai_TH", avatar: "🦁", time: "01:12.4500", score: "30/30", rank: 1, isMe: false },
    { id: 2, name: "EmmaW", avatar: "🦊", time: "01:15.2000", score: "30/30", rank: 2, isMe: false },
    { id: 3, name: "Kenji_JP", avatar: "🐻", time: "01:16.8800", score: "30/30", rank: 3, isMe: false },
    { id: 4, name: "Lisa_KR", avatar: "🐰", time: "01:22.3300", score: "29/30", rank: 4, isMe: false },
    { id: 5, name: "Alex_US", avatar: "🦅", time: "01:25.1100", score: "29/30", rank: 5, isMe: false },
    { id: 6, name: "Maria_BR", avatar: "🦋", time: "01:28.0500", score: "28/30", rank: 6, isMe: false },
    { id: 7, name: "Chen_CN", avatar: "🐉", time: "01:30.2200", score: "28/30", rank: 7, isMe: false },
  ];
  const myChallengeRank = { id: 99, name: "You", avatar: "🐼", time: "01:45.3000", score: "27/30", rank: 15, isMe: true };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center"><Trophy className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" /></div>;
    if (rank === 2) return <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Medal className="w-3.5 h-3.5 text-slate-500 fill-slate-300" /></div>;
    if (rank === 3) return <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center"><Medal className="w-3.5 h-3.5 text-orange-600 fill-orange-400" /></div>;
    return <span className="text-muted-foreground font-bold w-6 text-center text-xs">#{rank}</span>;
  };

  const renderXPItem = (friend: typeof friendsXP[0]) => (
    <div
      key={friend.id}
      className={`flex items-center gap-2 p-2 rounded-[1.5rem] border transition-all ${friend.isMe
        ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md"
        }`}
    >
      <div className="flex-shrink-0 w-8 flex justify-center">{getRankIcon(friend.rank)}</div>
      <div className="relative">
        <Avatar className="w-9 h-9 border-2 border-white dark:border-slate-800 shadow-sm">
          <AvatarImage src={friend.avatar} />
          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 px-1 py-[1px] rounded-full text-[8px] font-bold text-white border border-white dark:border-slate-800 ${friend.rank === 1 ? 'bg-purple-500' : 'bg-green-500'}`}>
          Lvl {friend.level}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center w-full">
          <p className={`font-bold truncate text-sm ${friend.isMe ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {friend.name}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span>{friend.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallengeItem = (player: typeof challengers[0]) => (
    <div
      key={player.id}
      className={`flex items-center gap-2 p-2 rounded-[1.5rem] border transition-all ${player.isMe
        ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md"
        }`}
    >
      <div className={`flex-shrink-0 w-8 text-center font-bold text-xs ${player.rank <= 3 ? "text-yellow-500" : "text-slate-400"}`}>
        #{player.rank}
      </div>
      <div className="relative">
        <Avatar className="w-9 h-9 border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 flex items-center justify-center text-lg">
          {player.avatar}
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center w-full">
          <p className={`font-bold truncate text-sm ${player.isMe ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {player.name}
          </p>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">{player.score}</span>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
              <Timer className="w-3 h-3" />
              <span>{player.time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-full bg-white dark:bg-slate-900 border-none shadow-none flex flex-col">
      <CardHeader className="pb-4 px-0 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'xp' ? (
              <>
                <Users className="w-6 h-6 text-primary" />
                Friends & Ranking
              </>
            ) : (
              <>
                <Trophy className="w-6 h-6 text-green-600" />
                Vocab Challenge
              </>
            )}
          </CardTitle>
          <Button variant="ghost" className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 font-semibold gap-1 px-2">
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
        </div>

        {/* Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <Button
            variant={activeTab === 'challenge' ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab('challenge')}
            className={`rounded-lg text-xs font-bold ${activeTab === 'challenge' ? 'bg-white text-green-600 shadow-sm hover:bg-white hover:text-green-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
          >
            Challenge Rank
          </Button>
          <Button
            variant={activeTab === 'xp' ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab('xp')}
            className={`rounded-lg text-xs font-bold ${activeTab === 'xp' ? 'bg-white text-primary shadow-sm hover:bg-white hover:text-primary' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
          >
            XP Ranking
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 flex-1 flex flex-col min-h-0">
        {/* Scrollable List */}
        <ScrollArea className="h-[180px] pr-2">
          <div className="space-y-2">
            {activeTab === 'xp'
              ? friendsXP.map(renderXPItem)
              : challengers.map(renderChallengeItem)
            }
          </div>
        </ScrollArea>

        {/* Fixed "You" Row at Bottom */}
        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1.5 text-center">Your Rank</p>
          {activeTab === 'xp' ? renderXPItem(myXPRank) : renderChallengeItem(myChallengeRank)}
        </div>

        {activeTab === 'challenge' && (
          <Button
            variant="link"
            className="w-full mt-2 text-xs text-green-600 hover:text-green-700 p-0 h-auto"
            onClick={() => navigate('/vocab-challenge')}
          >
            View Full Leaderboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


