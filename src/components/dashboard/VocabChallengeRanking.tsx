import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Timer, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VocabChallengeRankingProps {
  isWidget?: boolean;
}

export function VocabChallengeRanking({ isWidget = false }: VocabChallengeRankingProps) {
    const navigate = useNavigate();

    // Mock data for speedrun/challenge ranking
    const challengers = [
        { id: 1, name: "Somchai_TH", avatar: "🦁", time: "01:12.45", rank: 1 },
        { id: 2, name: "EmmaW", avatar: "🦊", time: "01:15.20", rank: 2 },
        { id: 3, name: "You", avatar: "🐼", time: "01:18.00", rank: 3, isMe: true },
        { id: 4, name: "Lisa_KR", avatar: "🐰", time: "01:22.33", rank: 4 },
        { id: 5, name: "Alex_US", avatar: "🦅", time: "01:25.11", rank: 5 },
    ];

    const Content = (
      <div className="space-y-2">
          {challengers.map((player) => (
              <div
                  key={player.id}
                  className={`flex items-center gap-2 p-2 rounded-[1.5rem] border transition-all ${player.isMe
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md"
                      }`}
              >
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-6 text-center font-bold text-xs ${player.rank <= 3 ? "text-yellow-500" : "text-slate-400"
                      }`}>
                      #{player.rank}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 flex items-center justify-center text-lg">
                          {player.avatar}
                      </Avatar>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center w-full">
                          <p className={`font-bold truncate text-sm ${player.isMe ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-slate-100'}`}>
                              {player.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                              <Timer className="w-3 h-3" />
                              <span>{player.time}</span>
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    );

    if (isWidget) {
        return <div className="p-4 pt-0">{Content}</div>;
    }

    return (
        <Card className="bg-white dark:bg-slate-900 border-none shadow-none font-prompt">
            <CardHeader className="pb-4 px-0 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    Challenge Rank
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/vocab-challenge')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 font-semibold gap-1 px-2"
                >
                    View All
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {Content}
            </CardContent>
        </Card>
    );
}
