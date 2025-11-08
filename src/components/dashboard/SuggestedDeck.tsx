import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SuggestedDeck() {
  const navigate = useNavigate();

  const suggestedDecks = [
    {
      id: "1",
      name: "ท่องเที่ยว",
      name_en: "Travel",
      total_flashcards: 400,
      icon: "Plane",
      category: "lifestyle",
      isPopular: true
    },
    {
      id: "2",
      name: "งาน",
      name_en: "Work",
      total_flashcards: 600,
      icon: "Briefcase",
      category: "professional",
      isNew: true
    }
  ];

  return (
    <Card className="h-full bg-gradient-card backdrop-blur-sm border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Deck แนะนำ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestedDecks.map((deck) => (
          <div
            key={deck.id}
            className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => navigate(`/decks/${deck.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {deck.name}
                </h3>
                <p className="text-xs text-muted-foreground">{deck.name_en}</p>
              </div>
              {deck.isPopular && (
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  ยอดนิยม
                </span>
              )}
              {deck.isNew && (
                <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">
                  ใหม่
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {deck.total_flashcards} คำ
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/decks')}
        >
          ดู Deck ทั้งหมด
        </Button>
      </CardContent>
    </Card>
  );
}
