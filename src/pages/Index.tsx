import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Puzzle, RefreshCw, Sparkles, TrendingUp, Headphones } from "lucide-react";
import BackgroundDecorations from "@/components/BackgroundDecorations";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <BackgroundDecorations />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-32 pb-24 text-center">
        <h1 className="text-6xl md:text-8xl font-poppins font-bold mb-8 leading-tight tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-primary">
            Promjum
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed font-prompt">
          เพื่อน AI ที่ช่วยให้คุณเก่งภาษาขึ้นในทุกๆวัน
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-base px-8 py-6 rounded-lg"
            variant="default"
            asChild
          >
            <Link to="/auth">
              เริ่มใช้งานฟรี
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-base px-8 py-6 rounded-lg"
          >
            เรียนรู้เพิ่มเติม
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold">AI เข้าใจสำเนียงของคุณ</h3>
            <p className="text-muted-foreground leading-relaxed">
              วิเคราะห์และให้คำแนะนำรายคำอย่างตรงจุด
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Puzzle className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold">Decks ที่เหมาะกับคุณ</h3>
            <p className="text-muted-foreground leading-relaxed">
              เลือกหมวดที่สนใจและเริ่มเรียนรู้
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold">ระบบ SRS + เกม</h3>
            <p className="text-muted-foreground leading-relaxed">
              ฝึกซ้ำอย่างมีประสิทธิภาพด้วยเกมสนุกๆ
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            ฝึกได้เหมือนมีครูส่วนตัว
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 text-left">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">พูดประโยคจริง</h3>
                <p className="text-muted-foreground">เลือกสถานการณ์ที่ต้องการฝึก</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-left">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">AI วิเคราะห์</h3>
                <p className="text-muted-foreground">ระบบจับจังหวะและความชัดเจนแบบเรียลไทม์</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-left">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">รับ Feedback</h3>
                <p className="text-muted-foreground">ได้คำแนะนำที่นำไปใช้ได้จริงทันที</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            ติดตามความก้าวหน้า
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-primary mb-2">
                7
              </div>
              <p className="text-muted-foreground">วันติดต่อกัน</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-primary mb-2">
                92
              </div>
              <p className="text-muted-foreground">คะแนนเฉลี่ย</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-primary mb-2">
                156
              </div>
              <p className="text-muted-foreground">คำที่เรียน</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-xl text-muted-foreground">
            เริ่มฝึกวันนี้ ฟรี ไม่มีค่าใช้จ่าย
          </p>
          
          <Button 
            size="lg" 
            className="text-base px-12 py-6 rounded-lg"
            asChild
          >
            <Link to="/auth">
              เริ่มใช้งานเลย
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 mb-6 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              เกี่ยวกับเรา
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              ติดต่อเรา
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              ข้อกำหนดและเงื่อนไข
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Promjum</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
