import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Puzzle, RefreshCw, Sparkles, TrendingUp, Headphones } from "lucide-react";
import BackgroundDecorations from "@/components/BackgroundDecorations";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <BackgroundDecorations />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-20 pb-32 text-center z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-primary/20 mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">เพื่อน AI ที่ช่วยให้คุณเก่งภาษา</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-poppins">
          <span className="text-transparent bg-clip-text bg-gradient-primary">
            Promjum
          </span>
          <br />
          <span className="text-foreground">ช่วยให้คุณเก่งภาษา</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-primary">
            ขึ้นในทุกๆวัน
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-3 leading-relaxed font-prompt">
          ออกเดินทางสู่ความคล่องแคล่ว... ฝึกฟัง พูด อ่าน เขียน
        </p>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto mb-12 font-prompt">
          ด้วยระบบ AI ที่เข้าใจสำเนียงคุณจริงๆ<br />
          เริ่มจากสิ่งที่คุณสนใจ และเห็นพัฒนาการได้ทุกวัน
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-prompt"
            asChild
          >
            <Link to="/auth">
              เริ่มเรียนฟรีเลย 🚀
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-10 py-7 rounded-2xl border-2 border-primary/40 bg-white/50 backdrop-blur-sm hover:bg-white/80 font-prompt"
          >
            ดูวิธีการทำงาน
          </Button>
        </div>
      </section>

      {/* What is Promjum Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3 text-foreground font-poppins">
            Promjum คืออะไร? <Sparkles className="w-8 h-8 text-primary" />
          </h2>
          <p className="text-lg text-foreground/80 max-w-4xl mx-auto leading-relaxed font-prompt">
            เราเชื่อว่าการเรียนภาษาคือการ "ค้นพบจักรวาลคำศัพท์เฉพาะตัว" 
            Promjum ใช้ AI วิเคราะห์เสียง พฤติกรรม และคำศัพท์ของคุณ 
            เพื่อสร้างเส้นทางการเรียนรู้เฉพาะตัวที่จำง่าย ใช้ได้จริง
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-primary/20 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-6 mx-auto">
              <Brain className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-foreground font-poppins">AI เข้าใจสำเนียงของคุณ</h3>
            <p className="text-foreground/70 text-center leading-relaxed font-prompt">
              ฟังเสียงจริง วิเคราะห์ และให้คำแนะนำรายคำอย่างตรงจุด
            </p>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur-sm border-primary/20 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center mb-6 mx-auto">
              <Puzzle className="w-8 h-8 text-accent-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-foreground font-poppins">เรียนด้วย Decks ที่เหมาะกับคุณ</h3>
            <p className="text-foreground/70 text-center leading-relaxed font-prompt">
              เริ่มจากหมวดที่สนใจ เช่น ชีวิตประจำวัน / ท่องเที่ยว / ทำงาน เหมือนเลือก "ดวงดาวที่อยากไป"
            </p>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur-sm border-primary/20 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mb-6 mx-auto">
              <RefreshCw className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-foreground font-poppins">จำได้ยาว ด้วยระบบ SRS + เกม</h3>
            <p className="text-foreground/70 text-center leading-relaxed font-prompt">
              ฝึกซ้ำตามช่วงเวลาที่เหมาะสม พร้อมมินิเกมสนุกๆ เพื่อให้จำได้ยาวเหมือน "การเดินทางในวงโคจร"
            </p>
          </Card>
        </div>
      </section>

      {/* Experience Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-foreground font-poppins">
            ฝึกได้เหมือนมีครูอยู่ข้างๆ ตลอดเวลา
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-primary/10">
                <div className="space-y-4">
                  <div className="bg-primary/20 backdrop-blur-sm rounded-2xl p-4 ml-auto max-w-[80%]">
                    <p className="text-sm font-medium text-foreground/80 font-prompt">ผู้ใช้:</p>
                    <p className="text-lg text-foreground font-poppins">"I want to go to the restaurant"</p>
                  </div>
                  <div className="bg-accent/30 backdrop-blur-sm rounded-2xl p-4 mr-auto max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-5 h-5 text-accent-foreground" />
                      <p className="text-sm font-medium text-foreground/80 font-prompt">AI Feedback:</p>
                    </div>
                    <p className="text-base text-foreground font-prompt">ดีมาก! ออกเสียง "restaurant" ได้ชัดเจน ✨</p>
                    <p className="text-sm text-foreground/60 mt-2 font-prompt">คะแนนความชัด: 92/100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground font-poppins">พูดประโยคจริงในชีวิตประจำวัน</h3>
                  <p className="text-foreground/70 font-prompt">เลือกสถานการณ์ที่คุณต้องการฝึก และพูดตามจริง</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground font-poppins">ระบบจับจังหวะ + ความชัดเจน</h3>
                  <p className="text-foreground/70 font-prompt">AI วิเคราะห์เสียงของคุณแบบเรียลไทม์</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-primary-glow mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground font-poppins">แนะนำวิธีพูดให้ดีขึ้นทันที</h3>
                  <p className="text-foreground/70 font-prompt">ได้รับ feedback ที่เข้าใจง่ายและนำไปใช้ได้จริง</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3 text-foreground font-poppins">
            เห็นความก้าวหน้าของคุณ... ทุกครั้งที่ฝึก 💫
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/20 mt-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-primary mb-2 font-poppins">
                  7
                </div>
                <p className="text-lg text-foreground/70 font-prompt">วันติดต่อกัน 🔥</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-secondary mb-2 font-poppins">
                  92
                </div>
                <p className="text-lg text-foreground/70 font-prompt">Starlight Score ⭐</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-hero mb-2 font-poppins">
                  156
                </div>
                <p className="text-lg text-foreground/70 font-prompt">คำที่เรียนไปแล้ว 📚</p>
              </div>
            </div>

            <div className="bg-accent/20 rounded-2xl p-6 max-w-2xl mx-auto">
              <TrendingUp className="w-8 h-8 text-accent-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2 text-foreground font-poppins">
                "ทุกครั้งที่คุณพูด ระบบจะให้คะแนน (Starlight Score) + คำแนะนำรายคำ"
              </p>
              <p className="text-foreground/70 font-prompt">
                Promjum จะสรุปผลรายสัปดาห์ พร้อมคำแนะนำส่วนตัว เพื่อให้คุณรักษา Streak ไว้ได้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative container mx-auto px-4 py-32 text-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-primary/10 rounded-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground font-poppins">
            พร้อมจะออกเดินทางสู่ความคล่องแคล่ว...
            <br />
            กับเพื่อน AI ส่วนตัวของคุณไหม?
          </h2>
          <p className="text-xl md:text-2xl text-foreground/70 mb-8 font-prompt">
            เริ่มฝึกวันนี้ ฟรี ไม่มีค่าใช้จ่าย
          </p>
          
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-2xl hover:shadow-glow transition-all hover:scale-110 mb-6 font-prompt"
            asChild
          >
            <Link to="/auth">
              เริ่มเรียนกับ Promjum ฟรี 🚀
            </Link>
          </Button>

          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-primary/20 shadow-sm">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-medium text-foreground font-prompt">เรียนฟรีได้ทันที ไม่ต้องใส่บัตรเครดิต</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-border/40 py-12 z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-primary mb-2 font-poppins">
              Promjum
            </h3>
            <p className="text-sm text-foreground/70 font-prompt">พร้อมจำ พร้อมเข้าใจ</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors font-prompt">
              เกี่ยวกับเรา
            </Link>
            <Link to="/contact" className="text-foreground/70 hover:text-foreground transition-colors font-prompt">
              ติดต่อเรา
            </Link>
            <Link to="/privacy" className="text-foreground/70 hover:text-foreground transition-colors font-prompt">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link to="/terms" className="text-foreground/70 hover:text-foreground transition-colors font-prompt">
              ข้อกำหนดและเงื่อนไข
            </Link>
          </div>

          <div className="text-center text-sm text-foreground/60 font-prompt">
            <p>© 2025 Promjum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
