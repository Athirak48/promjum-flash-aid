import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import BackgroundDecorations from "@/components/BackgroundDecorations";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BackgroundDecorations />
      <div className="w-full max-w-md">
        <Card className="bg-gradient-card shadow-large border-0 text-center">
          <CardHeader>
            <div className="text-8xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
              404
            </div>
            <CardTitle className="text-2xl mb-2">ไม่พบหน้าที่ต้องการ</CardTitle>
            <CardDescription className="text-base">
              ขออภัย หน้าที่คุณค้นหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="hero" asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  กลับหน้าหลัก
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard">
                  <Search className="mr-2 h-4 w-4" />
                  ไปที่แดชบอร์ด
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-3">
                หรือลองเมนูเหล่านี้
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/flashcards">แฟลชการ์ด</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/marketcard">ตลาดการ์ด</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">เข้าสู่ระบบ</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/feedback">ติดต่อเรา</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ยังต้องการความช่วยเหลือ?{" "}
            <Button variant="link" size="sm" className="p-0 h-auto text-sm">
              ติดต่อทีมงาน
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;