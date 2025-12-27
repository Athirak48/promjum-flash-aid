import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Layers,
  MessageSquare,
  Bell,
  TrendingUp,
  Shield,
  RefreshCw,
  ArrowRight,
  Clock,
  Star,
  MousePointerClick,
  UserPlus,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface AdminStats {
  totalUsers: number;
  todaySignups: number;
  totalDecks: number;
  totalFlashcards: number;
  activeUsers7d: number;
  pendingFeedbacks: number;
  totalFeedbacks: number;
  sentNotifications: number;
  todayPageViews: number;
  todayButtonClicks: number;
}

interface RecentFeedback {
  id: string;
  type: string;
  message: string;
  rating: number;
  status: string;
  created_at: string;
}

interface RecentUser {
  id: string;
  display_name: string;
  username: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    todaySignups: 0,
    totalDecks: 0,
    totalFlashcards: 0,
    activeUsers7d: 0,
    pendingFeedbacks: 0,
    totalFeedbacks: 0,
    sentNotifications: 0,
    todayPageViews: 0,
    todayButtonClicks: 0
  });
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel fetch for better performance
      const [
        usersResult,
        todayUsersResult,
        decksResult,
        flashcardsResult,
        activeUsersResult,
        feedbacksResult,
        pendingFeedbacksResult,
        notificationsResult,
        pageViewsResult,
        buttonClicksResult,
        recentFeedbacksResult,
        recentUsersResult
      ] = await Promise.all([
        // Total users
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // Today signups
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
        // Total decks
        supabase.from('decks').select('id', { count: 'exact', head: true }),
        // Total flashcards
        supabase.from('flashcards').select('id', { count: 'exact', head: true }),
        // Active users in last 7 days
        supabase.from('user_activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        // Total feedbacks
        supabase.from('user_feedbacks').select('id', { count: 'exact', head: true }),
        // Pending feedbacks
        supabase.from('user_feedbacks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Sent notifications
        supabase.from('notification_broadcasts').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
        // Today page views
        supabase.from('user_activity_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', todayISO),
        // Today button clicks
        supabase.from('user_activity_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'button_click').gte('created_at', todayISO),
        // Recent feedbacks
        supabase.from('user_feedbacks').select('id, type, message, rating, status, created_at').order('created_at', { ascending: false }).limit(5),
        // Recent users
        supabase.from('profiles').select('id, display_name, username, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        todaySignups: todayUsersResult.count || 0,
        totalDecks: decksResult.count || 0,
        totalFlashcards: flashcardsResult.count || 0,
        activeUsers7d: activeUsersResult.count || 0,
        totalFeedbacks: feedbacksResult.count || 0,
        pendingFeedbacks: pendingFeedbacksResult.count || 0,
        sentNotifications: notificationsResult.count || 0,
        todayPageViews: pageViewsResult.count || 0,
        todayButtonClicks: buttonClicksResult.count || 0
      });

      setRecentFeedbacks(recentFeedbacksResult.data || []);
      setRecentUsers(recentUsersResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { label: 'Community', path: '/admin/community', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Click Analytics', path: '/admin/click-analytics', icon: MousePointerClick, color: 'bg-cyan-500' },
    { label: 'Feedbacks', path: '/admin/feedback', icon: MessageSquare, color: 'bg-amber-500' },
    { label: 'Notifications', path: '/admin/notification', icon: Bell, color: 'bg-green-500' },
    { label: 'Members', path: '/admin/members', icon: Users, color: 'bg-pink-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 border-0">รอดำเนินการ</Badge>;
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-700 border-0">ตรวจสอบแล้ว</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-700 border-0">แก้ไขแล้ว</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      bug: '🐛 Bug',
      feature: '💡 Feature',
      improvement: '🔧 Improvement',
      question: '❓ Question',
      game_idea: '🎮 Game Idea',
      general: '💬 General'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">ภาพรวมระบบและสถิติการใช้งาน</p>
        </div>
        <Button variant="outline" onClick={fetchAllData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                {stats.todaySignups > 0 && (
                  <p className="text-xs text-blue-200 mt-1">+{stats.todaySignups} วันนี้</p>
                )}
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Users (7d)</p>
                <p className="text-3xl font-bold mt-1">{stats.activeUsers7d.toLocaleString()}</p>
              </div>
              <Activity className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Decks</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDecks.toLocaleString()}</p>
              </div>
              <BookOpen className="h-10 w-10 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Flashcards</p>
                <p className="text-3xl font-bold mt-1">{stats.totalFlashcards.toLocaleString()}</p>
              </div>
              <Layers className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm">Pending Feedbacks</p>
                <p className="text-3xl font-bold mt-1">{stats.pendingFeedbacks}</p>
                <p className="text-xs text-rose-200 mt-1">จาก {stats.totalFeedbacks} ทั้งหมด</p>
              </div>
              <MessageSquare className="h-10 w-10 text-rose-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600">
                <MousePointerClick className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayPageViews}</p>
                <p className="text-sm text-slate-500">Page Views วันนี้</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <MousePointerClick className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayButtonClicks}</p>
                <p className="text-sm text-slate-500">Button Clicks วันนี้</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.sentNotifications}</p>
                <p className="text-sm text-slate-500">Notifications ส่งแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg text-slate-800 dark:text-white">Quick Links</CardTitle>
          <CardDescription>ลิงก์ไปยังหน้าที่ใช้บ่อย</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Button
                key={link.path}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => navigate(link.path)}
              >
                <div className={`p-2 rounded-lg ${link.color} text-white`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedbacks */}
        <Card>
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedbacks ล่าสุด
              </CardTitle>
              <CardDescription>ความคิดเห็นจากผู้ใช้</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/feedback')} className="gap-1">
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {recentFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มี Feedback</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFeedbacks.map((fb) => (
                  <div key={fb.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{getFeedbackTypeLabel(fb.type)}</span>
                        {getStatusBadge(fb.status)}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{fb.message}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true, locale: th })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                สมาชิกใหม่ล่าสุด
              </CardTitle>
              <CardDescription>ผู้ใช้ที่สมัครล่าสุด</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/members')} className="gap-1">
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีสมาชิก</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {user.display_name || user.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: th })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">ใหม่</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}