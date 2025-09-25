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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPricing, setShowPricing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const userProfile = user ? {
    subscription: 'normal' // This would come from actual user data
  } : null;

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    if (userProfile?.subscription === 'normal') {
      setShowPricing(true);
    } else {
      files.forEach(file => onUpload?.(file));
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFilesSelect(files);
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
    
    if (files.length > 0) {
      // Check file types and sizes
      const validFiles: File[] = [];
      const allowedTypes = ['.pdf', '.docx', '.txt', '.pptx'];
      
      for (const file of files) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
          if (file.size <= 20 * 1024 * 1024) {
            validFiles.push(file);
          } else {
            alert(`ไฟล์ ${file.name} มีขนาดเกิน 20MB`);
          }
        } else {
          alert(`ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ`);
        }
      }
      
      if (validFiles.length > 0) {
        handleFilesSelect(validFiles);
      }
    }
  };

  const calculateTotalPrice = (files: File[]) => {
    return files.reduce((total, file) => {
      const sizeInMB = file.size / (1024 * 1024);
      return total + Math.ceil(sizeInMB * 2);
    }, 0);
  };

  const removeFile = (fileIndex: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== fileIndex);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setShowPricing(false);
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
        {selectedFiles.length === 0 ? (
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
                multiple
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
            {selectedFiles.map((file, index) => (
              <div key={index} className="bg-gradient-secondary rounded-lg p-6 border border-primary/20 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 pr-8">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">ขนาดไฟล์:</span>
                    <span className="font-medium">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">ราคา (2 บาท/MB):</span>
                    <span className="text-xl font-bold text-primary">{calculatePrice(file)} บาท</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>รวมทั้งหมด:</span>
                <span className="text-primary">{calculateTotalPrice(selectedFiles)} บาท</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => {
                selectedFiles.forEach(file => onUpload?.(file));
                setShowPricing(false);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              ชำระเงินและประมวลผลทั้งหมด
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setSelectedFiles([]);
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
                setSelectedFiles([]);
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