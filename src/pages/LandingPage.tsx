import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import {
  Star,
  MessageCircle,
  Zap,
  BookOpen,
  Gamepad2,
  TrendingUp,
  Mic,
  CheckCircle2,
  Layers,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";
import promjumLogo from "@/assets/promjum-logo.png";

const LandingPage = () => {
  const reviews = [
    {
      name: "มายด์",
      role: "นักศึกษา",
      content: "ฝึก 10 วัน พูดได้คล่องขึ้นจริง ระบบ AI แนะนำตรงจุดมาก",
      rating: 5,
      avatar: "👩‍🎓"
    },
    {
      name: "ป้อม",
      role: "พนักงานออฟฟิศ",
      content: "ระบบให้คำแนะนำตรงจุด เหมือนครูส่วนตัวเลย ชอบมาก",
      rating: 5,
      avatar: "👨‍💻"
    },
    {
      name: "พี่นัท",
      role: "ฟรีแลนซ์",
      content: "พูดกับลูกค้าต่างชาติได้มั่นใจขึ้นเยอะ แนะนำเลยครับ",
      rating: 5,
      avatar: "🎨"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background font-prompt">
      <BackgroundDecorations />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-sm animate-fade-in">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-bold text-primary">พร้อมจำ... ง่าย สะดวก ได้ผลจริง</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-tight">
            จำศัพท์ใหม่
            <br />
            <span className="text-primary">ไม่ลืมคำเก่า</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            เรียนรู้ง่าย สะดวก ทุกที่ทุกเวลา ด้วยระบบช่วยจำอัจฉริยะ
            <br className="hidden md:block" />
            ที่ทำให้การเก่งภาษาเป็นเรื่องง่ายสำหรับคุณ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-xl" asChild>
              <Link to="/auth">
                เริ่มใช้งานฟรี
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xl border-2" asChild>
              <a href="#features">
                ดูฟีเจอร์ทั้งหมด
              </a>
            </Button>
          </div>

          {/* Hero Image / Illustration Placeholder */}
          <div className="pt-16 relative z-10">
            <div className="bg-white rounded-[3rem] p-8 shadow-large max-w-4xl mx-auto border-4 border-white/50 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-4xl">
                    🎧
                  </div>
                  <h3 className="font-bold text-lg">ฝึกฟังจริง</h3>
                  <p className="text-sm text-muted-foreground">ฟังสำเนียงที่ถูกต้องจาก AI</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl">
                    🧠
                  </div>
                  <h3 className="font-bold text-lg">จำแม่น</h3>
                  <p className="text-sm text-muted-foreground">ด้วยระบบ SRS</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-4xl">
                    🎮
                  </div>
                  <h3 className="font-bold text-lg">สนุกเหมือนเกม</h3>
                  <p className="text-sm text-muted-foreground">ยิ่งเล่น ยิ่งเก่ง</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ฟีเจอร์ที่ช่วยให้คุณเก่งขึ้น</h2>
            <p className="text-muted-foreground text-lg">ครบทุกทักษะ ในที่เดียว</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-white" />}
              color="bg-blue-500"
              title="Flashcards"
              desc="เรียนรู้ผ่านบัตรคำศัพท์ที่มีภาพและเสียงประกอบ ช่วยให้จดจำได้ง่ายและแม่นยำ"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              color="bg-yellow-500"
              title="SRS System"
              desc="ระบบจัดตารางทบทวนอัจฉริยะ ช่วยให้คุณจำศัพท์ใหม่ได้โดยไม่ลืมคำเก่า"
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-white" />}
              color="bg-orange-500"
              title="Custom Decks"
              desc="เลือกเรียนรู้เฉพาะหมวดหมู่ที่คุณสนใจ จัดการคลังคำศัพท์ได้ด้วยตัวเอง"
            />
            <FeatureCard
              icon={<Headphones className="w-8 h-8 text-white" />}
              color="bg-purple-500"
              title="AI Listening & Reading"
              desc="ฝึกทักษะการฟังและอ่านจากคำศัพท์ที่คุณเลือก พร้อมสำเนียงที่ถูกต้องจาก AI"
            />
            <FeatureCard
              icon={<Gamepad2 className="w-8 h-8 text-white" />}
              color="bg-green-500"
              title="Mini Games"
              desc="สนุกกับการทบทวนคำศัพท์ผ่านเกมหลากหลายรูปแบบ ยิ่งเล่น ยิ่งจำได้"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8 text-white" />}
              color="bg-pink-500"
              title="AI Roleplay"
              desc="ฝึกแต่งประโยคและโต้ตอบสถานการณ์จริงกับ AI พร้อมคำแนะนำทันที"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">เสียงตอบรับจากผู้ใช้จริง</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="border-2 border-border shadow-soft hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="text-4xl bg-secondary/50 p-2 rounded-full">{review.avatar}</div>
                  <div>
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground/80 leading-relaxed">"{review.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-primary text-primary-foreground text-center px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">พร้อมจะเก่งภาษาอังกฤษหรือยัง?</h2>
          <p className="text-xl text-primary-foreground/80">เริ่มเรียนฟรีได้ทันที ไม่ต้องใช้บัตรเครดิต</p>
          <Button variant="secondary" size="lg" className="text-primary font-bold text-xl px-12 py-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all" asChild>
            <Link to="/auth">
              สร้างบัญชีฟรี
            </Link>
          </Button>
          <div className="flex justify-center gap-8 pt-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> ฟรีตลอดชีพ
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> ไม่ต้องผูกบัตร
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> ยกเลิกได้ตลอด
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={promjumLogo} alt="Logo" className="w-8 h-8 opacity-80" />
            <span className="font-bold text-foreground">Promjum</span>
          </div>
          <p>© 2024 Promjum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) => (
  <Card className="border-none shadow-none bg-transparent hover:bg-white/50 transition-colors p-4 rounded-3xl">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-md mb-6 mx-auto md:mx-0`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-center md:text-left">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-center md:text-left">
      {desc}
    </p>
  </Card>
);

export default LandingPage;