import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CreditCard, FileText, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FileUploadSectionProps {
  onUpload?: (file: File) => void;
}

export default function FileUploadSection({ onUpload }: FileUploadSectionProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const userProfile = user ? {
    subscription: 'normal' // This would come from actual user data
  } : null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (userProfile?.subscription === 'normal') {
      setShowPricing(true);
    } else {
      onUpload?.(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      // Check file type
      const allowedTypes = ['.pdf', '.docx', '.txt', '.pptx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        // Check file size (20MB limit)
        if (file.size <= 20 * 1024 * 1024) {
          handleFileSelect(file);
        } else {
          alert('ขนาดไฟล์เกิน 20MB โปรดเลือกไฟล์ที่เล็กกว่า');
        }
      } else {
        alert('รองรับเฉพาะไฟล์ PDF, DOCX, TXT, PPTX เท่านั้น');
      }
    }
  };

  const calculatePrice = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    return Math.ceil(sizeInMB * 2); // 2 บาทต่อ MB
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          อัปโหลดไฟล์
        </CardTitle>
        <CardDescription>
          รองรับ PDF, DOCX, TXT และอื่นๆ เพื่อสร้างแฟลชการ์ดอัตโนมัติ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedFile ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-all cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/20 scale-105' 
                : 'border-primary/30 bg-gradient-primary/5 hover:bg-gradient-primary/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-primary animate-float" />
            <div>
              <h3 className="font-medium mb-2">เลือกไฟล์หรือลากมาวางที่นี่</h3>
              <p className="text-sm text-muted-foreground mb-4">
                รองรับ PDF, DOCX, TXT, PPTX (ขนาดสูงสุด 20MB)
              </p>
              
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt,.pptx"
                onChange={handleFileInputChange}
              />
              <label htmlFor="file-upload">
                <Button size="lg" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  เลือกไฟล์
                </Button>
              </label>
            </div>
          </div>
        ) : showPricing ? (
          // Pricing Summary for Normal Users
          <div className="space-y-4">
            <div className="bg-gradient-secondary rounded-lg p-6 border border-primary/20 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  setSelectedFile(null);
                  setShowPricing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 pr-8">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">ขนาดไฟล์:</span>
                  <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">ราคา (2 บาท/MB):</span>
                  <span className="text-xl font-bold text-primary">{calculatePrice(selectedFile)} บาท</span>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                  onClick={() => {
                    onUpload?.(selectedFile);
                    setShowPricing(false);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  ชำระเงินและประมวลผล
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setSelectedFile(null);
                setShowPricing(false);
              }}
            >
              เลือกไฟล์ใหม่
            </Button>
          </div>
        ) : (
          // Success State
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="font-medium text-foreground mb-2">อัปโหลดสำเร็จ!</h3>
              <p className="text-sm text-muted-foreground">
                ไฟล์ของคุณกำลังถูกประมวลผล ระบบจะแจ้งเตือนเมื่อแฟลชการ์ดพร้อมใช้งาน
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedFile(null);
                setShowPricing(false);
              }}
            >
              อัปโหลดไฟล์ใหม่
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}