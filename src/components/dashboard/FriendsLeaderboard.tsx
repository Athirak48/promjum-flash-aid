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
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            เพื่อน & อันดับ
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            เชิญเพื่อน
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/30 hover:border-primary/30 transition-all"
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankColor(friend.rank)}`}>
                  {friend.rank <= 3 ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <span>#{friend.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                    {friend.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & XP */}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{friend.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary" />
                    {friend.xp} XP
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
