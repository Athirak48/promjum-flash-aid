import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BackgroundDecorations from "@/components/BackgroundDecorations";

interface AdminStats {
  totalUsers: number;
  totalUploads: number;
  totalSales: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalUploads: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);

      // Fetch user count from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      // Fetch decks count
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('id');

      // Fetch flashcards count
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id');

      if (usersError || decksError || flashcardsError) {
        throw new Error('Failed to fetch admin stats');
      }

      setStats({
        totalUsers: usersData?.length || 0,
        totalUploads: decksData?.length || 0,
        totalSales: flashcardsData?.length || 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสถิติได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    description: string;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className="text-green-600 ml-1">
              <TrendingUp className="inline h-3 w-3" />
              {trend}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-secondary/30 p-6 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">จัดการระบบและติดตามสถิติการใช้งาน</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administrator
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="ผู้ใช้ทั้งหมด"
            value={isLoading ? "..." : stats.totalUsers}
            icon={Users}
            description="จำนวนผู้ใช้ที่ลงทะเบียน"
            trend="+12%"
          />
          <StatCard
            title="Decks ทั้งหมด"
            value={isLoading ? "..." : stats.totalUploads}
            icon={FileText}
            description="จำนวน Decks ที่สร้างทั้งหมด"
            trend="+8%"
          />
          <StatCard
            title="Flashcards"
            value={isLoading ? "..." : stats.totalSales}
            icon={CreditCard}
            description="จำนวน Flashcards ทั้งหมด"
            trend="+23%"
          />
          <StatCard
            title="Sessions"
            value={isLoading ? "..." : stats.totalRevenue}
            icon={BarChart3}
            description="จำนวน Practice Sessions"
            trend="+15%"
          />
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">ผู้ใช้</TabsTrigger>
            <TabsTrigger value="uploads">อัปโหลด</TabsTrigger>
            <TabsTrigger value="marketplace">ตลาด</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>จัดการผู้ใช้</CardTitle>
                <CardDescription>ดูและจัดการบัญชีผู้ใช้ทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">ระบบจัดการผู้ใช้จะเปิดให้ใช้งานเร็วๆ นี้</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>จัดการไฟล์อัปโหลด</CardTitle>
                <CardDescription>ตรวจสอบและจัดการไฟล์ที่ผู้ใช้อัปโหลด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">ระบบจัดการไฟล์จะเปิดให้ใช้งานเร็วๆ นี้</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>จัดการตลาดแฟลชการ์ด</CardTitle>
                <CardDescription>ตรวจสอบและจัดการรายการในตลาด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">ระบบจัดการตลาดจะเปิดให้ใช้งานเร็วๆ นี้</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ตั้งค่าระบบ</CardTitle>
                <CardDescription>จัดการการตั้งค่าทั่วไปของระบบ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">การแจ้งเตือน</h4>
                    <p className="text-sm text-muted-foreground">จัดการการแจ้งเตือนของระบบ</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    จัดการ
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">ความปลอดภัย</h4>
                    <p className="text-sm text-muted-foreground">การตั้งค่าความปลอดภัยของระบบ</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    จัดการ
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      การสำรองข้อมูล
                    </h4>
                    <p className="text-sm text-muted-foreground">สำรองข้อมูลระบบอัตโนมัติ</p>
                  </div>
                  <Button variant="outline" size="sm">
                    ตั้งค่า
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}