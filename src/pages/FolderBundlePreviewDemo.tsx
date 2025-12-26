import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderBundlePreview } from '@/components/FolderBundlePreview';

// Mock data สำหรับ demo
const mockFlashcards = [
    // ชุดที่ 1: ชีวิตประจำวัน
    { id: '1', front: 'wake up', back: 'ตื่นนอน', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '2', front: 'brush teeth', back: 'แปรงฟัน', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '3', front: 'take a shower', back: 'อาบน้ำ', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '4', front: 'eat breakfast', back: 'กินอาหารเช้า', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '5', front: 'go to work', back: 'ไปทำงาน', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '6', front: 'have lunch', back: 'กินข้าวเที่ยง', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '7', front: 'go home', back: 'กลับบ้าน', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '8', front: 'cook dinner', back: 'ทำอาหารเย็น', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '9', front: 'watch TV', back: 'ดูทีวี', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },
    { id: '10', front: 'go to bed', back: 'เข้านอน', setName: 'ชุดที่ 1: กิจวัตรประจำวัน' },

    // ชุดที่ 2: อาหาร
    { id: '11', front: 'rice', back: 'ข้าว', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '12', front: 'water', back: 'น้ำ', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '13', front: 'coffee', back: 'กาแฟ', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '14', front: 'tea', back: 'ชา', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '15', front: 'bread', back: 'ขนมปัง', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '16', front: 'egg', back: 'ไข่', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '17', front: 'chicken', back: 'ไก่', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '18', front: 'fish', back: 'ปลา', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '19', front: 'vegetable', back: 'ผัก', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },
    { id: '20', front: 'fruit', back: 'ผลไม้', setName: 'ชุดที่ 2: อาหารและเครื่องดื่ม' },

    // ชุดที่ 3: สี
    { id: '21', front: 'red', back: 'สีแดง', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '22', front: 'blue', back: 'สีน้ำเงิน', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '23', front: 'green', back: 'สีเขียว', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '24', front: 'yellow', back: 'สีเหลือง', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '25', front: 'black', back: 'สีดำ', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '26', front: 'white', back: 'สีขาว', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '27', front: 'purple', back: 'สีม่วง', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '28', front: 'orange', back: 'สีส้ม', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '29', front: 'pink', back: 'สีชมพู', setName: 'ชุดที่ 3: สีต่างๆ' },
    { id: '30', front: 'brown', back: 'สีน้ำตาล', setName: 'ชุดที่ 3: สีต่างๆ' },
];

export default function FolderBundlePreviewDemo() {
    const [showPreview, setShowPreview] = useState(false);

    const handleClone = (selectedSetNames: string[]) => {
        console.log('Cloning sets:', selectedSetNames);
        alert(`กำลังโคลน ${selectedSetNames.length} ชุด:\n${selectedSetNames.join('\n')}`);
        setShowPreview(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Demo Card */}
                <div className="glass-card rounded-3xl p-8 mb-8 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">
                                📁 ชีวิตประจำวัน
                            </h1>
                            <p className="text-white/60">
                                โฟลเดอร์สำหรับเรียนคำศัพท์ภาษาอังกฤษ
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/40 text-sm">สร้างโดย</p>
                            <p className="text-white font-bold">Teacher Som</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-sm">ชุดทั้งหมด</p>
                            <p className="text-2xl font-bold text-white">3 ชุด</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-sm">คำศัพท์ทั้งหมด</p>
                            <p className="text-2xl font-bold text-white">30 คำ</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-sm">ผู้โคลน</p>
                            <p className="text-2xl font-bold text-white">125 คน</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowPreview(true)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-6 text-lg rounded-xl"
                        >
                            👁️ ดูคำศัพท์ทั้งหมด
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 text-lg rounded-xl"
                        >
                            📥 โคลนโฟลเดอร์
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="glass-card rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-bold mb-3">💡 Features:</h3>
                    <ul className="text-white/70 space-y-2">
                        <li>✅ 🔍 <strong>Search</strong> - ค้นหาคำศัพท์ได้</li>
                        <li>✅ ☑️ <strong>Select to Clone</strong> - เลือกชุดที่ต้องการโคลน</li>
                        <li>✅ 📂 <strong>Collapse/Expand</strong> - พับ/ขยายชุด</li>
                        <li>✅ 🎴 <strong>Flip Cards</strong> - คลิกพลิกการ์ด</li>
                        <li>✅ 📱 <strong>Responsive</strong> - 5/4/3/2/1 columns ตามขนาดหน้าจอ</li>
                        <li>✅ 🔄 <strong>Reset</strong> - รีเซ็ตการ์ดทั้งหมด</li>
                        <li>✅ 📥 <strong>Clone Button</strong> - โคลนชุดที่เลือก</li>
                    </ul>
                </div>
            </div>

            {/* Preview Dialog */}
            <FolderBundlePreview
                open={showPreview}
                onOpenChange={setShowPreview}
                folderName="ชีวิตประจำวัน"
                flashcards={mockFlashcards}
                onClone={handleClone}
            />
        </div>
    );
}
