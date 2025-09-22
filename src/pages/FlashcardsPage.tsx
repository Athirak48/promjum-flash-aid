import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Brain, GamepadIcon, Settings, BookOpen, Clock, Zap } from 'lucide-react';

interface FlashcardSet {
  id: string;
  title: string;
  cardCount: number;
  source: 'created' | 'uploaded' | 'marketcard';
  lastReviewed: string;
  nextReview: string;
  progress: number;
}

export default function FlashcardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Mock data - replace with real data from Supabase
  const flashcardSets: FlashcardSet[] = [
    {
      id: '1',
      title: 'คำศัพท์ภาษาอังกฤษ TOEIC',
      cardCount: 150,
      source: 'uploaded',
      lastReviewed: '2024-01-20',
      nextReview: '2024-01-22',
      progress: 75
    },
    {
      id: '2', 
      title: 'ประวัติศาสตร์ไทย',
      cardCount: 85,
      source: 'created',
      lastReviewed: '2024-01-19',
      nextReview: '2024-01-21',
      progress: 60
    },
    {
      id: '3',
      title: 'คณิตศาสตร์ ม.6',
      cardCount: 200,
      source: 'marketcard',
      lastReviewed: '2024-01-18',
      nextReview: '2024-01-23',
      progress: 40
    }
  ];

  const getSourceBadge = (source: FlashcardSet['source']) => {
    const variants = {
      created: { variant: 'default' as const, label: 'สร้างเอง', icon: Plus },
      uploaded: { variant: 'secondary' as const, label: 'จากไฟล์', icon: BookOpen },
      marketcard: { variant: 'outline' as const, label: 'จาก Marketcard', icon: Zap }
    };
    
    const config = variants[source];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredSets = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || set.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">คลังแฟลชการ์ดส่วนตัว</h1>
          <p className="text-muted-foreground">จัดการและทบทวนแฟลชการ์ดของคุณ</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาชุดแฟลชการ์ด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="กรองตามแหล่งที่มา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="created">สร้างเอง</SelectItem>
              <SelectItem value="uploaded">จากไฟล์</SelectItem>
              <SelectItem value="marketcard">จาก Marketcard</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            สร้างแฟลชการ์ด
          </Button>
        </div>

        {/* Flashcard Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2">{set.title}</CardTitle>
                  {getSourceBadge(set.source)}
                </div>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span>{set.cardCount} การ์ด</span>
                  <span>•</span>
                  <span>ความคืบหน้า {set.progress}%</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>ความคืบหน้า</span>
                    <span>{set.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(set.progress)}`}
                      style={{ width: `${set.progress}%` }}
                    />
                  </div>
                </div>

                {/* Review Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>ทบทวนล่าสุด: {new Date(set.lastReviewed).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>ทบทวนครั้งถัดไป: {new Date(set.nextReview).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <Brain className="h-4 w-4 mr-1" />
                    ทบทวน
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <GamepadIcon className="h-4 w-4 mr-1" />
                    เล่นเกม
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSets.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่พบชุดแฟลชการ์ด</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterSource !== 'all' 
                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่' 
                : 'เริ่มต้นสร้างชุดแฟลชการ์ดแรกของคุณ'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              สร้างแฟลชการ์ด
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}