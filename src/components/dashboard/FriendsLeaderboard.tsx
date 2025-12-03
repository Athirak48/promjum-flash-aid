import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trophy, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FriendsLeaderboard() {
  // Mock data
  const friends = [
    { id: 1, name: "สมชาย", avatar: "", xp: 1250, rank: 1 },
    { id: 2, name: "สมหญิง", avatar: "", xp: 1100, rank: 2 },
    { id: 3, name: "ดาวใจ", avatar: "", xp: 980, rank: 3 },
    { id: 4, name: "เพชร", avatar: "", xp: 850, rank: 4 },
    { id: 5, name: "กมล", avatar: "", xp: 720, rank: 5 },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500 bg-yellow-100 ring-4 ring-yellow-50";
    if (rank === 2) return "text-gray-500 bg-gray-100 ring-4 ring-gray-50";
    if (rank === 3) return "text-amber-600 bg-amber-100 ring-4 ring-amber-50";
    return "text-muted-foreground bg-muted/50";
  };

  return (
    <Card className="h-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-blue-50 shadow-inner">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
              เพื่อน & อันดับ
            </span>
          </CardTitle>
          <Button size="sm" variant="ghost" className="gap-2 text-primary hover:bg-primary/10 rounded-xl">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">เชิญเพื่อน</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-3 pt-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-border/30 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-transform group-hover:scale-110 ${getRankColor(friend.rank)}`}>
                  {friend.rank <= 3 ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <span>#{friend.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold">
                    {friend.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & XP */}
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{friend.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {friend.xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
