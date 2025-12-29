import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Copy, BookOpen, Users, ArrowLeft, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunitySubdecks, useSubdeckFlashcards, PublicDeck } from '@/hooks/usePublicDecks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FolderSelectionDialog } from '@/components/FolderSelectionDialog';

interface CommunityDeckDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: PublicDeck | null;
  currentUserId?: string;
}

export function CommunityDeckDetailDialog({
  open,
  onOpenChange,
  deck,
  currentUserId
}: CommunityDeckDetailDialogProps) {
  const [selectedSubdeckId, setSelectedSubdeckId] = useState<string | null>(null);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [selectedSubdecksToClone, setSelectedSubdecksToClone] = useState<Set<string>>(new Set());

  const { subdecks, loading: loadingSubdecks } = useCommunitySubdecks(deck?.id || null);
  const { flashcards, loading: loadingFlashcards } = useSubdeckFlashcards(selectedSubdeckId);

  const isOwner = currentUserId && deck?.creator_user_id === currentUserId;

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedSubdeckId(null);
      setSelectedSubdecksToClone(new Set());
    }
  }, [open]);

  const toggleSubdeckSelection = (subdeckId: string) => {
    setSelectedSubdecksToClone(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subdeckId)) {
        newSet.delete(subdeckId);
      } else {
        newSet.add(subdeckId);
      }
      return newSet;
    });
  };

  const handleCloneSelected = () => {
    if (selectedSubdecksToClone.size === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 ชุด');
      return;
    }
    setShowFolderDialog(true);
  };

  const handleFolderSelect = async (folderId: string) => {
    if (!deck) return;

    setCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('กรุณาเข้าสู่ระบบ');

      // Clone each selected subdeck
      for (const subdeckId of selectedSubdecksToClone) {
        const subdeck = subdecks.find(s => s.id === subdeckId);
        if (!subdeck) continue;

        // Create new flashcard set
        const { data: newSet, error: setError } = await supabase
          .from('user_flashcard_sets')
          .insert({
            user_id: user.id,
            folder_id: folderId,
            title: subdeck.name,
            source: 'community',
            card_count: subdeck.card_count
          })
          .select()
          .single();

        if (setError) throw setError;

        // Copy flashcards
        const { data: sourceCards } = await supabase
          .from('user_flashcards')
          .select('*')
          .eq('flashcard_set_id', subdeckId);

        if (sourceCards && sourceCards.length > 0) {
          const mappedCards = sourceCards.map(c => ({
            flashcard_set_id: newSet.id,
            user_id: user.id,
            front_text: c.front_text,
            back_text: c.back_text,
            front_image_url: c.front_image_url,
            back_image_url: c.back_image_url,
            part_of_speech: c.part_of_speech
          }));

          await supabase.from('user_flashcards').insert(mappedCards);
        }
      }

      // Increment clone count
      await supabase
        .from('user_flashcard_sets')
        .update({ clone_count: (deck.clone_count || 0) + 1 })
        .eq('id', deck.id);

      toast.success(`โคลน ${selectedSubdecksToClone.size} ชุดสำเร็จ! 🎉`);
      setShowFolderDialog(false);
      setSelectedSubdecksToClone(new Set());
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error cloning:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setCloning(false);
    }
  };

  if (!deck) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-slate-900 text-white border-slate-700 p-0">
          <DialogHeader className="p-6 pb-4 border-b border-slate-700">
            <div className="flex items-start gap-4">
              {selectedSubdeckId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSubdeckId(null)}
                  className="text-white/60 hover:text-white hover:bg-white/10 -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {selectedSubdeckId
                    ? subdecks.find(s => s.id === selectedSubdeckId)?.name
                    : deck.name}
                </DialogTitle>
                {!selectedSubdeckId && (
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Avatar className="w-6 h-6 border border-white/20">
                      <AvatarImage src={deck.creator_avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                        {deck.creator_nickname?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{deck.creator_nickname}</span>
                    {isOwner && (
                      <Badge className="bg-purple-600 text-white border-purple-400">Owner</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {!selectedSubdeckId && (
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium">{deck.total_sets} ชุด</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <BookOpen className="w-3.5 h-3.5 text-green-400" />
                  <span className="font-medium">{deck.total_flashcards} คำศัพท์</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-medium">{deck.clone_count} โคลน</span>
                </div>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 max-h-[50vh]">
            {selectedSubdeckId ? (
              // Flashcard Preview
              loadingFlashcards ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flashcards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <p className="text-white font-medium mb-1">{card.front_text}</p>
                      <p className="text-white/60 text-sm">{card.back_text}</p>
                      {card.part_of_speech && (
                        <Badge className="mt-2 bg-white/10 text-white/50 border-white/10 text-xs">
                          {card.part_of_speech}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                  {flashcards.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-white/40">
                      ไม่พบคำศัพท์ในชุดนี้
                    </div>
                  )}
                </div>
              )
            ) : (
              // Subdeck List
              loadingSubdecks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {subdecks.map((subdeck, index) => (
                    <motion.div
                      key={subdeck.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedSubdecksToClone.has(subdeck.id)
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => toggleSubdeckSelection(subdeck.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedSubdecksToClone.has(subdeck.id)
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-white/30'
                        }`}>
                          {selectedSubdecksToClone.has(subdeck.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{subdeck.name}</h4>
                          <p className="text-white/50 text-sm">{subdeck.card_count} คำศัพท์</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubdeckId(subdeck.id);
                        }}
                        className="text-white/60 hover:text-white hover:bg-white/10 gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </motion.div>
                  ))}
                  {subdecks.length === 0 && (
                    <div className="text-center py-12 text-white/40">
                      ไม่พบชุดคำศัพท์ใน Deck นี้
                    </div>
                  )}
                </div>
              )
            )}
          </ScrollArea>

          {/* Footer */}
          {!selectedSubdeckId && subdecks.length > 0 && !isOwner && (
            <div className="p-6 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">
                  เลือก {selectedSubdecksToClone.size} จาก {subdecks.length} ชุด
                </p>
                <Button
                  onClick={handleCloneSelected}
                  disabled={selectedSubdecksToClone.size === 0 || cloning}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold gap-2"
                >
                  {cloning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังโคลน...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      โคลนที่เลือก
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FolderSelectionDialog
        open={showFolderDialog}
        onOpenChange={setShowFolderDialog}
        onSelectFolder={handleFolderSelect}
      />
    </>
  );
}