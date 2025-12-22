import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Swords, CheckCircle } from 'lucide-react';

interface University {
    id: string;
    name: string;
    short_name: string;
    total_score: number;
    total_players: number;
}

interface UniversitySelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (university: University) => void;
}

export default function UniversitySelectionDialog({
    open,
    onOpenChange,
    onSelect
}: UniversitySelectionDialogProps) {
    const [universities, setUniversities] = useState<University[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            fetchUniversities();
        }
    }, [open]);

    const fetchUniversities = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore - Table will exist after migration
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .order('name');

            if (error) throw error;
            setUniversities((data as unknown as University[]) || []);
        } catch (error) {
            console.error('Error fetching universities:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const filteredUniversities = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.short_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = async () => {
        if (!selectedUniversity) return;

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Insert or update user's university
            // @ts-ignore - Table will exist after migration
            const { error } = await supabase
                .from('user_universities')
                .upsert({
                    user_id: user.id,
                    university_id: selectedUniversity.id
                });

            if (error) throw error;

            onSelect(selectedUniversity);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving university:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
                {/* Header */}
                <div className="p-6 text-white text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Swords className="w-10 h-10 text-white" />
                    </motion.div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">
                            เข้าร่วมสงคราม! ⚔️
                        </DialogTitle>
                        <DialogDescription className="text-white/80">
                            เลือกมหาวิทยาลัยของคุณเพื่อเริ่มแข่งขัน
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="ค้นหามหาวิทยาลัย..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-full"
                        />
                    </div>

                    {/* University List */}
                    <ScrollArea className="h-[250px] pr-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {filteredUniversities.map((uni, index) => (
                                        <motion.div
                                            key={uni.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                        >
                                            <button
                                                onClick={() => setSelectedUniversity(uni)}
                                                className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedUniversity?.id === uni.id
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedUniversity?.id === uni.id
                                                    ? 'bg-white/20'
                                                    : 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                                                    }`}>
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{uni.name}</p>
                                                    <p className={`text-xs ${selectedUniversity?.id === uni.id
                                                        ? 'text-white/70'
                                                        : 'text-slate-500'
                                                        }`}>
                                                        {uni.short_name} • {uni.total_players?.toLocaleString() || 0} players
                                                    </p>
                                                </div>
                                                {selectedUniversity?.id === uni.id && (
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Confirm Button */}
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedUniversity || isSaving}
                        className="w-full mt-4 h-12 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Swords className="w-5 h-5 mr-2" />
                                {selectedUniversity ? `เข้าร่วม ${selectedUniversity.short_name}` : 'เลือกมหาวิทยาลัย'}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
