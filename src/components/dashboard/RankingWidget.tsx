import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy } from "lucide-react";
import { FriendsLeaderboard } from './FriendsLeaderboard';
import { VocabChallengeRanking } from './VocabChallengeRanking';

export function RankingWidget() {
  const [activeTab, setActiveTab] = useState<'xp' | 'challenge'>('xp');

  return (
    <Card className="h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden flex flex-col">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('xp')}
            className={`flex-1 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'xp' 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            XP Rank
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'challenge' 
                ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Challenge
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        {activeTab === 'xp' ? (
          <div className="h-full animate-in fade-in slide-in-from-right-4 duration-300">
             <FriendsLeaderboard isWidget={true} />
          </div>
        ) : (
          <div className="h-full animate-in fade-in slide-in-from-left-4 duration-300">
             <VocabChallengeRanking isWidget={true} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
