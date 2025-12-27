import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    Settings, Globe, Palette, Shield, Bell, Database, Save, RefreshCw,
    Upload, AlertTriangle, Trash2, Download, HardDrive, Users, Layers,
    BookOpen, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SystemStats {
    totalUsers: number;
    totalDecks: number;
    totalFlashcards: number;
    totalFeedbacks: number;
    totalNotifications: number;
}

export default function AdminSettings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [systemStats, setSystemStats] = useState<SystemStats>({
        totalUsers: 0,
        totalDecks: 0,
        totalFlashcards: 0,
        totalFeedbacks: 0,
        totalNotifications: 0
    });

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        site_name: 'Promjum Flash Aid',
        site_description: 'แอปพลิเคชันเรียนรู้คำศัพท์ด้วย Flashcard และเกมสนุกๆ',
        contact_email: 'support@promjum.com',
        support_phone: '02-xxx-xxxx',
    });

    // Feature Flags
    const [featureFlags, setFeatureFlags] = useState({
        ai_features: true,
        vocab_challenge: true,
        multiplayer: false,
        dark_mode: true,
        christmas_theme: false,
        new_games: false,
        beta_features: false,
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        weekly_digest: true,
    });

    // Maintenance Mode
    const [maintenanceMode, setMaintenanceMode] = useState({
        enabled: false,
        message: 'ระบบกำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
        end_time: '',
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        await Promise.all([loadSettings(), loadSystemStats()]);
        setIsLoading(false);
    };

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*');
            if (error) {
                console.warn('System settings table not found, using defaults.');
                return;
            }

            if (data) {
                data.forEach(setting => {
                    if (setting.key === 'general') setGeneralSettings(setting.value);
                    if (setting.key === 'features') setFeatureFlags(setting.value);
                    if (setting.key === 'notifications') setNotificationSettings(setting.value);
                    if (setting.key === 'maintenance') setMaintenanceMode(setting.value);
                });
            }
        } catch (err) {
            console.error('Failed to load settings', err);
        }
    };

    const loadSystemStats = async () => {
        try {
            const [usersRes, decksRes, flashcardsRes, feedbacksRes, notificationsRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('decks').select('id', { count: 'exact', head: true }),
                supabase.from('flashcards').select('id', { count: 'exact', head: true }),
                supabase.from('user_feedbacks').select('id', { count: 'exact', head: true }),
                supabase.from('notification_broadcasts').select('id', { count: 'exact', head: true })
            ]);

            setSystemStats({
                totalUsers: usersRes.count || 0,
                totalDecks: decksRes.count || 0,
                totalFlashcards: flashcardsRes.count || 0,
                totalFeedbacks: feedbacksRes.count || 0,
                totalNotifications: notificationsRes.count || 0
            });
        } catch (err) {
            console.error('Failed to load system stats', err);
        }
    };

    const saveToSupabase = async (key: string, value: any) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key,
                    value,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                }, { onConflict: 'key' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast.error(`บันทึก ${key} ไม่สำเร็จ`);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveGeneral = async () => {
        const success = await saveToSupabase('general', generalSettings);
        if (success) toast.success('บันทึกการตั้งค่าทั่วไปสำเร็จ');
    };

    const handleSaveFeatureFlags = async () => {
        const success = await saveToSupabase('features', featureFlags);
        if (success) toast.success('บันทึก Feature Flags สำเร็จ');
    };

    const handleSaveNotifications = async () => {
        const success = await saveToSupabase('notifications', notificationSettings);
        if (success) toast.success('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
    };

    const handleSaveMaintenance = async () => {
        const success = await saveToSupabase('maintenance', maintenanceMode);
        if (success) toast.success(maintenanceMode.enabled ? 'เปิดโหมดซ่อมบำรุงแล้ว' : 'บันทึกการตั้งค่าแล้ว');
    };

    const handleClearActivityLogs = async () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        try {
            const { error } = await supabase
                .from('user_activity_logs')
                .delete()
                .lt('created_at', thirtyDaysAgo);

            if (error) throw error;
            toast.success('ล้าง Activity Logs เก่ากว่า 30 วันสำเร็จ');
        } catch (error) {
            console.error('Error clearing logs:', error);
            toast.error('ล้าง Activity Logs ไม่สำเร็จ');
        }
    };

    const handleExportData = async () => {
        try {
            const [settings, feedbacks] = await Promise.all([
                supabase.from('system_settings').select('*'),
                supabase.from('user_feedbacks').select('*')
            ]);

            const exportData = {
                exported_at: new Date().toISOString(),
                settings: settings.data,
                feedbacks: feedbacks.data
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promjum-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Export ข้อมูลสำเร็จ');
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Export ข้อมูลไม่สำเร็จ');
        }
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
                        <Settings className="h-8 w-8 text-primary" />
                        System Settings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการการตั้งค่าระบบ</p>
                </div>
                <Button variant="outline" onClick={loadAllData} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    รีเฟรช
                </Button>
            </div>

            {/* System Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.totalUsers}</p>
                                <p className="text-xs text-slate-500">Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.totalDecks}</p>
                                <p className="text-xs text-slate-500">Decks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.totalFlashcards}</p>
                                <p className="text-xs text-slate-500">Flashcards</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.totalNotifications}</p>
                                <p className="text-xs text-slate-500">Notifications</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600">
                                <HardDrive className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.totalFeedbacks}</p>
                                <p className="text-xs text-slate-500">Feedbacks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general" className="gap-2">
                        <Globe className="h-4 w-4" />
                        ทั่วไป
                    </TabsTrigger>
                    <TabsTrigger value="features" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Features
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        การแจ้งเตือน
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Maintenance
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="gap-2 text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        Danger
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลเว็บไซต์</CardTitle>
                            <CardDescription>การตั้งค่าพื้นฐานของเว็บไซต์</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ชื่อเว็บไซต์</Label>
                                    <Input
                                        value={generalSettings.site_name}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email ติดต่อ</Label>
                                    <Input
                                        value={generalSettings.contact_email}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>คำอธิบายเว็บไซต์</Label>
                                <Textarea
                                    value={generalSettings.site_description}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>เบอร์โทร Support</Label>
                                <Input
                                    value={generalSettings.support_phone}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, support_phone: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleSaveGeneral} disabled={isSaving} className="gap-2">
                                <Save className="h-4 w-4" />
                                บันทึก
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feature Flags */}
                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Flags</CardTitle>
                            <CardDescription>เปิด/ปิด ฟีเจอร์ต่างๆ ในระบบ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'ai_features', label: 'AI Features', desc: 'ฟีเจอร์ AI สร้างประโยค, อ่านออกเสียง', emoji: '🤖', color: 'purple' },
                                { key: 'vocab_challenge', label: 'Vocab Challenge', desc: 'โหมดแข่งขันคำศัพท์', emoji: '🏆', color: 'amber' },
                                { key: 'multiplayer', label: 'Multiplayer Mode', desc: 'โหมดเล่นหลายคน (Beta)', emoji: '👥', color: 'blue' },
                                { key: 'dark_mode', label: 'Dark Mode', desc: 'โหมดมืด', emoji: '🌙', color: 'slate' },
                                { key: 'christmas_theme', label: 'Christmas Theme', desc: 'ธีมคริสต์มาส', emoji: '🎄', color: 'red' },
                                { key: 'new_games', label: 'New Games', desc: 'เกมใหม่ (Coming Soon)', emoji: '🎮', color: 'green' },
                                { key: 'beta_features', label: 'Beta Features', desc: 'ฟีเจอร์ทดลอง (อาจไม่เสถียร)', emoji: '🧪', color: 'orange', warning: true },
                            ].map((feature) => (
                                <div
                                    key={feature.key}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${feature.warning ? 'border-dashed border-amber-500' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                                            <span className="text-2xl">{feature.emoji}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900 dark:text-white">{feature.label}</p>
                                                {featureFlags[feature.key as keyof typeof featureFlags] ? (
                                                    <Badge className="bg-green-100 text-green-700 border-0">ON</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-500 border-0">OFF</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags[feature.key as keyof typeof featureFlags]}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, [feature.key]: checked })}
                                    />
                                </div>
                            ))}
                            <Button onClick={handleSaveFeatureFlags} disabled={isSaving} className="gap-2">
                                <Save className="h-4 w-4" />
                                บันทึก Feature Flags
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
                            <CardDescription>ตั้งค่าการแจ้งเตือนเริ่มต้นสำหรับผู้ใช้ใหม่</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'email_notifications', label: 'Email Notifications', desc: 'ส่งอีเมลแจ้งเตือนกิจกรรมต่างๆ' },
                                { key: 'push_notifications', label: 'Push Notifications', desc: 'ส่ง Push แจ้งเตือนไปยังอุปกรณ์' },
                                { key: 'marketing_emails', label: 'Marketing Emails', desc: 'ส่งอีเมลโปรโมชั่นและข่าวสาร' },
                                { key: 'weekly_digest', label: 'Weekly Digest', desc: 'ส่งสรุปความก้าวหน้ารายสัปดาห์' },
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{setting.label}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{setting.desc}</p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [setting.key]: checked })}
                                    />
                                </div>
                            ))}
                            <Button onClick={handleSaveNotifications} disabled={isSaving} className="gap-2">
                                <Save className="h-4 w-4" />
                                บันทึก
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Maintenance Mode */}
                <TabsContent value="maintenance" className="space-y-6">
                    <Card className={maintenanceMode.enabled ? 'border-destructive' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {maintenanceMode.enabled ? (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                ) : (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                Maintenance Mode
                                {maintenanceMode.enabled && (
                                    <Badge variant="destructive">ACTIVE</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>เปิดโหมดซ่อมบำรุงเพื่อป้องกันผู้ใช้เข้าถึงระบบ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">เปิดโหมดซ่อมบำรุง</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ผู้ใช้จะไม่สามารถเข้าถึงระบบได้</p>
                                </div>
                                <Switch
                                    checked={maintenanceMode.enabled}
                                    onCheckedChange={(checked) => setMaintenanceMode({ ...maintenanceMode, enabled: checked })}
                                />
                            </div>
                            {maintenanceMode.enabled && (
                                <>
                                    <div className="space-y-2">
                                        <Label>ข้อความแจ้งผู้ใช้</Label>
                                        <Textarea
                                            value={maintenanceMode.message}
                                            onChange={(e) => setMaintenanceMode({ ...maintenanceMode, message: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เวลาสิ้นสุด (ประมาณ)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={maintenanceMode.end_time}
                                            onChange={(e) => setMaintenanceMode({ ...maintenanceMode, end_time: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <Button
                                onClick={handleSaveMaintenance}
                                disabled={isSaving}
                                variant={maintenanceMode.enabled ? 'destructive' : 'default'}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {maintenanceMode.enabled ? 'บันทึก (Maintenance ON)' : 'บันทึก'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Database</p>
                                    <p className="font-medium text-slate-900 dark:text-white">Supabase PostgreSQL</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Version</p>
                                    <p className="font-medium text-slate-900 dark:text-white">v2.0.0</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Environment</p>
                                    <p className="font-medium text-slate-900 dark:text-white">Production</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Last Updated</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{new Date().toLocaleDateString('th-TH')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Danger Zone */}
                <TabsContent value="danger" className="space-y-6">
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>การกระทำเหล่านี้อาจส่งผลกระทบต่อระบบ โปรดใช้ความระมัดระวัง</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Export Data */}
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Export Data</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ดาวน์โหลดข้อมูล Settings และ Feedbacks เป็น JSON</p>
                                </div>
                                <Button variant="outline" onClick={handleExportData} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </div>

                            <Separator />

                            {/* Clear Old Logs */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-900/10">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">ล้าง Activity Logs เก่า</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ลบ logs ที่เก่ากว่า 30 วัน เพื่อประหยัดพื้นที่</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                                            <Trash2 className="h-4 w-4" />
                                            ล้าง Logs
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>ยืนยันการล้าง Logs?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Activity logs ที่เก่ากว่า 30 วันจะถูกลบถาวร ไม่สามารถกู้คืนได้
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearActivityLogs} className="bg-amber-600 hover:bg-amber-700">
                                                ล้าง Logs
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
