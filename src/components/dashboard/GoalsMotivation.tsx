import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Target, Trophy, Zap, Plus, BookOpen, Star, Flame, Rocket, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  emoji: string;
  icon_name: string;
  is_completed: boolean;
}

// Goal templates for dropdown - only 2 options
const goalTemplates = [
  { type: 'streak', title: '___-Day Streak', defaultTarget: 7, emoji: '🔥', icon: 'Flame' },
  { type: 'words', title: 'Learn ___ Words', defaultTarget: 100, emoji: '📚', icon: 'BookOpen' },
];

const iconMap: { [key: string]: any } = {
  Target, Trophy, Zap, BookOpen, Star, Flame, Rocket
};

export function GoalsMotivation() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof goalTemplates[0] | null>(null);
  const [targetValue, setTargetValue] = useState(10);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: typeof goalTemplates[0]) => {
    setSelectedTemplate(template);
    setTargetValue(template.defaultTarget);
    setIsDialogOpen(true);
  };

  const handleCreateGoal = async () => {
    if (!selectedTemplate) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
        return;
      }

      const goalTitle = selectedTemplate.title.replace('___', targetValue.toString());

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          goal_type: selectedTemplate.type,
          title: goalTitle,
          target_value: targetValue,
          current_value: 0,
          emoji: selectedTemplate.emoji,
          icon_name: selectedTemplate.icon
        })
        .select()
        .single();

      if (error) throw error;

      setGoals([...goals, data]);
      setIsDialogOpen(false);
      setSelectedTemplate(null);

      toast({ title: "สร้างเป้าหมายสำเร็จ! 🎉", description: `"${goalTitle}" ถูกเพิ่มแล้ว` });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  };

  const adjustTargetValue = (delta: number) => {
    const step = selectedTemplate?.type === 'words' ? 50 :
      selectedTemplate?.type === 'review' ? 100 : 1;
    setTargetValue(prev => Math.max(1, prev + (delta * step)));
  };

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-white/10 h-full flex flex-col overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <CardHeader className="pb-4 p-0 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.3)]"
            >
              <Target className="h-5 w-5 text-rose-300" />
            </motion.div>
            <span className="text-white font-bold drop-shadow-md">My Goals</span>
          </CardTitle>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/10 text-white/70 hover:text-white rounded-full border-2 border-dashed border-white/30 hover:border-white/50 transition-all">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 backdrop-blur-xl border-white/20 text-white rounded-xl p-2">
              <p className="text-xs text-white/50 px-2 py-1 font-semibold">เลือกเป้าหมาย</p>
              {goalTemplates.map((template) => (
                <DropdownMenuItem
                  key={template.type}
                  onClick={() => handleTemplateSelect(template)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                >
                  <span className="text-xl">{template.emoji}</span>
                  <span className="font-medium">{template.title.replace('___', '...')}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Target Value Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[360px] rounded-3xl bg-slate-900/95 backdrop-blur-xl border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 justify-center">
              <span className="text-3xl">{selectedTemplate?.emoji}</span>
              สร้างเป้าหมาย
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <p className="text-center text-white/70 mb-4">
              {selectedTemplate?.title.split('___')[0]}
              <span className="text-2xl font-black text-rose-400 mx-1">{targetValue}</span>
              {selectedTemplate?.title.split('___')[1]}
            </p>

            {/* Number Adjuster */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTargetValue(-1)}
                className="h-14 w-14 rounded-full border-2 border-white/20 hover:bg-white/10 hover:border-rose-400"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>

              <div className="text-5xl font-black text-white w-32 text-center">
                {targetValue}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTargetValue(1)}
                className="h-14 w-14 rounded-full border-2 border-white/20 hover:bg-white/10 hover:border-rose-400"
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-white/20 text-white hover:bg-white/10">
              ยกเลิก
            </Button>
            <Button
              onClick={handleCreateGoal}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-bold px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              สร้างเป้าหมาย
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent className="flex-1 flex flex-col p-0 pt-4">
        {loading ? (
          <div className="text-center text-white/50 py-8">กำลังโหลด...</div>
        ) : goals.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีเป้าหมาย</p>
            <p className="text-xs mt-1">กด + เพื่อสร้างเป้าหมายใหม่</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              const Icon = iconMap[goal.icon_name] || Target;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-rose-400/50 hover:bg-white/10 transition-all group shadow-sm"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner"
                  >
                    {goal.emoji}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-white text-sm truncate">{goal.title}</h3>
                      <span className="text-[10px] font-black text-white/80 bg-white/5 px-2.5 py-1 rounded-full ml-2 border border-white/10 shadow-inner">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-full relative shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                      >
                        <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold mt-1">
                      <span className="text-white/60">{Math.round(progress)}%</span>
                      {progress >= 100 && (
                        <span className="text-green-300 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Done! 🎉
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
