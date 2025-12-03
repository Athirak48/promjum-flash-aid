import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Trophy, Zap, Plus, BookOpen, Star, Award, Flame, Heart, Brain, Rocket, Crown, Medal, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description?: string;
  icon: LucideIcon;
  current: number;
  target: number;
  color: string;
  bgColor: string;
}

const availableIcons = [
  { value: 'Target', icon: Target, label: 'เป้าหมาย', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { value: 'Trophy', icon: Trophy, label: 'ถ้วยรางวัล', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { value: 'Zap', icon: Zap, label: 'พลังงาน', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { value: 'BookOpen', icon: BookOpen, label: 'หนังสือ', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { value: 'Star', icon: Star, label: 'ดาว', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { value: 'Award', icon: Award, label: 'รางวัล', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { value: 'Flame', icon: Flame, label: 'ไฟ', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { value: 'Heart', icon: Heart, label: 'หัวใจ', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { value: 'Brain', icon: Brain, label: 'สมอง', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { value: 'Rocket', icon: Rocket, label: 'จรวด', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { value: 'Crown', icon: Crown, label: 'มงกุฎ', color: 'text-yellow-600', bgColor: 'bg-yellow-600/10' },
  { value: 'Medal', icon: Medal, label: 'เหรียญ', color: 'text-orange-600', bgColor: 'bg-orange-600/10' },
  { value: 'CheckCircle', icon: CheckCircle, label: 'ถูกต้อง', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
];

export function GoalsMotivation() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    iconValue: 'Target'
  });

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "เรียนครบ 7 วัน",
      icon: Target,
      current: 1,
      target: 7,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "คำศัพท์ 1000 คำ",
      icon: Trophy,
      current: 20,
      target: 1000,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      id: 3,
      title: "จบ Subdeck 10 ชุด",
      icon: Zap,
      current: 0,
      target: 10,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim() || !newGoal.target) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "โปรดระบุหัวข้อและจำนวนเป้าหมาย",
        variant: "destructive"
      });
      return;
    }

    const selectedIcon = availableIcons.find(i => i.value === newGoal.iconValue) || availableIcons[0];

    const goalToAdd: Goal = {
      id: Date.now(),
      title: newGoal.title,
      description: newGoal.description,
      icon: selectedIcon.icon,
      current: 0,
      target: parseInt(newGoal.target),
      color: selectedIcon.color,
      bgColor: selectedIcon.bgColor.replace('/10', '') // Adjust opacity for solid bg
    };

    setGoals([...goals, goalToAdd]);
    setIsDialogOpen(false);
    setNewGoal({ title: '', description: '', target: '', iconValue: 'Target' });

    toast({
      title: "เพิ่มเป้าหมายสำเร็จ",
      description: `เพิ่ม "${newGoal.title}" แล้ว`
    });
  };

  return (
    <Card className="h-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-purple-50 shadow-inner">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              เป้าหมายการเรียน
            </span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50 text-purple-600 rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-white/50 rounded-[2rem] p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">✨ เพิ่มเป้าหมายใหม่</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Preview Card */}
                {newGoal.title && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 animate-fade-in">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const selectedIcon = availableIcons.find(i => i.value === newGoal.iconValue);
                        if (selectedIcon) {
                          const PreviewIcon = selectedIcon.icon;
                          return (
                            <div className={`p-3 rounded-xl ${selectedIcon.bgColor}`}>
                              <PreviewIcon className={`h-6 w-6 ${selectedIcon.color}`} />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-foreground">{newGoal.title}</h4>
                        {newGoal.description && (
                          <p className="text-xs text-muted-foreground mt-1">{newGoal.description}</p>
                        )}
                        {newGoal.target && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full w-0 bg-primary rounded-full" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                              0 / {newGoal.target}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold">
                      หัวข้อเป้าหมาย <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="เช่น เรียนครบ 30 วัน"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      maxLength={100}
                      className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold">
                      รายละเอียด <span className="text-xs text-muted-foreground font-normal">(ไม่บังคับ)</span>
                    </Label>
                    <Input
                      id="description"
                      placeholder="เพิ่มรายละเอียดเพิ่มเติม..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      maxLength={200}
                      className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target" className="text-sm font-bold">
                      จำนวนเป้าหมาย <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="เช่น 30"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      min="1"
                      max="10000"
                      className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold">
                      เลือกไอคอน <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                      {availableIcons.map((iconOption) => {
                        const IconComponent = iconOption.icon;
                        const isSelected = newGoal.iconValue === iconOption.value;
                        return (
                          <button
                            key={iconOption.value}
                            type="button"
                            onClick={() => setNewGoal({ ...newGoal, iconValue: iconOption.value })}
                            className={`
                              aspect-square p-2.5 rounded-xl border-2 transition-all duration-200
                              hover:scale-110 hover:shadow-md flex items-center justify-center
                              ${isSelected
                                ? `${iconOption.bgColor} ${iconOption.color} border-current ring-2 ring-offset-2 ring-current shadow-md`
                                : 'bg-muted/30 border-transparent hover:bg-muted/50'
                              }
                            `}
                            title={iconOption.label}
                          >
                            <IconComponent className={`w-5 h-5 ${isSelected ? '' : 'text-muted-foreground'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewGoal({ title: '', description: '', target: '', iconValue: 'Target' });
                  }}
                  className="w-full sm:w-auto rounded-xl h-11"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleAddGoal}
                  className="w-full sm:w-auto rounded-xl h-11 bg-gradient-primary hover:shadow-lg transition-all"
                  disabled={!newGoal.title || !newGoal.target}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  เพิ่มเป้าหมาย
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const progress = (goal.current / goal.target) * 100;

            return (
              <div key={goal.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/30 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className={`p-3 rounded-xl ${goal.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${goal.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-foreground text-sm">{goal.title}</h3>
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap ml-2 bg-muted/50 px-2 py-0.5 rounded-md">
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2.5 mb-1 rounded-full bg-muted/50" />
                  <div className="flex justify-between text-[10px] font-medium mt-1">
                    <span className="text-muted-foreground">{Math.round(progress)}% เสร็จสมบูรณ์</span>
                    {progress === 100 && (
                      <span className="text-primary font-bold animate-pulse flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> สำเร็จ!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
