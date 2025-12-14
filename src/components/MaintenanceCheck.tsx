import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MaintenancePage from '@/pages/MaintenancePage';

interface MaintenanceCheckProps {
    children: React.ReactNode;
}

export const MaintenanceCheck = ({ children }: MaintenanceCheckProps) => {
    const { user } = useAuth();
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSystemStatus();
    }, [user]);

    const checkSystemStatus = async () => {
        try {
            // 1. Check Maintenance Mode Settings
            const { data: settings, error: settingsError } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'maintenance')
                .single();

            let maintenanceActive = false;

            if (settings && settings.value) {
                maintenanceActive = settings.value.enabled === true;
            }

            setIsMaintenance(maintenanceActive);

            // 2. If maintenance is active, check if user is Admin
            if (maintenanceActive && user) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('role', 'admin')
                    .maybeSingle(); // Use maybeSingle to avoid error if not found

                setIsAdmin(!!roleData);
            } else {
                // If not logged in, they are not admin
                setIsAdmin(false);
            }

        } catch (error) {
            console.error('Error checking system status:', error);
            // Fallback: Assume not maintenance if error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null; // Or a spinner
    }

    // If Maintenance is ON and User is NOT Admin -> Show Maintenance Page
    // Note: We allow access if user is admin, even if they are just viewing normal pages.
    if (isMaintenance && !isAdmin) {
        return <MaintenancePage />;
    }

    return <>{children}</>;
};
