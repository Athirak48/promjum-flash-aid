import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FolderPlus, Search, Plus } from 'lucide-react';

interface FolderSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectFolder: (folderId: string, folderName: string) => void;
}

export const FolderSelectionDialog = ({ open, onOpenChange, onSelectFolder }: FolderSelectionDialogProps) => {
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchFolders();
            setSearchTerm('');
            setIsCreating(false);
            setNewFolderName('');
        }
    }, [open]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setFolders([]);
                return;
            }

            const { data, error } = await supabase
                .from('user_folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFolders(data || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            setCreatingLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('user_folders')
                .insert([{
                    user_id: user.id,
                    title: newFolderName.trim(),
                    card_sets_count: 0
                }])
                .select()
                .single();

            if (error) throw error;

            setFolders([data, ...folders]);
            setNewFolderName('');
            setIsCreating(false);
            setSelectedFolder(data.id);
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setCreatingLoading(false);
        }
    };

    const handleSave = () => {
        if (selectedFolder) {
            const folder = folders.find(f => f.id === selectedFolder);
            if (folder) {
                onSelectFolder(folder.id, folder.title);
            }
        }
    };

    const filteredFolders = folders.filter(folder =>
        folder.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>เลือกโฟลเดอร์เพื่อเก็บ</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and Create Section */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="ค้นหาโฟลเดอร์..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsCreating(!isCreating)}
                            title="สร้างโฟลเดอร์ใหม่"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Create New Folder Input */}
                    {isCreating && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2">
                            <Input
                                placeholder="ชื่อโฟลเดอร์ใหม่..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                autoFocus
                            />
                            <Button
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || creatingLoading}
                            >
                                {creatingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'สร้าง'}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredFolders.length === 0 ? (
                            <div className="text-center py-8 space-y-3">
                                <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                    <FolderPlus className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm ? 'ไม่พบโฟลเดอร์ที่ค้นหา' : 'ยังไม่มีโฟลเดอร์'}
                                </p>
                            </div>
                        ) : (
                            <RadioGroup value={selectedFolder} onValueChange={setSelectedFolder} className="max-h-[300px] overflow-y-auto pr-2">
                                {filteredFolders.map((folder) => (
                                    <div key={folder.id} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors cursor-pointer ${selectedFolder === folder.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                                        <RadioGroupItem value={folder.id} id={folder.id} />
                                        <Label htmlFor={folder.id} className="flex-1 cursor-pointer">
                                            <div className="font-medium">{folder.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(folder.created_at).toLocaleDateString('th-TH')}
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!selectedFolder}
                        >
                            บันทึก
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
