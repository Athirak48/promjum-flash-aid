import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    setName: string;
}

export function useCloneFolderSets() {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const cloneSets = async (
        selectedSetNames: string[],
        flashcards: Flashcard[],
        targetFolderId: string
    ) => {
        console.log('🚀 cloneSets called with:', {
            selectedSetNames,
            flashcardsCount: flashcards.length,
            targetFolderId,
            user: user?.id
        });

        if (!user) {
            console.error('❌ No user found');
            toast({
                title: 'กรุณาเข้าสู่ระบบ',
                description: 'คุณต้องเข้าสู่ระบบก่อนโคลน',
                variant: 'destructive'
            });
            return false;
        }

        setLoading(true);

        try {
            // Group flashcards by set name
            const groupedBySet = flashcards.reduce((acc, card) => {
                if (!acc[card.setName]) {
                    acc[card.setName] = [];
                }
                acc[card.setName].push(card);
                return acc;
            }, {} as Record<string, Flashcard[]>);

            // Clone each selected set
            for (const setName of selectedSetNames) {
                const setCards = groupedBySet[setName];
                console.log(`📦 Processing set: ${setName}, cards:`, setCards?.length);

                if (!setCards || setCards.length === 0) {
                    console.warn(`⚠️ No cards found for set: ${setName}`);
                    continue;
                }

                // Create new flashcard set with correct field names
                console.log('💾 Creating flashcard set:', {
                    user_id: user.id,
                    folder_id: targetFolderId,
                    title: setName,
                    card_count: setCards.length
                });

                const { data: newSet, error: setError } = await supabase
                    .from('user_flashcard_sets')
                    .insert({
                        user_id: user.id,
                        folder_id: targetFolderId,
                        title: setName,
                        card_count: setCards.length
                        // source will use DEFAULT 'created' from database
                    })
                    .select()
                    .single();

                if (setError) {
                    console.error('❌ Error creating set:', setError);
                    throw setError;
                }

                console.log('✅ Set created:', newSet);

                // Insert flashcards with correct field names
                const flashcardsToInsert = setCards.map(card => ({
                    user_id: user.id,
                    flashcard_set_id: newSet.id,
                    front_text: card.front, // Changed to front_text
                    back_text: card.back    // Changed to back_text
                }));

                console.log('💾 Inserting flashcards:', flashcardsToInsert.length);

                const { error: cardsError } = await supabase
                    .from('user_flashcards')
                    .insert(flashcardsToInsert);

                if (cardsError) {
                    console.error('❌ Error creating flashcards:', cardsError);
                    throw cardsError;
                }

                console.log(`✅ Inserted ${flashcardsToInsert.length} flashcards`);
            }

            toast({
                title: 'โคลนสำเร็จ! 🎉',
                description: `โคลน ${selectedSetNames.length} ชุดเรียบร้อยแล้ว`
            });

            return true;
        } catch (error: any) {
            console.error('❌ Error cloning sets:', error);

            // Show detailed error message
            const errorMessage = error?.message || error?.error_description || 'ไม่สามารถโคลนได้ กรุณาลองใหม่';
            const errorCode = error?.code || '';

            toast({
                title: 'เกิดข้อผิดพลาด',
                description: `${errorMessage}${errorCode ? ` (${errorCode})` : ''}`,
                variant: 'destructive'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { cloneSets, loading };
}
