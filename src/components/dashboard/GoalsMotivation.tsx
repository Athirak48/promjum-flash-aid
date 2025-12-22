import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Trophy, Zap, Plus, BookOpen, Star, Award, Flame, Heart, Brain, Rocket, Crown, Medal, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Goal {
  id: number;
  title: string;
  icon: LucideIcon;
  current: number;
  target: number;
  color: string;
  bgColor: string;
  emoji: string;
}

const availableIcons = [
  { value: 'Target', icon: Target, label: '🎯', color: 'text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20' },
  { value: 'Trophy', icon: Trophy, label: '🏆', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-500/20' },
  { value: 'Zap', icon: Zap, label: '⚡', color: 'text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-500/20' },
  { value: 'BookOpen', icon: BookOpen, label: '📚', color: 'text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20' },
  { value: 'Star', icon: Star, label: '⭐', color: 'text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20' },
  { value: 'Flame', icon: Flame, label: '🔥', color: 'text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-500/20' },
  { value: 'Heart', icon: Heart, label: '💖', color: 'text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-500/20' },
  { value: 'Rocket', icon: Rocket, label: '🚀', color: 'text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20' },
];

export function GoalsMotivation() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    iconValue: 'Target'
  });

  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: "7-Day Streak", icon: Target, current: 1, target: 7, color: "text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-500/20", emoji: "🔥" },
    { id: 2, title: "Learn 1000 Words", icon: Trophy, current: 342, target: 1000, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-500/20", emoji: "📚" },
    { id: 3, title: "Complete 10 Decks", icon: Zap, current: 3, target: 10, color: "text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-500/20", emoji: "⭐" }
  ]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim() || !newGoal.target) {
      toast({ title: "Please fill all fields! 🙈", variant: "destructive" });
      return;
    }

    const selectedIcon = availableIcons.find(i => i.value === newGoal.iconValue) || availableIcons[0];

    const goalToAdd: Goal = {
      id: Date.now(),
      title: newGoal.title,
      icon: selectedIcon.icon,
      current: 0,
      target: parseInt(newGoal.target),
      color: selectedIcon.color,
      bgColor: selectedIcon.bgColor,
      emoji: selectedIcon.label
    };

    setGoals([...goals, goalToAdd]);
    setIsDialogOpen(false);
    setNewGoal({ title: '', target: '', iconValue: 'Target' });

    toast({ title: "Goal Added! 🎉", description: `"${newGoal.title}" is now active!` });
  };

  return (
    <Card className="h-full bg-white dark:bg-slate-900 border-2 border-pink-100 dark:border-pink-900/30 shadow-lg rounded-[2rem] overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col">
      <CardHeader className="pb-4 relative overflow-hidden">
        {/* Cute Decoration */}
        <div className="absolute top-3 right-3 text-xl animate-float" style={{ animationDelay: '0.5s' }}>💖</div>

        <div className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-md shadow-pink-300/40"
            >
              <Target className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-pink-500 font-black">My Goals</span>
            <span className="text-lg animate-heartbeat">💕</span>
          </CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-pink-100 dark:hover:bg-pink-500/20 text-pink-400 rounded-full border-2 border-dashed border-pink-200 dark:border-pink-700 hover:border-pink-400 transition-all">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-pink-500 flex items-center gap-2">
                  New Goal <span className="animate-wiggle">🌸</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Goal Name</Label>
                  <Input
                    placeholder="e.g. Learn 50 new words"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="h-12 rounded-xl border-2 border-pink-100 focus:border-pink-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Target Number</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="h-12 rounded-xl border-2 border-pink-100 focus:border-pink-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Icon</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableIcons.map((iconOption) => {
                      const isSelected = newGoal.iconValue === iconOption.value;
                      return (
                        <button
                          key={iconOption.value}
                          type="button"
                          onClick={() => setNewGoal({ ...newGoal, iconValue: iconOption.value })}
                          className={`
                            aspect-square p-2 rounded-xl border-2 transition-all text-xl
                            hover:scale-105 flex items-center justify-center
                            ${isSelected
                              ? `${iconOption.bgColor} border-pink-300 shadow-md`
                              : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100'
                            }
                          `}
                        >
                          {iconOption.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGoal}
                  className="rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:opacity-90"
                  disabled={!newGoal.title || !newGoal.target}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal 🌸
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3">
          {goals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-700 transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-11 h-11 rounded-xl ${goal.bgColor} flex items-center justify-center text-xl shadow-sm`}
                >
                  {goal.emoji}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-slate-700 dark:text-slate-100 text-sm truncate">{goal.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full shadow-sm ml-2">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-1">
                    <span className="text-slate-400">{Math.round(progress)}%</span>
                    {progress === 100 && (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Done! 🎉
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
