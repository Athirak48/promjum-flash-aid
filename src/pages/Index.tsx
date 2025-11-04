import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Puzzle, RefreshCw, Sparkles, TrendingUp, Headphones } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(265,100%,84%)] via-[hsl(252,100%,99%)] to-white">
      {/* Animated Stars Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[hsl(43,100%,81%)] rounded-full animate-twinkle"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-[hsl(43,100%,81%)] rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-white rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-[hsl(43,100%,81%)] rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-[hsl(265,100%,84%)]/30 mb-8">
          <Sparkles className="w-4 h-4 text-[hsl(265,100%,84%)]" />
          <span className="text-sm font-medium text-foreground">เพื่อน AI ที่ช่วยให้คุณเก่งภาษา</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(265,100%,84%)] to-[hsl(210,100%,85%)]">
            Promjum
          </span>
          <br />
          <span className="text-foreground">ช่วยให้คุณเก่งภาษา</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(265,100%,84%)] to-[hsl(210,100%,85%)]">
            ขึ้นในทุกๆวัน
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
          ออกเดินทางสู่ความคล่องแคล่ว... ฝึกฟัง พูด อ่าน เขียน
        </p>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          ด้วยระบบ AI ที่เข้าใจสำเนียงคุณจริง ๆ<br />
          เริ่มจากสิ่งที่คุณสนใจ และเห็นพัฒนาการได้ทุกวัน
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-[hsl(210,100%,85%)] hover:bg-[hsl(210,100%,80%)] text-[hsl(210,80%,40%)] rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            asChild
          >
            <Link to="/auth">
              เริ่มเรียนฟรีเลย 🚀
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl border-2 border-[hsl(265,100%,84%)] hover:bg-[hsl(265,100%,84%)]/10"
          >
            ดูวิธีการทำงาน
          </Button>
        </div>
      </section>

      {/* What is Promjum Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3">
            Promjum คืออะไร? <Sparkles className="w-8 h-8 text-[hsl(43,100%,81%)]" />
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            เราเชื่อว่าการเรียนภาษาคือการ "ค้นพบจักรวาลคำศัพท์เฉพาะตัว" 
            Promjum ใช้ AI วิเคราะห์เสียง พฤติกรรม และคำศัพท์ของคุณ 
            เพื่อสร้างเส้นทางการเรียนรู้เฉพาะตัวที่จำง่าย ใช้ได้จริง
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[hsl(265,100%,84%)]/20 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(265,100%,84%)] to-[hsl(265,100%,90%)] flex items-center justify-center mb-6 mx-auto">
              <Brain className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">AI เข้าใจสำเนียงของคุณ</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              ฟังเสียงจริง วิเคราะห์ และให้คำแนะนำ รายคำ อย่างตรงจุด
            </p>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[hsl(265,100%,84%)]/20 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(210,100%,85%)] to-[hsl(210,100%,90%)] flex items-center justify-center mb-6 mx-auto">
              <Puzzle className="w-8 h-8 text-[hsl(210,80%,40%)]" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">เรียนด้วย Decks ที่เหมาะกับคุณ</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              เริ่มจากหมวดที่สนใจ เช่น ชีวิตประจำวัน / ท่องเที่ยว / ทำงาน เหมือนเลือก "ดวงดาวที่อยากไป"
            </p>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[hsl(265,100%,84%)]/20 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(43,100%,81%)] to-[hsl(43,100%,90%)] flex items-center justify-center mb-6 mx-auto">
              <RefreshCw className="w-8 h-8 text-[hsl(43,80%,40%)]" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">จำได้ยาว ด้วยระบบ SRS + เกม</h3>
            <p className="text-muted-foreground text-center leading-relaxed">
              ฝึกซ้ำตามช่วงเวลาที่เหมาะสม พร้อมมินิเกมสนุก ๆ เพื่อให้จำได้ยาวเหมือน "การเดินทางในวงโคจร"
            </p>
          </Card>
        </div>
      </section>

      {/* Experience Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            ฝึกได้เหมือนมีครูอยู่ข้าง ๆ ตลอดเวลา
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-[hsl(265,100%,90%)] to-white rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-[hsl(43,100%,81%)]/30 backdrop-blur-sm rounded-2xl p-4 ml-auto max-w-[80%]">
                    <p className="text-sm font-medium">ผู้ใช้:</p>
                    <p className="text-lg">"I want to go to the restaurant"</p>
                  </div>
                  <div className="bg-[hsl(210,100%,85%)]/50 backdrop-blur-sm rounded-2xl p-4 mr-auto max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-5 h-5 text-[hsl(210,80%,40%)]" />
                      <p className="text-sm font-medium">AI Feedback:</p>
                    </div>
                    <p className="text-base">ดีมาก! ออกเสียง "restaurant" ได้ชัดเจน ✨</p>
                    <p className="text-sm text-muted-foreground mt-2">คะแนนความชัด: 92/100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-[hsl(265,100%,84%)] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">พูดประโยคจริงในชีวิตประจำวัน</h3>
                  <p className="text-muted-foreground">เลือกสถานการณ์ที่คุณต้องการฝึก และพูดตามจริง</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-[hsl(210,100%,85%)] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">ระบบจับจังหวะ + ความชัดเจน</h3>
                  <p className="text-muted-foreground">AI วิเคราะห์เสียงของคุณแบบเรียลไทม์</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-[hsl(43,100%,81%)] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">แนะนำวิธีพูดให้ดีขึ้นทันที</h3>
                  <p className="text-muted-foreground">ได้รับ feedback ที่เข้าใจง่ายและนำไปใช้ได้จริง</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3">
            เห็นความก้าวหน้าของคุณ... ทุกครั้งที่ฝึก 💫
          </h2>
          
          <div className="bg-gradient-to-br from-white to-[hsl(265,100%,98%)] rounded-3xl p-8 md:p-12 shadow-2xl border border-[hsl(265,100%,84%)]/20 mt-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(265,100%,84%)] to-[hsl(210,100%,85%)] mb-2">
                  7
                </div>
                <p className="text-lg text-muted-foreground">วันติดต่อกัน 🔥</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(210,100%,85%)] to-[hsl(43,100%,81%)] mb-2">
                  92
                </div>
                <p className="text-lg text-muted-foreground">Starlight Score ⭐</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(43,100%,81%)] to-[hsl(265,100%,84%)] mb-2">
                  156
                </div>
                <p className="text-lg text-muted-foreground">คำที่เรียนไปแล้ว 📚</p>
              </div>
            </div>

            <div className="bg-[hsl(43,100%,81%)]/20 rounded-2xl p-6 max-w-2xl mx-auto">
              <TrendingUp className="w-8 h-8 text-[hsl(43,80%,40%)] mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                "ทุกครั้งที่คุณพูด ระบบจะให้คะแนน (Starlight Score) + คำแนะนำรายคำ"
              </p>
              <p className="text-muted-foreground">
                Promjum จะสรุปผลรายสัปดาห์ พร้อมคำแนะนำส่วนตัว เพื่อให้คุณรักษา Streak ไว้ได้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative container mx-auto px-4 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(265,100%,84%)]/20 to-[hsl(210,100%,85%)]/20 rounded-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            พร้อมจะออกเดินทางสู่ความคล่องแคล่ว...
            <br />
            กับเพื่อน AI ส่วนตัวของคุณไหม?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            เริ่มฝึกวันนี้ ฟรี ไม่มีค่าใช้จ่าย
          </p>
          
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-[hsl(210,100%,85%)] hover:bg-[hsl(210,100%,80%)] text-[hsl(210,80%,40%)] rounded-2xl shadow-2xl hover:shadow-[0_0_40px_hsl(210,100%,85%)] transition-all hover:scale-110 mb-6"
            asChild
          >
            <Link to="/auth">
              เริ่มเรียนกับ Promjum ฟรี 🚀
            </Link>
          </Button>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(43,100%,81%)]/30 backdrop-blur-sm border border-[hsl(43,100%,81%)]/50">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-medium">เรียนฟรีได้ทันที ไม่ต้องใส่บัตรเครดิต</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(265,100%,84%)] to-[hsl(210,100%,85%)] mb-2">
              Promjum
            </h3>
            <p className="text-sm text-muted-foreground">พร้อมจำ พร้อมเข้าใจ</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
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
            <p>© 2025 Promjum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
