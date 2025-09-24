-- Insert sample flashcard data
INSERT INTO public.flashcards (front_text, back_text, upload_id) VALUES 
('Hello', 'สวัสดี', NULL),
('Thank you', 'ขอบคุณ', NULL),
('Good morning', 'อรุณสวัสดิ์', NULL),
('Good afternoon', 'สวัสดีตอนบ่าย', NULL),
('Good evening', 'สวัสดีตอนเย็น', NULL),
('Good night', 'ราตรีสวัสดิ์', NULL),
('Please', 'กรุณา', NULL),
('Excuse me', 'ขอโทษ', NULL),
('I''m sorry', 'ขอโทษ', NULL),
('Yes', 'ใช่', NULL),
('No', 'ไม่', NULL),
('Water', 'น้ำ', NULL),
('Food', 'อาหาร', NULL),
('House', 'บ้าน', NULL),
('Car', 'รถยนต์', NULL),
('Book', 'หนังสือ', NULL),
('School', 'โรงเรียน', NULL),
('Teacher', 'ครู', NULL),
('Student', 'นักเรียน', NULL),
('Friend', 'เพื่อน', NULL);

-- Insert marketplace cards data
INSERT INTO public.marketplace_cards (uploader_id, flashcard_id, price, status) VALUES 
(NULL, (SELECT id FROM public.flashcards WHERE front_text = 'Hello' LIMIT 1), 199, 'active'),
(NULL, (SELECT id FROM public.flashcards WHERE front_text = 'Thank you' LIMIT 1), 149, 'active'),
(NULL, (SELECT id FROM public.flashcards WHERE front_text = 'Good morning' LIMIT 1), 99, 'active'),
(NULL, (SELECT id FROM public.flashcards WHERE front_text = 'Water' LIMIT 1), 89, 'active');

-- Insert pricing history
INSERT INTO public.pricing_history (price_per_mb) VALUES 
(1.50),
(1.75),
(2.00);

-- Insert notification templates (these will need user_id when users exist)
-- We'll insert them with NULL user_id for now and they can be updated later
INSERT INTO public.notifications (user_id, title, message, is_read) VALUES 
(NULL, 'ยินดีต้อนรับ!', 'ขอบคุณที่เข้าร่วม Promjum เรียนรู้แฟลชการ์ดได้อย่างมีประสิทธิภาพ', false),
(NULL, 'การ์ดใหม่พร้อมใช้งาน', 'มีแฟลชการ์ดใหม่ในหมวดภาษาอังกฤษเพิ่มเติม', false),
(NULL, 'อัพเดทระบบ', 'ระบบได้รับการปรับปรุงเพื่อประสิทธิภาพที่ดีขึ้น', true);