-- University War Tables
-- Migration for university competition system

-- 1. Universities table (list of all universities)
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    short_name TEXT NOT NULL,
    total_score BIGINT DEFAULT 0,
    total_players INTEGER DEFAULT 0,
    rival_id UUID REFERENCES universities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User university selection (which university user belongs to)
CREATE TABLE IF NOT EXISTS user_universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    faculty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. University war scores (individual contributions)
CREATE TABLE IF NOT EXISTS university_war_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    game_mode TEXT NOT NULL, -- 'mcq' or 'matching'
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial universities
INSERT INTO universities (name, short_name) VALUES
    ('จุฬาลงกรณ์มหาวิทยาลัย', 'CU'),
    ('มหาวิทยาลัยธรรมศาสตร์', 'TU'),
    ('มหาวิทยาลัยเกษตรศาสตร์', 'KU'),
    ('มหาวิทยาลัยมหิดล', 'MU'),
    ('สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', 'KMITL'),
    ('มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี', 'KMUTT'),
    ('มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ', 'KMUTNB'),
    ('มหาวิทยาลัยเชียงใหม่', 'CMU'),
    ('มหาวิทยาลัยขอนแก่น', 'KKU'),
    ('มหาวิทยาลัยสงขลานครินทร์', 'PSU'),
    ('มหาวิทยาลัยศิลปากร', 'SU'),
    ('มหาวิทยาลัยศรีนครินทรวิโรฒ', 'SWU'),
    ('มหาวิทยาลัยบูรพา', 'BUU'),
    ('มหาวิทยาลัยนเรศวร', 'NU'),
    ('มหาวิทยาลัยแม่โจ้', 'MJU'),
    ('มหาวิทยาลัยอุบลราชธานี', 'UBU'),
    ('มหาวิทยาลัยมหาสารคาม', 'MSU'),
    ('มหาวิทยาลัยทักษิณ', 'TSU'),
    ('มหาวิทยาลัยรามคำแหง', 'RU'),
    ('มหาวิทยาลัยสุโขทัยธรรมาธิราช', 'STOU'),
    ('มหาวิทยาลัยกรุงเทพ', 'BU'),
    ('มหาวิทยาลัยรังสิต', 'RSU'),
    ('มหาวิทยาลัยอัสสัมชัญ', 'ABAC'),
    ('มหาวิทยาลัยหอการค้าไทย', 'UTCC'),
    ('มหาวิทยาลัยกรุงเทพธนบุรี', 'BTU'),
    ('มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี', 'RMUTT'),
    ('มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร', 'RMUTP'),
    ('มหาวิทยาลัยราชภัฏสวนสุนันทา', 'SSRU'),
    ('มหาวิทยาลัยสยาม', 'SiamU'),
    ('มหาวิทยาลัยอื่นๆ', 'OTHER')
ON CONFLICT (name) DO NOTHING;

-- Set up rivalries
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'TU') WHERE short_name = 'CU';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'CU') WHERE short_name = 'TU';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'KMITL') WHERE short_name = 'KU';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'KU') WHERE short_name = 'KMITL';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'KKU') WHERE short_name = 'CMU';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'CMU') WHERE short_name = 'KKU';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'KMUTNB') WHERE short_name = 'KMUTT';
UPDATE universities SET rival_id = (SELECT id FROM universities WHERE short_name = 'KMUTT') WHERE short_name = 'KMUTNB';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_universities_user_id ON user_universities(user_id);
CREATE INDEX IF NOT EXISTS idx_university_war_scores_university_id ON university_war_scores(university_id);
CREATE INDEX IF NOT EXISTS idx_university_war_scores_user_id ON university_war_scores(user_id);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_war_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Universities are viewable by everyone" ON universities FOR SELECT USING (true);

CREATE POLICY "Users can view their own university selection" ON user_universities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own university selection" ON user_universities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own university selection" ON user_universities FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "War scores are viewable by everyone" ON university_war_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert their own war scores" ON university_war_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
