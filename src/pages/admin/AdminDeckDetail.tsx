import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Edit, Trash2, BookOpen, Star, Lock, Eye, EyeOff } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CreateSubDeckDialog } from '@/components/admin/CreateSubDeckDialog';
import { CreateDeckDialog } from '@/components/admin/CreateDeckDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminDeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<any>(null);
  const [subDecks, setSubDecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSubDeck, setShowCreateSubDeck] = useState(false);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [editingSubDeck, setEditingSubDeck] = useState<any>(null);
  const [deletingSubDeck, setDeletingSubDeck] = useState<any>(null);
  const [showDeleteDeck, setShowDeleteDeck] = useState(false);

  useEffect(() => {
    fetchDeckAndSubDecks();
  }, [deckId]);

  const fetchDeckAndSubDecks = async () => {
    try {
      setIsLoading(true);

      // Fetch deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (deckError) throw deckError;
      setDeck(deckData);

      // Fetch subdecks
      const { data: subDecksData, error: subDecksError } = await supabase
        .from('sub_decks')
        .select('*')
        .eq('deck_id', deckId)
        .order('display_order', { ascending: true });

      if (subDecksError) throw subDecksError;
      setSubDecks(subDecksData || []);
    } catch (error) {
      console.error('Error fetching deck data:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Deck ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubDeck = async () => {
    if (!deletingSubDeck) return;

    try {
      const { error } = await supabase
        .from('sub_decks')
        .delete()
        .eq('id', deletingSubDeck.id);

      if (error) throw error;

      toast.success('ลบ Subdeck สำเร็จ');
      setDeletingSubDeck(null);
      fetchDeckAndSubDecks();
    } catch (error) {
      console.error('Error deleting subdeck:', error);
      toast.error('ไม่สามารถลบ Subdeck ได้');
    }
  };

  const handleTogglePublish = async (subDeckId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sub_decks')
        .update({
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', subDeckId);

      if (error) throw error;

      toast.success(!currentStatus ? 'เผยแพร่ Subdeck สำเร็จ' : 'ซ่อน Subdeck จาก User แล้ว');
      fetchDeckAndSubDecks();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleDeleteDeck = async () => {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      toast.success('ลบ Deck สำเร็จ');
      navigate('/admin/decks');
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('ไม่สามารถลบ Deck ได้');
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return 'เริ่มต้น';
      case 'intermediate': return 'กลาง';
      case 'advanced': return 'ขั้นสูง';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูล Deck</h1>
          <Button onClick={() => navigate('/admin/decks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้า Decks
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = (Icons as any)[deck.icon] || Icons.BookOpen;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/decks')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-xl bg-gradient-primary shadow-soft">
              <IconComponent className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{deck.name}</h1>
                {deck.is_premium && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Premium
                  </Badge>
                )}
                <Badge variant={deck.is_published ? 'default' : 'secondary'}>
                  {deck.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg mb-2">{deck.name_en}</p>
              <p className="text-foreground/80">{deck.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>หมวดหมู่: {deck.category}</span>
                <span>•</span>
                <span>ระดับ: {deck.level}</span>
                <span>•</span>
                <span>{deck.total_flashcards} คำศัพท์</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDeck(true)}>
            <Edit className="w-4 h-4 mr-2" />
            แก้ไข Deck
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDeck(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            ลบ Deck
          </Button>
        </div>
      </div>

      {/* Subdecks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subdecks</CardTitle>
              <CardDescription>จัดการ Subdeck ทั้งหมดใน Deck นี้</CardDescription>
            </div>
            <Button onClick={() => setShowCreateSubDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม Subdeck
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subDecks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">ยังไม่มี Subdeck</h3>
              <p className="text-muted-foreground mb-4">เริ่มสร้าง Subdeck แรกของคุณ</p>
              <Button onClick={() => setShowCreateSubDeck(true)}>
                <Plus className="w-4 h-4 mr-2" />
                สร้าง Subdeck
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {subDecks.map((subdeck) => (
                <Card key={subdeck.id} className="border-l-4">
                  <CardContent className="p-6">
                     <div 
                      className="flex items-center justify-between gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/admin/decks/${deckId}/subdecks/${subdeck.id}`)}
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl mb-1">{subdeck.name}</CardTitle>
                          {!subdeck.is_published && (
                            <Badge variant="secondary" className="text-xs">
                              ไม่เผยแพร่
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{subdeck.name_en}</CardDescription>

                        <p className="text-sm text-foreground/70 line-clamp-2">
                          {subdeck.description}
                        </p>

                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge className={`${getDifficultyColor(subdeck.difficulty_level)} border`}>
                            {getDifficultyText(subdeck.difficulty_level)}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>{subdeck.flashcard_count} คำศัพท์</span>
                          </div>
                          {!subdeck.is_free && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant={subdeck.is_published ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePublish(subdeck.id, subdeck.is_published)}
                          className="gap-2 w-full"
                        >
                          {subdeck.is_published ? (
                            <>
                              <Eye className="w-4 h-4" />
                              แสดงให้ User
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              ซ่อนจาก User
                            </>
                          )}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSubDeck(subdeck)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไข
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSubDeck(subdeck)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSubDeckDialog
        open={showCreateSubDeck || !!editingSubDeck}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateSubDeck(false);
            setEditingSubDeck(null);
          }
        }}
        onSuccess={fetchDeckAndSubDecks}
        deckId={deckId!}
        subdeck={editingSubDeck}
      />

      <CreateDeckDialog
        open={showEditDeck}
        onOpenChange={setShowEditDeck}
        onSuccess={fetchDeckAndSubDecks}
        deck={deck}
      />

      <AlertDialog open={!!deletingSubDeck} onOpenChange={() => setDeletingSubDeck(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Subdeck</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ "{deletingSubDeck?.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubDeck}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDeck} onOpenChange={setShowDeleteDeck}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Deck</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ "{deck?.name}"? การดำเนินการนี้จะลบ Subdeck และ Flashcard ทั้งหมดด้วย และไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeck} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ Deck
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}