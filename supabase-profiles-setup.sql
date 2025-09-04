-- プロフィールテーブル作成SQL
-- Supabase Dashboard > SQL Editor で実行してください

-- profilesテーブル作成
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    prefecture VARCHAR(20) NOT NULL,
    city VARCHAR(50),
    occupation VARCHAR(50),
    bio TEXT,
    interests TEXT[], -- 趣味・興味の配列
    
    -- 希望条件
    preferred_min_age INTEGER CHECK (preferred_min_age >= 18),
    preferred_max_age INTEGER CHECK (preferred_max_age <= 99),
    preferred_prefecture VARCHAR(20),
    
    -- システム項目
    profile_completion_rate INTEGER DEFAULT 0 CHECK (profile_completion_rate >= 0 AND profile_completion_rate <= 100),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_discovery ON profiles (age, gender, prefecture);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles (last_active DESC);

-- RLS（行レベルセキュリティ）有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- プロフィール完成度計算関数（後で使用）
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_row profiles)
RETURNS INTEGER AS $$
DECLARE
    completion_rate INTEGER := 0;
BEGIN
    -- 必須項目
    IF profile_row.display_name IS NOT NULL THEN completion_rate := completion_rate + 25; END IF;
    IF profile_row.age IS NOT NULL THEN completion_rate := completion_rate + 25; END IF;
    IF profile_row.gender IS NOT NULL THEN completion_rate := completion_rate + 25; END IF;
    IF profile_row.prefecture IS NOT NULL THEN completion_rate := completion_rate + 25; END IF;
    
    -- 任意項目（ボーナスポイント）
    -- 実装は簡素化のため省略
    
    RETURN completion_rate;
END;
$$ LANGUAGE plpgsql;

-- 都道府県マスターデータ（選択肢用）
CREATE TABLE IF NOT EXISTS prefectures (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

-- 都道府県データ挿入
INSERT INTO prefectures (code, name) VALUES
('01', '北海道'), ('02', '青森県'), ('03', '岩手県'), ('04', '宮城県'), ('05', '秋田県'),
('06', '山形県'), ('07', '福島県'), ('08', '茨城県'), ('09', '栃木県'), ('10', '群馬県'),
('11', '埼玉県'), ('12', '千葉県'), ('13', '東京都'), ('14', '神奈川県'), ('15', '新潟県'),
('16', '富山県'), ('17', '石川県'), ('18', '福井県'), ('19', '山梨県'), ('20', '長野県'),
('21', '岐阜県'), ('22', '静岡県'), ('23', '愛知県'), ('24', '三重県'), ('25', '滋賀県'),
('26', '京都府'), ('27', '大阪府'), ('28', '兵庫県'), ('29', '奈良県'), ('30', '和歌山県'),
('31', '鳥取県'), ('32', '島根県'), ('33', '岡山県'), ('34', '広島県'), ('35', '山口県'),
('36', '徳島県'), ('37', '香川県'), ('38', '愛媛県'), ('39', '高知県'), ('40', '福岡県'),
('41', '佐賀県'), ('42', '長崎県'), ('43', '熊本県'), ('44', '大分県'), ('45', '宮崎県'),
('46', '鹿児島県'), ('47', '沖縄県')
ON CONFLICT (code) DO NOTHING;