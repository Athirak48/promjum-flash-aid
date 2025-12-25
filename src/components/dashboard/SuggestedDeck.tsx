import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDecks } from "@/hooks/useDecks";

export function SuggestedDeck() {
  const navigate = useNavigate();
  const { decks } = useDecks();

  const suggestedDecks = decks.slice(0, 2);

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-white/10 h-full overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <CardHeader className="pb-4 p-0">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
            <TrendingUp className="h-6 w-6 text-teal-300" />
          </div>
          <span className="text-white font-bold drop-shadow-md">
            Deck แนะนำ
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0 pt-4">
        {suggestedDecks.map((deck) => (
          <div
            key={deck.id}
            className="p-4 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-teal-400/50 hover:bg-teal-400/10 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
            onClick={() => navigate(`/decks/${deck.id}/subdecks`)}
          >
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors text-lg drop-shadow-sm">
                  {deck.name}
                </h3>
                <p className="text-sm text-white/60">{deck.name_en}</p>
              </div>
              {deck.is_premium && (
                <span className="px-3 py-1 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  <Users className="h-3 w-3" />
                  POPULAR
                </span>
              )}
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
                <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <BookOpen className="h-3 w-3" />
                  <span>{deck.total_flashcards} คำ</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-teal-500/0 group-hover:bg-teal-500/20 transition-all duration-300">
                <ArrowRight className="h-4 w-4 text-teal-300/0 -translate-x-2 group-hover:text-teal-300 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full mt-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-teal-400/50 transition-all h-12 font-bold text-base"
          onClick={() => navigate('/decks')}
        >
          ดู Deck ทั้งหมด
        </Button>
      </CardContent>
    </Card>
  );
}
