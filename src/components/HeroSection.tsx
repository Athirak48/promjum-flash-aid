import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Brain, Gamepad2 } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background hero image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Promjum - เปลี่ยนเอกสารให้เป็นแฟลชการ์ด" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
      </div>
      
      {/* Additional decorative overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(280_100%_85%/0.1),transparent_70%)]"></div>
      
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm mb-8">
            <span className="text-primary font-medium">✨ ใหม่! ระบบ AI อัจฉริยะ</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              เปลี่ยนเอกสาร
            </span>
            <br />
            <span className="text-foreground">ให้เป็น</span>{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              แฟลชการ์ด
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            เปลี่ยนเอกสารกองโตให้เป็นแฟลชการ์ดในระยะเวลาสั้น
            <br />
            ด้วยพลัง AI ที่จะช่วยให้คุณเรียนรู้อย่างมีประสิทธิภาพ
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth">
                เริ่มใช้งานฟรี
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              ดูตัวอย่าง
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-card shadow-soft">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">อัปโหลดไฟล์</h3>
              <p className="text-muted-foreground">
                รองรับไฟล์ PDF, Word, PowerPoint และอีกมากมาย
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-card shadow-soft">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ประมวลผลด้วย AI</h3>
              <p className="text-muted-foreground">
                AI อัจฉริยะจะสรุปและสร้างแฟลชการ์ดโดยอัตโนมัติ
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-card shadow-soft">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Gamepad2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ทบทวนอย่างมีประสิทธิภาพ</h3>
              <p className="text-muted-foreground">
                เล่นเกมและทบทวนด้วยระบบ Spaced Repetition
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-16 pt-8 border-t border-border/40">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">1000+</div>
              <div className="text-sm text-muted-foreground">ไฟล์ที่ประมวลผล</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">500+</div>
              <div className="text-sm text-muted-foreground">ผู้ใช้ที่มีความสุข</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">50k+</div>
              <div className="text-sm text-muted-foreground">แฟลชการ์ดที่สร้าง</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;