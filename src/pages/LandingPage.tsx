import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import { 
  Users, 
  Star, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Phone,
  Upload,
  Brain,
  Gamepad2,
  Shield,
  Zap,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import promjumLogo from "@/assets/promjum-logo.png";

const LandingPage = () => {
  const features = [
    {
      icon: Upload,
      title: "อัปโหลดง่าย",
      description: "รองรับไฟล์ PDF, Word, PowerPoint, Excel และอีกมากมาย อัปโหลดได้ในคลิกเดียว"
    },
    {
      icon: Brain,
      title: "AI อัจฉริยะ",
      description: "ใช้เทคโนโลยี AI ล้ำสมัยในการวิเคราะห์และสร้างแฟลชการ์ดที่มีคุณภาพสูง"
    },
    {
      icon: Gamepad2,
      title: "เรียนรู้สนุก",
      description: "ระบบเกมและ Spaced Repetition ที่ช่วยให้การทบทวนมีประสิทธิภาพและสนุกสนาน"
    },
    {
      icon: Shield,
      title: "ปลอดภัย 100%",
      description: "ข้อมูลของคุณได้รับการเข้ารหัสและปกป้องด้วยมาตรฐานสากล"
    },
    {
      icon: Zap,
      title: "รวดเร็วทันใจ",
      description: "ประมวลผลไฟล์และสร้างแฟลชการ์ดได้ภายในไม่กี่นาที"
    },
    {
      icon: Heart,
      title: "ใช้งานง่าย",
      description: "ออกแบบมาให้ใช้งานง่าย เหมาะสำหรับทุกวัย ทุกระดับความรู้"
    }
  ];

  const reviews = [
    {
      name: "อาจารย์สมชาย ใจดี",
      role: "อาจารย์มหาวิทยาลัย",
      content: "Promjum ช่วยให้ผมสร้างแฟลชการ์ดสำหรับนักศึกษาได้อย่างรวดเร็ว นักศึกษาชอบมากเพราะเรียนได้สนุก",
      rating: 5,
      avatar: "👨‍🏫"
    },
    {
      name: "น้องมิ้นท์",
      role: "นักเรียนชั้น ม.6",
      content: "ใช้ Promjum ทบทวนก่อนสอบ GAT/PAT ผลคะแนนดีขึ้นมาก! ระบบเกมทำให้เรียนไม่เบื่อ",
      rating: 5,
      avatar: "👩‍🎓"
    },
    {
      name: "คุณแป้ง",
      role: "นักศึกษาแพทย์",
      content: "เปลี่ยนหนังสือแพทย์หนาๆ ให้เป็นแฟลชการ์ด ทบทวนได้ทุกที่ทุกเวลา แนะนำสำหรับคนที่ต้องจำเยอะๆ",
      rating: 5,
      avatar: "👩‍⚕️"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Decorations for entire page */}
      <BackgroundDecorations />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                คุณสมบัติเด่น
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Promjum มาพร้อมคุณสมบัติที่จะเปลี่ยนวิธีการเรียนรู้ของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* About Section */}
      <section id="about" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                เกี่ยวกับ Promjum
              </span>
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-xl leading-relaxed mb-6">
                Promjum เกิดขึ้นจากความต้องการที่จะทำให้การเรียนรู้เป็นเรื่องง่ายและสนุกสำหรับทุกคน 
                เราเชื่อว่าเทคโนโลยี AI สามารถช่วยให้การศึกษามีประสิทธิภาพมากขึ้น
              </p>
              <p className="text-xl leading-relaxed mb-6">
                ทีมงานของเราประกอบด้วยนักพัฒนาที่มีประสบการณ์และนักการศึกษา 
                ที่มุ่งมั่นในการสร้างเครื่องมือที่จะช่วยให้ผู้เรียนทุกคนประสบความสำเร็จในการเรียนรู้
              </p>
              <div className="flex justify-center space-x-8 mt-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">ผู้ใช้งาน</div>
                </div>
                <div className="text-center">
                  <Star className="h-12 w-12 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">4.9/5</div>
                  <div className="text-sm text-muted-foreground">คะแนนรีวิว</div>
                </div>
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">ซัพพอร์ต</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-gradient-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                รีวิวจากผู้ใช้งาน
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ฟังความคิดเห็นจากผู้ที่ได้ใช้งาน Promjum แล้ว
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{review.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{review.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  ติดต่อเรา
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                พร้อมให้คำปรึกษาและช่วยเหลือคุณทุกเวลา
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-card shadow-soft border-0 text-center">
                <CardHeader>
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>อีเมล</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">support@promjum.com</p>
                  <p className="text-muted-foreground">info@promjum.com</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-soft border-0 text-center">
                <CardHeader>
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>โทรศัพท์</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">02-123-4567</p>
                  <p className="text-muted-foreground">จันทร์-ศุกร์ 9:00-18:00</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-soft border-0 text-center">
                <CardHeader>
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>ที่อยู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">123 ถ.เทคโนโลยี</p>
                  <p className="text-muted-foreground">กรุงเทพฯ 10110</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">เริ่มใช้งาน Promjum วันนี้</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src={promjumLogo} 
                alt="Promjum Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Promjum
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              เปลี่ยนวิธีการเรียนรู้ด้วยพลัง AI
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Promjum. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;