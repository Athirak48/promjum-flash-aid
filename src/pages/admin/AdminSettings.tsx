import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings, Globe, Palette, Shield, Bell, Database, Key, Save, RefreshCcw, Upload, Moon, Sun, Laptop } from 'lucide-react';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');

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
        christmas_theme: true,
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

    // Load settings from Supabase
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data, error } = await supabase.from('system_settings').select('*');
                if (error) {
                    console.warn('System settings table not found or empty, using defaults.');
                    return;
                }

                if (data) {
                    data.forEach(setting => {
                        if (setting.key === 'general' && setting.value && typeof setting.value === 'object') {
                            setGeneralSettings(setting.value as typeof generalSettings);
                        }
                        if (setting.key === 'features' && setting.value && typeof setting.value === 'object') {
                            setFeatureFlags(setting.value as typeof featureFlags);
                        }
                        if (setting.key === 'notifications' && setting.value && typeof setting.value === 'object') {
                            setNotificationSettings(setting.value as typeof notificationSettings);
                        }
                        if (setting.key === 'maintenance' && setting.value && typeof setting.value === 'object') {
                            setMaintenanceMode(setting.value as typeof maintenanceMode);
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to load settings', err);
            }
        };
        loadSettings();
    }, []);

    const saveToSupabase = async (key: string, value: any) => {
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({ key, value }, { onConflict: 'key' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast.error(`บันทึก ${key} ไม่สำเร็จ (Table 'system_settings' may be missing)`);
            return false;
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
        if (success) toast.success(maintenanceMode.enabled ? 'เปิดโหมดซ่อมบำรุงแล้ว' : 'ปิดโหมดซ่อมบำรุงแล้ว');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    System Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการการตั้งค่าระบบ</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
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
                            <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                                        <span className="text-3xl">🎴</span>
                                    </div>
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        อัปโหลด Logo
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleSaveGeneral} className="gap-2">
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
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {/* AI Features */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <span className="text-2xl">🤖</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">AI Features</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">ฟีเจอร์ AI สร้างประโยค, อ่านออกเสียง</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags.ai_features}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, ai_features: checked })}
                                    />
                                </div>

                                {/* Vocab Challenge */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Vocab Challenge</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">โหมดแข่งขันคำศัพท์</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags.vocab_challenge}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, vocab_challenge: checked })}
                                    />
                                </div>

                                {/* Multiplayer */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <span className="text-2xl">👥</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Multiplayer Mode</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">โหมดเล่นหลายคน (Beta)</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags.multiplayer}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, multiplayer: checked })}
                                    />
                                </div>

                                {/* Christmas Theme */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                            <span className="text-2xl">🎄</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Christmas Theme</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">ธีมคริสต์มาส</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags.christmas_theme}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, christmas_theme: checked })}
                                    />
                                </div>

                                {/* Beta Features */}
                                <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-amber-500">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <span className="text-2xl">🧪</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Beta Features</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">เปิดใช้ฟีเจอร์ทดลอง (อาจไม่เสถียร)</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={featureFlags.beta_features}
                                        onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, beta_features: checked })}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSaveFeatureFlags} className="gap-2">
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
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">ส่งอีเมลแจ้งเตือนกิจกรรมต่างๆ</p>
                                </div>
                                <Switch
                                    checked={notificationSettings.email_notifications}
                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Push Notifications</p>
                                    <p className="text-sm text-muted-foreground">ส่ง Push แจ้งเตือนไปยังอุปกรณ์</p>
                                </div>
                                <Switch
                                    checked={notificationSettings.push_notifications}
                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, push_notifications: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Marketing Emails</p>
                                    <p className="text-sm text-muted-foreground">ส่งอีเมลโปรโมชั่นและข่าวสาร</p>
                                </div>
                                <Switch
                                    checked={notificationSettings.marketing_emails}
                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, marketing_emails: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Weekly Digest</p>
                                    <p className="text-sm text-muted-foreground">ส่งสรุปความก้าวหน้ารายสัปดาห์</p>
                                </div>
                                <Switch
                                    checked={notificationSettings.weekly_digest}
                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weekly_digest: checked })}
                                />
                            </div>
                            <Button onClick={handleSaveNotifications} className="gap-2">
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
                                <Shield className={`h-5 w-5 ${maintenanceMode.enabled ? 'text-destructive' : ''}`} />
                                Maintenance Mode
                            </CardTitle>
                            <CardDescription>เปิดโหมดซ่อมบำรุงเพื่อป้องกันผู้ใช้เข้าถึงระบบ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">เปิดโหมดซ่อมบำรุง</p>
                                    <p className="text-sm text-muted-foreground">ผู้ใช้จะไม่สามารถเข้าถึงระบบได้</p>
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
                                variant={maintenanceMode.enabled ? 'destructive' : 'default'}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {maintenanceMode.enabled ? 'เปิด Maintenance Mode' : 'บันทึก'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Database Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">Database</p>
                                    <p className="font-medium">Supabase PostgreSQL</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">Version</p>
                                    <p className="font-medium">v2.0.0</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">Last Backup</p>
                                    <p className="font-medium">14 ธ.ค. 2567, 08:00</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">Environment</p>
                                    <p className="font-medium">Production</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
