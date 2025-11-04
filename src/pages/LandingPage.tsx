import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import { 
  Star, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Phone,
  Upload,
  Brain,
  Gamepad2,
  Zap,
  BookOpen,
  Layers,
  TrendingUp,
  Mic
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
      avatar: "👨‍🎓"
    },
    {
      name: "ป้อม",
      role: "พนักงานออฟฟิศ",
      content: "ระบบให้คำแนะนำตรงจุด เหมือนครูส่วนตัวเลย ชอบมาก",
      rating: 5,
      avatar: "👔"
    },
    {
      name: "พี่นัท",
      role: "ฟรีแลนซ์",
      content: "พูดกับลูกค้าต่างชาติได้มั่นใจขึ้นเยอะ แนะนำเลยครับ",
      rating: 5,
      avatar: "💼"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Decorations for entire page */}
      <BackgroundDecorations />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-prompt font-semibold text-primary">AI-Powered Language Learning</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-poppins leading-tight tracking-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent block">
                  Promjum
                </span>
                <span className="text-foreground/90 text-4xl md:text-6xl lg:text-7xl block mt-4">
                  AI ที่จะทำให้เก่งภาษาขึ้น
                </span>
                <span className="text-foreground/60 text-3xl md:text-5xl lg:text-6xl block mt-2">
                  ในทุกๆวัน
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto font-prompt leading-relaxed px-4">
                ฝึก <span className="text-primary font-semibold">ฟัง พูด อ่าน เขียน</span> ด้วยระบบ AI ที่เข้าใจสำเนียงคุณจริง ๆ
              </p>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-prompt">
                เริ่มจากสิ่งที่คุณสนใจ และเห็นพัฒนาการได้ทุกวัน
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button variant="hero" size="lg" className="text-lg px-12 py-7 shadow-glow font-prompt" asChild>
                <Link to="/auth">
                  เริ่มใช้งานฟรี →
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-12 py-7 font-prompt bg-background/50 backdrop-blur-sm" asChild>
                <a href="#experience">
                  ดูตัวอย่างการใช้งาน
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground font-prompt">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>ใช้งานฟรี ไม่มีค่าใช้จ่าย</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>ไม่ต้องใส่บัตรเครดิต</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>เริ่มได้ทันที ใน 2 นาที</span>
              </div>
            </div>

            {/* Enhanced Visual mockup */}
            <div className="pt-16 animate-fade-in">
              <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-medium max-w-4xl mx-auto border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-2xl backdrop-blur-sm">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg font-poppins mb-2">1. พูด</div>
                      <p className="text-sm text-muted-foreground font-prompt">พูดประโยคภาษาอังกฤษ</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-2xl backdrop-blur-sm">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg font-poppins mb-2">2. AI วิเคราะห์</div>
                      <p className="text-sm text-muted-foreground font-prompt">ตรวจสอบการออกเสียง</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-2xl backdrop-blur-sm">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg font-poppins mb-2">3. Feedback</div>
                      <p className="text-sm text-muted-foreground font-prompt">ได้คำแนะนำทันที</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Promjum Section */}
      <section id="about" className="py-32 bg-gradient-to-b from-background via-background/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary font-prompt">เกี่ยวกับ Promjum</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-poppins">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Promjum คืออะไร?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-prompt leading-relaxed">
              เราเชื่อว่าการเรียนภาษาควร 
              <span className="font-bold text-primary"> "เข้าใจง่าย เหมือนคุยกับเพื่อน"</span>
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-prompt leading-relaxed">
              Promjum ใช้ AI วิเคราะห์เสียง พฤติกรรม และคำศัพท์ของคุณ
              เพื่อสร้าง <span className="font-semibold text-foreground">"เส้นทางการเรียนรู้เฉพาะตัว"</span> ที่จำง่าย ใช้ได้จริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Card 1: Flashcard */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <BookOpen className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  จำคำศัพท์ด้วย Flashcard
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  🃏 ฝึกจำง่าย มีเสียง ช่วยกระตุ้นการจดจำคำศัพท์
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  🎯 เหมาะกับผู้เริ่มต้นที่อยากจำศัพท์เร็วขึ้น
                </p>
              </CardContent>
            </Card>

            {/* Card 2: SRS + เกม */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  จำได้ยาว ด้วย SRS + เกม
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  🎮 ทวนคำศัพท์ตามช่วงเวลาที่เหมาะสม มีเกมสนุก ๆ ให้เล่นระหว่างฝึก
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  💫 ยิ่งเล่น ยิ่งจำได้
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Mini Deck */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <Layers className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  Mini Deck
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  🪄 รวมคำศัพท์เป็นหมวดหมู่ต่างๆ เช่น ธุรกิจ ท่องเที่ยว
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  📚 เรียนตรงจุด ใช้เวลาไม่นาน ตามที่คุณต้องการ
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Progress Tracking */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  เห็นพัฒนาการจริง ทุกครั้งที่ฝึก
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  📈 ดูคะแนน "Starlight Score" และกราฟความก้าวหน้า รู้เลยว่าพูดดีขึ้น ฟังชัดขึ้นแค่ไหน
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  🔥 เก็บ Streak ต่อเนื่องทุกวัน
                </p>
              </CardContent>
            </Card>

            {/* Card 5: Shadowing */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <Mic className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  ฝึกออกเสียงคำ + Shadowing
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  💬 ฝึกออกเสียงคำศัพท์ พูดตามเสียงเจ้าของภาษา แล้วให้ feedback
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  🚀 ฝึกพูดได้ทุกที่ ทุกเวลา
                </p>
              </CardContent>
            </Card>

            {/* Card 6: AI ครูส่วนตัว */}
            <Card className="group bg-gradient-card backdrop-blur-sm shadow-soft border border-white/10 hover:shadow-medium hover:scale-105 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center space-y-6 p-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                  <Brain className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold">
                  AI ครูส่วนตัว ฟัง
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-center text-base text-foreground/70 font-prompt leading-relaxed mb-3">
                  🧠 วิเคราะห์จังหวะ สำเนียง และให้คำแนะนำทันที
                </p>
                <p className="text-center text-sm text-primary/80 font-prompt font-semibold">
                  🌠 เหมือนมีครูอยู่ข้าง ๆ ทุกครั้งที่ฝึก
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary font-prompt">ลองใช้งาน</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-poppins mb-4">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                ฝึกได้เหมือนมีครูอยู่ข้าง ๆ
              </span>
              <br />
              <span className="text-foreground/80 text-3xl md:text-5xl">
                ตลอดเวลา
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-center">
            {/* Left: Demo visualization */}
            <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-10 shadow-medium border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 bg-primary/10 rounded-2xl p-4">
                    <p className="font-prompt text-sm">Hello, how are you today?</p>
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                    <div className="h-3 w-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="h-4 w-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <div className="h-3 w-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold font-poppins">✓ Great pronunciation!</span>
                    <span className="text-2xl font-bold text-green-600">95</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-prompt">
                    คำว่า "today" ออกเสียงได้ชัดเจนมาก ลองเน้นที่ "are" ให้ชัดขึ้นอีกนิด
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Description */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins mb-2">พูดประโยคจริงในชีวิตประจำวัน</h3>
                  <p className="text-muted-foreground font-prompt">เลือกสถานการณ์ที่คุณต้องการฝึก และเริ่มพูดตามธรรมชาติ</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins mb-2">ระบบจับจังหวะ + ความชัดเจน</h3>
                  <p className="text-muted-foreground font-prompt">AI วิเคราะห์การออกเสียงแต่ละคำ พร้อมให้คะแนนแบบเรียลไทม์</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins mb-2">แนะนำวิธีพูดให้ดีขึ้นทันที</h3>
                  <p className="text-muted-foreground font-prompt">รับ feedback ที่ตรงจุด พร้อมคำแนะนำแบบเฉพาะเจาะจง</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary font-prompt">ติดตามความก้าวหน้า</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-poppins mb-4">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                เห็นความก้าวหน้าของคุณ
              </span>
              <br />
              <span className="text-foreground/80 text-3xl md:text-5xl">
                ทุกครั้งที่ฝึก
              </span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-10 md:p-16 shadow-medium border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary font-poppins">847</div>
                  <p className="text-muted-foreground font-prompt">คำที่จำได้</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary font-poppins">92%</div>
                  <p className="text-muted-foreground font-prompt">ความแม่นยำเสียง</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary font-poppins flex items-center justify-center">
                    <Zap className="h-12 w-12 mr-2" />
                    15
                  </div>
                  <p className="text-muted-foreground font-prompt">วันต่อเนื่อง</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-center text-lg text-foreground/80 font-prompt">
                  "ทุกครั้งที่คุณพูด ระบบจะให้คะแนน + คำแนะนำรายคำ"
                </p>
                <p className="text-center text-lg text-foreground/80 font-prompt">
                  "Promjum จะสรุปผลรายสัปดาห์ พร้อมคำแนะนำส่วนตัว"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-gradient-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                เสียงจากผู้ใช้จริง
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium border-0 hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-5xl">{review.avatar}</div>
                    <div>
                      <CardTitle className="text-lg font-poppins">{review.name}</CardTitle>
                      <CardDescription className="font-prompt">{review.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 font-prompt leading-relaxed">"{review.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-poppins leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                พร้อมจะเริ่มพูดภาษาอังกฤษ
                <br />
                ได้จริงไหม?
              </span>
            </h2>

            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center space-x-2 bg-gradient-card px-6 py-3 rounded-full shadow-soft border border-white/10">
                <span className="text-2xl">🏆</span>
                <span className="font-prompt">เรียนฟรีได้ทันที</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-card px-6 py-3 rounded-full shadow-soft border border-white/10">
                <span className="text-2xl">✨</span>
                <span className="font-prompt">ไม่ต้องใส่บัตรเครดิต</span>
              </div>
            </div>

            <div className="pt-8">
              <Button variant="hero" size="lg" className="text-xl px-16 py-8 shadow-glow" asChild>
                <Link to="/auth">🔹 เริ่มเรียนกับ Promjum ฟรี</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* Logo & Tagline */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <img 
                    src={promjumLogo} 
                    alt="Promjum Logo" 
                    className="h-12 w-12 object-contain"
                  />
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-poppins">
                    Promjum
                  </span>
                </div>
                <p className="text-muted-foreground font-prompt text-sm">
                  พร้อมจำ พร้อมเข้าใจ
                </p>
              </div>

              {/* Menu Links */}
              <div className="text-center">
                <h3 className="font-bold font-poppins mb-4">เมนู</h3>
                <div className="space-y-2">
                  <div><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-prompt">เกี่ยวกับเรา</Link></div>
                  <div><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-prompt">ติดต่อเรา</a></div>
                  <div><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-prompt">นโยบายความเป็นส่วนตัว</Link></div>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="text-center md:text-right">
                <h3 className="font-bold font-poppins mb-4">ติดตามเรา</h3>
                <div className="flex justify-center md:justify-end space-x-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-sm text-muted-foreground font-prompt">
                © 2024 Promjum. สงวนลิขสิทธิ์.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;