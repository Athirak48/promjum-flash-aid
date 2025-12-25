import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreateJoinRoomDialog } from '@/components/multiplayer/CreateJoinRoomDialog';
import { GameLobby } from '@/components/multiplayer/GameLobby';
import { MultiplayerGameWrapper } from '@/components/multiplayer/MultiplayerGameWrapper';
import { useGameRoom } from '@/hooks/useGameRoom';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Trophy, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiplayerPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showDialog, setShowDialog] = useState(false);
    const [activeRoomCode, setActiveRoomCode] = useState<string | null>(
        searchParams.get('room') || null
    );

    const { currentRoom, loadRoom } = useGameRoom();

    // Load room when active
    useEffect(() => {
        if (activeRoomCode) {
            loadRoom(activeRoomCode);
        }
    }, [activeRoomCode, loadRoom]);

    const handleRoomJoined = (roomCode: string) => {
        setActiveRoomCode(roomCode);
    };

    const handleLeaveRoom = () => {
        setActiveRoomCode(null);
    };

    // If in a room and game is playing/finished, show the game wrapper
    if (activeRoomCode && currentRoom && (currentRoom.status === 'playing' || currentRoom.status === 'finished')) {
        return (
            <MultiplayerGameWrapper
                roomCode={activeRoomCode}
                onComplete={handleLeaveRoom}
            />
        );
    }

    // If in a room (waiting), show the lobby
    if (activeRoomCode) {
        return (
            <GameLobby
                roomCode={activeRoomCode}
                onLeave={handleLeaveRoom}
            />
        );
    }

    // Otherwise show the landing page
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 z-20"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    กลับหน้าหลัก
                </Button>
            </motion.div>

            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg text-center relative"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                >
                    <Gamepad2 className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    Multiplayer
                </h1>
                <p className="text-lg text-slate-300 mb-8">
                    แข่งขันกับเพื่อน สูงสุด 5 คน!
                </p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <FeatureCard
                        icon={<Users className="w-6 h-6" />}
                        label="สูงสุด 5 คน"
                        color="purple"
                    />
                    <FeatureCard
                        icon={<Trophy className="w-6 h-6" />}
                        label="9 เกม"
                        color="teal"
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6" />}
                        label="เรียลไทม์"
                        color="orange"
                    />
                </div>

                {/* CTA Button */}
                <Button
                    onClick={() => setShowDialog(true)}
                    className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl text-xl shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                >
                    <span>เริ่มเลย!</span>
                    <ArrowRight className="w-6 h-6 ml-2" />
                </Button>

                {/* Subtitle */}
                <p className="text-slate-400 text-sm mt-4">
                    สร้างห้องใหม่ หรือ เข้าร่วมห้องเพื่อน
                </p>
            </motion.div>

            {/* Create/Join Dialog */}
            <CreateJoinRoomDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onRoomJoined={handleRoomJoined}
            />
        </div>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    label: string;
    color: 'purple' | 'teal' | 'orange';
}

function FeatureCard({ icon, label, color }: FeatureCardProps) {
    const colorClasses = {
        purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
        teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
        orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border ${colorClasses[color]} flex flex-col items-center gap-2`}
        >
            {icon}
            <span className="text-xs font-medium text-slate-300">{label}</span>
        </motion.div>
    );
}
