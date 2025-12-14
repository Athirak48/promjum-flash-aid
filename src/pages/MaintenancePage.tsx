import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="flex justify-center">
                    <div className="p-6 rounded-full bg-primary/10">
                        <Wrench className="w-16 h-16 text-primary" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    ระบบปิดปรับปรุงชั่วคราว
                </h1>

                <p className="text-muted-foreground text-lg">
                    เรากำลังพัฒนาระบบให้ดียิ่งขึ้นเพื่อประสบการณ์การใช้งานที่ดีที่สุดของคุณ
                    กรุณากลับมาใหม่ในภายหลัง
                </p>

                <div className="pt-4">
                    {/* Optional: Add contact info or refresh button */}
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        ลองใหม่อีกครั้ง
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-8">
                    Reference Code: MAINTENANCE_MODE
                </p>
            </div>
        </div>
    );
}
