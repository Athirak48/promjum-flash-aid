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
    <Card className="h-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-green-50 shadow-inner">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
            Deck แนะนำ
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedDecks.map((deck) => (
          <div
            key={deck.id}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-border/30 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => navigate(`/decks/${deck.id}/subdecks`)}
          >
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">
                  {deck.name}
                </h3>
                <p className="text-sm text-muted-foreground">{deck.name_en}</p>
              </div>
              {deck.is_premium && (
                <span className="px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 shadow-sm">
                  <Users className="h-3 w-3" />
                  POPULAR
                </span>
              )}
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-lg">
                  <BookOpen className="h-3 w-3" />
                  <span>{deck.total_flashcards} คำ</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/0 -translate-x-2 group-hover:text-primary group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full mt-2 rounded-xl hover:bg-primary/5 hover:text-primary border-primary/20 hover:border-primary/50 transition-all h-10"
          onClick={() => navigate('/decks')}
        >
          ดู Deck ทั้งหมด
        </Button>
      </CardContent>
    </Card>
  );
}
