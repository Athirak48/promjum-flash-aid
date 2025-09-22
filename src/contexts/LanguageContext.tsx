import React, { createContext, useContext, useState } from 'react';

type Language = 'th' | 'en';

interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { th: 'หน้าหลัก', en: 'Home' },
  'nav.features': { th: 'คุณสมบัติ', en: 'Features' },
  'nav.pricing': { th: 'ราคา', en: 'Pricing' },
  'nav.about': { th: 'เกี่ยวกับเรา', en: 'About Us' },
  'nav.dashboard': { th: 'แดชบอร์ด', en: 'Dashboard' },
  'nav.flashcards': { th: 'แฟลชการ์ด', en: 'Flashcards' },
  'nav.marketcard': { th: 'ตลาดการ์ด', en: 'Marketplace' },
  'nav.feedback': { th: 'ความคิดเห็น', en: 'Feedback' },
  'nav.profile': { th: 'โปรไฟล์', en: 'Profile' },
  'nav.login': { th: 'เข้าสู่ระบบ', en: 'Login' },
  'nav.signup': { th: 'เริ่มใช้งานฟรี', en: 'Get Started Free' },
  'nav.logout': { th: 'ออกจากระบบ', en: 'Logout' },

  // Flashcards
  'flashcards.title': { th: 'คลังแฟลชการ์ดส่วนตัว', en: 'Personal Flashcard Library' },
  'flashcards.description': { th: 'จัดการและทบทวนแฟลชการ์ดของคุณ', en: 'Manage and review your flashcards' },
  'flashcards.search': { th: 'ค้นหาชุดแฟลชการ์ด...', en: 'Search flashcard sets...' },
  'flashcards.createFolder': { th: 'สร้างโฟลเดอร์', en: 'Create Folder' },
  'flashcards.createFlashcard': { th: 'สร้างแฟลชการ์ด', en: 'Create Flashcard' },
  'flashcards.folderName': { th: 'ชื่อโฟลเดอร์', en: 'Folder Name' },
  'flashcards.enterFolderName': { th: 'กรอกชื่อโฟลเดอร์...', en: 'Enter folder name...' },
  'flashcards.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'flashcards.create': { th: 'สร้าง', en: 'Create' },
  'flashcards.review': { th: 'ทบทวน', en: 'Review' },
  'flashcards.playGame': { th: 'เล่นเกม', en: 'Play Game' },
  'flashcards.cards': { th: 'การ์ด', en: 'cards' },
  'flashcards.progress': { th: 'ความคืบหน้า', en: 'Progress' },
  'flashcards.lastReviewed': { th: 'ทบทวนล่าสุด', en: 'Last Reviewed' },
  'flashcards.nextReview': { th: 'ทบทวนครั้งถัดไป', en: 'Next Review' },
  'flashcards.noSets': { th: 'ไม่พบชุดแฟลชการ์ด', en: 'No flashcard sets found' },
  'flashcards.noSetsDesc': { th: 'เริ่มต้นสร้างชุดแฟลชการ์ดแรกของคุณ', en: 'Start creating your first flashcard set' },
  'flashcards.noSearchResults': { th: 'ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่', en: 'Try changing your search or filters' },

  // Filter options
  'filter.all': { th: 'ทั้งหมด', en: 'All' },
  'filter.created': { th: 'สร้างเอง', en: 'Created' },
  'filter.uploaded': { th: 'จากไฟล์', en: 'From File' },
  'filter.marketcard': { th: 'จาก Marketcard', en: 'From Marketcard' },

  // Source badges
  'source.created': { th: 'สร้างเอง', en: 'Created' },
  'source.uploaded': { th: 'จากไฟล์', en: 'From File' },
  'source.marketcard': { th: 'จาก Marketcard', en: 'From Marketcard' },

  // Feedback
  'feedback.title': { th: 'ส่งความคิดเห็น', en: 'Send Feedback' },
  'feedback.description': { th: 'เราต้องการฟังความคิดเห็นของคุณเพื่ออพัฒนา Promjum ให้ดียิ่งขึ้น', en: 'We want to hear your thoughts to make Promjum even better' },
  'feedback.message': { th: 'ข้อความ', en: 'Message' },
  'feedback.placeholder': { th: 'แบ่งปันความคิดเห็น ข้อเสนอแนะ หรือปัญหาที่พบ...', en: 'Share your thoughts, suggestions, or issues...' },
  'feedback.send': { th: 'ส่งความคิดเห็น', en: 'Send Feedback' },
  'feedback.success': { th: 'ส่งความคิดเห็นสำเร็จ', en: 'Feedback sent successfully' },
  'feedback.successDesc': { th: 'ขอบคุณสำหรับความคิดเห็น เราจะนำไปปรับปรุงระบบให้ดียิ่งขึ้น', en: 'Thank you for your feedback. We\'ll use it to improve our system.' },
  'feedback.error': { th: 'เกิดข้อผิดพลาด', en: 'An error occurred' },
  'feedback.errorDesc': { th: 'ไม่สามารถส่งความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง', en: 'Could not send feedback. Please try again.' },

  // Common
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'common.search': { th: 'ค้นหา', en: 'Search' },
  'common.filter': { th: 'กรอง', en: 'Filter' },
  'common.sort': { th: 'เรียงลำดับ', en: 'Sort' },
  'common.name': { th: 'ชื่อ', en: 'Name' },
  'common.date': { th: 'วันที่', en: 'Date' },
  'common.type': { th: 'ประเภท', en: 'Type' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('promjum-language');
    return (saved as Language) || 'th';
  });

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const handleSetLanguage = (newLanguage: Language) => {
    localStorage.setItem('promjum-language', newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};