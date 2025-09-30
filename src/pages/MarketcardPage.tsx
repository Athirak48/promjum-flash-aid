import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ShoppingCart, Star, User, BookOpen, DollarSign } from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface MarketcardProduct {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  price: number;
  sellerName: string;
  category: string;
  rating: number;
  reviewCount: number;
  coverImage?: string;
  featured: boolean;
}

export default function MarketcardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const { cards, loading } = useMarketplace();

  // Transform marketplace cards to product format
  const products: MarketcardProduct[] = cards.map((card, index) => ({
    id: card.id,
    title: card.flashcard?.front_text || 'แฟลชการ์ด',
    description: `เรียนรู้: ${card.flashcard?.back_text || 'คำแปล'}`,
    cardCount: 1,
    price: card.price,
    sellerName: 'ผู้ขาย',
    category: 'ภาษา',
    rating: 4.0 + (index % 10) * 0.1,
    reviewCount: 10 + (index % 50),
    featured: index < 2
  }));

  const categories = ['ทั้งหมด', 'ภาษา', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'สังคมศึกษา', 'อื่นๆ'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marketcard</h1>
          <p className="text-muted-foreground">ตลาดแฟลชการ์ดออนไลน์ ซื้อ-ขาย แฟลชการ์ดคุณภาพสูง</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ค้นหาแฟลชการ์ด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="ภาษา">ภาษา</SelectItem>
              <SelectItem value="คณิตศาสตร์">คณิตศาสตร์</SelectItem>
              <SelectItem value="วิทยาศาสตร์">วิทยาศาสตร์</SelectItem>
              <SelectItem value="สังคมศึกษา">สังคมศึกษา</SelectItem>
              <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">ความนิยม</SelectItem>
              <SelectItem value="rating">คะแนนรีวิว</SelectItem>
              <SelectItem value="price-low">ราคาต่ำ - สูง</SelectItem>
              <SelectItem value="price-high">ราคาสูง - ต่ำ</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full lg:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            ลงขาย
          </Button>
        </div>

        {/* Featured Products */}
        {products.some(p => p.featured) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              แฟลชการ์ดแนะนำ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.filter(p => p.featured).map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="default" className="mb-2">
                        <Star className="h-3 w-3 mr-1" />
                        แนะนำ
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{product.cardCount} การ์ด</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{product.sellerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold text-primary">
                        <DollarSign className="h-4 w-4" />
                        {product.price}
                      </div>
                    </div>

                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      ซื้อเลย
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">แฟลชการ์ดทั้งหมด ({sortedProducts.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{product.cardCount} การ์ด</span>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-muted-foreground">{product.sellerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <DollarSign className="h-4 w-4" />
                    {product.price}
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  ซื้อเลย
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่พบสินค้า</h3>
            <p className="text-muted-foreground mb-4">
              ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่
            </p>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              ค้นหาใหม่
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}