import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [fileSize, setFileSize] = useState<number>(1);
  const pricePerMB = 2; // ราคา 2 บาทต่อ MB

  const calculatePrice = () => {
    return fileSize * pricePerMB;
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              แพ็คเกจและราคา
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            เลือกแพ็คเกจที่เหมาะกับความต้องการของคุณ ราคาโปร่งใส ไม่มีค่าซ่อนเร้น
          </p>
        </div>

        {/* Pricing Calculator */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="bg-gradient-card shadow-medium border-0">
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">เครื่องมือคำนวณราคา</CardTitle>
              <CardDescription>คำนวณราคาตามขนาดไฟล์ของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileSize">ขนาดไฟล์ (MB)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={fileSize}
                  onChange={(e) => setFileSize(Number(e.target.value))}
                  className="text-center text-lg"
                />
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">ราคาโดยประมาณ</div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ฿{calculatePrice().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ({pricePerMB} บาท/MB)
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full"
                asChild
              >
                <a
                  href="https://line.me/ti/p/@promjum"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  สอบถามผ่าน LINE
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pay per use */}
          <Card className="bg-gradient-card shadow-medium border-0 relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">จ่ายตามการใช้งาน</CardTitle>
              <CardDescription className="text-base">
                เหมาะสำหรับผู้ที่ใช้งานเป็นครั้งคราว
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">฿2</span>
                <span className="text-muted-foreground">/MB</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>อัปโหลดไฟล์ได้ทุกรูปแบบ</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>แฟลชการ์ดคุณภาพสูง</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>ระบบทบทวนอัจฉริยะ</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>เกมส์ทบทวนสนุกๆ</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>ดาวน์โหลดได้ทุกเวลา</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link to="/auth">เริ่มใช้งาน</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro subscription */}
          <Card className="bg-gradient-hero shadow-large border-0 relative text-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                แนะนำ
              </div>
            </div>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2 text-white">Pro สมาชิก</CardTitle>
              <CardDescription className="text-white/80 text-base">
                เหมาะสำหรับผู้ที่ใช้งานสม่ำเสมอ
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">฿299</span>
                <span className="text-white/80">/เดือน</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">อัปโหลดไฟล์ไม่จำกัด</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">ไฟล์ขนาดใหญ่ได้ (100MB+)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">ระบบ AI พรีเมียม</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">ขายแฟลชการ์ดใน Marketplace</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">สถิติและรายงานเชิงลึก</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white">ซัพพอร์ตลำดับความสำคัญ</span>
                </li>
              </ul>
              <Button variant="secondary" className="w-full mt-6" asChild>
                <Link to="/auth">เริ่มทดลองฟรี 7 วัน</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            ต้องการปรึกษาหรือสอบถามเพิ่มเติม?
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://line.me/ti/p/@promjum"
              target="_blank"
              rel="noopener noreferrer"
            >
              ติดต่อทีม Promjum
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;