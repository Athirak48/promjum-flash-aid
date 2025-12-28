import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OnboardingDebugPage() {
    const { user } = useAuth();
    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [localStorageFlag, setLocalStorageFlag] = useState<string | null>(null);

    useEffect(() => {
        checkOnboarding();
        checkLocalStorage();
    }, [user]);

    const checkLocalStorage = () => {
        const flag = localStorage.getItem('onboarding_just_completed');
        setLocalStorageFlag(flag);
    };

    const checkOnboarding = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error:', error);
            }

            setOnboardingData(data);
        } catch (err) {
            console.error('Check failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('onboarding_just_completed');
        checkLocalStorage();
    };

    const deleteOnboarding = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_onboarding')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            alert('ลบข้อมูล onboarding สำเร็จ!');
            checkOnboarding();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('เกิดข้อผิดพลาด: ' + err);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">🔍 Onboarding Debug Page</h1>

                {/* User Info */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">👤 User Info</h2>
                    <div className="space-y-2 text-white">
                        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
                        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                    </div>
                </Card>

                {/* LocalStorage Status */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">💾 LocalStorage Status</h2>
                    <div className="space-y-4">
                        <p className="text-white">
                            <strong>onboarding_just_completed:</strong>{' '}
                            <span className={localStorageFlag === 'true' ? 'text-green-400' : 'text-red-400'}>
                                {localStorageFlag || 'null'}
                            </span>
                        </p>
                        <Button onClick={clearLocalStorage} variant="outline" className="text-white border-white/30">
                            Clear LocalStorage Flag
                        </Button>
                    </div>
                </Card>

                {/* Database Status */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">🗄️ Database Status</h2>

                    {onboardingData ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                                <p className="text-green-400 font-bold">✅ Onboarding Completed!</p>
                            </div>

                            <div className="text-white space-y-2">
                                <p><strong>Completed At:</strong> {onboardingData.completed_at}</p>
                                <p><strong>Age Group:</strong> {onboardingData.age_group}</p>
                                <p><strong>Learning Goal:</strong> {onboardingData.learning_goal}</p>
                                <p><strong>Skill Level:</strong> {onboardingData.skill_level}</p>
                                <p><strong>Nickname:</strong> {onboardingData.nickname}</p>
                            </div>

                            <details className="text-white">
                                <summary className="cursor-pointer font-bold">Show Full Data (JSON)</summary>
                                <pre className="mt-2 p-4 bg-black/30 rounded overflow-auto text-xs">
                                    {JSON.stringify(onboardingData, null, 2)}
                                </pre>
                            </details>

                            <Button
                                onClick={deleteOnboarding}
                                variant="destructive"
                                className="mt-4"
                            >
                                🗑️ Delete Onboarding Record (for testing)
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 font-bold">❌ No Onboarding Data Found</p>
                            <p className="text-white/70 text-sm mt-2">User needs to complete onboarding</p>
                        </div>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
                    <div className="flex gap-4 flex-wrap">
                        <Button onClick={() => window.location.href = '/onboarding'} variant="outline">
                            Go to Onboarding
                        </Button>
                        <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                            Go to Dashboard
                        </Button>
                        <Button onClick={() => checkOnboarding()} variant="outline">
                            Refresh Data
                        </Button>
                    </div>
                </Card>

                {/* Flow Explanation */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">📋 Expected Flow</h2>
                    <div className="text-white space-y-3 text-sm">
                        <div className="p-3 bg-blue-500/20 rounded">
                            <p className="font-bold">1️⃣ First Time User:</p>
                            <p className="text-white/70">Login → Redirected to /onboarding → Complete → Redirect to /dashboard</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded">
                            <p className="font-bold">2️⃣ Returning User (Completed Onboarding):</p>
                            <p className="text-white/70">Login → Directly to /dashboard</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded">
                            <p className="font-bold">3️⃣ After Completing Onboarding:</p>
                            <p className="text-white/70">
                                • localStorage flag 'onboarding_just_completed' = 'true'<br />
                                • Database record created in user_onboarding table<br />
                                • Redirect to /dashboard with replace: true<br />
                                • Flag is cleared on next page load
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
