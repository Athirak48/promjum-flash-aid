import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  CreditCard, 
  MessageSquare,
  BookOpen 
} from 'lucide-react';

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
}

interface UserStats {
  totalXP: number;
  totalSessions: number;
  totalMinutes: number;
  lastActive: string | null;
}

interface DeckProgress {
  deck_name: string;
  progress_percentage: number;
  last_accessed: string;
}

interface PaymentHistory {
  plan_type: string;
  started_at: string;
  status: string;
  price_paid: number;
}

interface FeedbackItem {
  title: string;
  message: string;
  category: string;
  created_at: string;
  status: string;
}

export default function UserDetailModal({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}: UserDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    totalSessions: 0,
    totalMinutes: 0,
    lastActive: null,
  });
  const [deckProgress, setDeckProgress] = useState<DeckProgress[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Fetch practice sessions stats
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('practice_sessions')
        .select('xp_gained, duration_minutes, completed_at')
        .eq('user_id', userId)
        .eq('completed', true);

      if (sessionsError) throw sessionsError;

      const totalXP = sessionsData?.reduce((sum, s) => sum + (s.xp_gained || 0), 0) || 0;
      const totalMinutes = sessionsData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
      const lastActive = sessionsData?.[0]?.completed_at || null;

      setStats({
        totalXP,
        totalSessions: sessionsData?.length || 0,
        totalMinutes,
        lastActive,
      });

      // Fetch deck progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_deck_progress')
        .select(`
          progress_percentage,
          last_accessed,
          deck_id,
          decks:deck_id (name)
        `)
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false })
        .limit(10);

      if (progressError) throw progressError;

      setDeckProgress(
        progressData?.map((p: any) => ({
          deck_name: p.decks?.name || 'Unknown Deck',
          progress_percentage: p.progress_percentage || 0,
          last_accessed: p.last_accessed,
        })) || []
      );

      // Fetch payment history
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscriptions')
        .select('plan_type, started_at, status, price_paid')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (paymentError) throw paymentError;
      setPayments(paymentData || []);

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('title, message, category, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">รายละเอียดผู้ใช้</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-1 mt-2">
              <span className="font-medium text-foreground">{userName}</span>
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <span className="text-xs font-mono text-muted-foreground">ID: {userId.substring(0, 8)}...</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Usage Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  สถิติการใช้งาน
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.totalSessions}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                      <p className="text-xs text-muted-foreground">นาที</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Last Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{formatDate(stats.lastActive)}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Deck Progress */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Deck ที่กำลังเรียน
                </h3>
                {deckProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">ยังไม่มีข้อมูล Deck</p>
                ) : (
                  <div className="space-y-3">
                    {deckProgress.map((deck, index) => (
                      <Card key={index}>
                        <CardContent className="py-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{deck.deck_name}</span>
                            <Badge variant="secondary">{deck.progress_percentage}%</Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${deck.progress_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            เข้าใช้ล่าสุด: {formatDate(deck.last_accessed)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  ประวัติการชำระเงิน
                </h3>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">ยังไม่มีประวัติการชำระเงิน</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <Card key={index}>
                        <CardContent className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{payment.plan_type}</p>
                              <p className="text-sm text-muted-foreground">
                                เริ่มต้น: {formatDate(payment.started_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={payment.status === 'active' ? 'default' : 'secondary'}
                              >
                                {payment.status}
                              </Badge>
                              <p className="text-sm font-medium mt-1">
                                ฿{payment.price_paid?.toLocaleString() || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Feedback History */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  บันทึก Feedback
                </h3>
                {feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">ยังไม่มี Feedback</p>
                ) : (
                  <div className="space-y-3">
                    {feedback.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="py-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{item.title}</p>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
