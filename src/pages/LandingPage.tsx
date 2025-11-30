import { Button } from "@/components/ui/button";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import {
  Brain,
  Gamepad2,
  Zap,
  BookOpen,
  Layers,
  TrendingUp,
  Trophy,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20
      }
    }
  };

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Flashcard + Active Recall",
      description: "กระตุ้นความจำอย่างถูกวิธี จำแม่นกว่าอ่านซ้ำถึง 300%",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: <Gamepad2 className="h-6 w-6" />,
      title: "Spaced Repetition (SRS)",
      description: "ระบบทวนคำศัพท์ในจังหวะที่ 'เกือบจะลืม' เปลี่ยนความจำระยะสั้นเป็นยาว",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Practice",
      description: "ฝึกฟัง พูด อ่าน จากคำศัพท์ที่คุณเลือกเอง พร้อม AI วิเคราะห์สำเนียงและให้คำแนะนำ",
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Mini Deck",
      description: "บทเรียนย่อย เรียนจบไว ตรงจุด เหมาะกับคนเวลาน้อย",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "เห็นพัฒนาการชัดเจนด้วยกราฟและคะแนน Starlight Score",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "XP & Leaderboard",
      description: "เก็บ XP ทุกครั้งที่เรียน และดูการจัดอันดับกับเพื่อนๆ เพิ่มความสนุกในการฝึก",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-prompt selection:bg-primary/20">
      <BackgroundDecorations />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-secondary-foreground text-sm font-medium backdrop-blur-sm border border-white/5">
              <Zap className="h-4 w-4 fill-current" />
              <span>เรียนภาษาอังกฤษแบบคนรุ่นใหม่</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-poppins text-foreground">
              สั่งสมองให้จำแม่น
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 mt-2 pb-2">
                ง่าย สะดวก มีประสิทธิภาพ จำได้นาน
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ปลดล็อกศักยภาพการเรียนรู้ด้วย <span className="text-foreground font-semibold">Active Recall</span> และ <span className="text-foreground font-semibold">AI</span> ที่เข้าใจคุณ เปลี่ยนเรื่องยากให้เป็นเรื่องง่าย ซึมลึกสู่ความทรงจำระยะยาว
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" asChild>
                <Link to="/auth">
                  เริ่มใช้งานฟรี <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full hover:bg-secondary/20" asChild>
                <a href="#features">ดูฟีเจอร์ทั้งหมด</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Feature Grid */}
      <section id="features" className="py-24 px-6 bg-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-6">ฟีเจอร์ที่ออกแบบมาเพื่อคุณ</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              รวมทุกเครื่องมือที่จะช่วยให้การเรียนภาษาของคุณเป็นเรื่องง่ายและสนุก
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-poppins mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition / How it works minimal */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-8 leading-tight">
                เปลี่ยนความจำระยะสั้น <br />
                <span className="text-primary">เป็นความจำระยะยาว</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-green-500/10 p-2 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Active Recall</h4>
                    <p className="text-muted-foreground">กระตุ้นสมองให้ดึงข้อมูลออกมาใช้จริง ทำให้จำได้แม่นยำกว่าการอ่านซ้ำ</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-blue-500/10 p-2 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Spaced Repetition</h4>
                    <p className="text-muted-foreground">ระบบจัดตารางทวนคำศัพท์ให้อัตโนมัติ ในช่วงเวลาที่คุณกำลังจะลืม</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-purple-500/10 p-2 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Personalized AI</h4>
                    <p className="text-muted-foreground">บทเรียนและคำแนะนำที่ปรับให้เข้ากับพื้นฐานและความสนใจของคุณโดยเฉพาะ</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-background/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">AI Tutor</div>
                    <div className="text-xs text-muted-foreground">กำลังวิเคราะห์การออกเสียง...</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none">
                    <p className="text-sm">ลองพูดคำว่า "Entrepreneur" ดูครับ</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-2xl rounded-tr-none ml-auto max-w-[80%]">
                    <p className="text-sm text-primary-foreground/90">Entrepreneur...</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-600 font-bold text-sm">เยี่ยมมาก! ชัดเจนครับ</span>
                      <span className="text-green-600 font-bold">98%</span>
                    </div>
                    <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[98%]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="py-32 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-poppins tracking-tight">
              เริ่มเก่งภาษาอังกฤษ<br />
              <span className="text-primary">ได้ตั้งแต่วันนี้</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              ทดลองเรียนฟรี ไม่ต้องผูกบัตรเครดิต
            </p>
            <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
              <Link to="/auth">
                เริ่มต้นใช้งานฟรี
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 border-t border-border/40 bg-background">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Promjum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;