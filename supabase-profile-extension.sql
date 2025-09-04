-- プロフィール項目追加SQL
-- GitHub Issue #6対応: プロファイル項目追加
-- 実行手順: Supabase Dashboard > SQL Editor で実行

-- Step 1: 新規カラム追加（Phase 1 - 基本項目）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_purpose VARCHAR(20) 
    CHECK (meeting_purpose IN ('chat', 'friend', 'relationship', 'marriage'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname VARCHAR(30);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER 
    CHECK (height >= 140 AND height <= 220);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type VARCHAR(20) 
    CHECK (body_type IN ('slim', 'normal', 'chubby', 'overweight'));

-- Step 2: 新規カラム追加（Phase 2 - 推奨項目）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hometown_prefecture VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking VARCHAR(20) 
    CHECK (drinking IN ('never', 'sometimes', 'often'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking VARCHAR(30) 
    CHECK (smoking IN ('never', 'sometimes', 'often', 'quit_for_partner'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_days VARCHAR(20) 
    CHECK (free_days IN ('irregular', 'weekends', 'weekdays'));

-- Step 3: 新規カラム追加（Phase 3 - 詳細項目）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_frequency VARCHAR(30) 
    CHECK (meeting_frequency IN ('monthly', 'twice_monthly', 'weekly', 'multiple_weekly', 'frequent'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS future_dreams TEXT;

-- Step 4: 画像・動画関連カラム（既存確認・追加）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS additional_images TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Step 5: インデックス追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_profiles_meeting_purpose ON profiles (meeting_purpose);
CREATE INDEX IF NOT EXISTS idx_profiles_height ON profiles (height);
CREATE INDEX IF NOT EXISTS idx_profiles_body_type ON profiles (body_type);
CREATE INDEX IF NOT EXISTS idx_profiles_hometown ON profiles (hometown_prefecture);

-- Step 6: プロフィール完成度計算関数更新
CREATE OR REPLACE FUNCTION calculate_profile_completion_extended(profile_row profiles)
RETURNS INTEGER AS $$
DECLARE
    completion_rate INTEGER := 0;
BEGIN
    -- 必須項目（各25点、計100点）
    IF profile_row.display_name IS NOT NULL AND LENGTH(profile_row.display_name) > 0 THEN 
        completion_rate := completion_rate + 25; 
    END IF;
    IF profile_row.age IS NOT NULL THEN 
        completion_rate := completion_rate + 25; 
    END IF;
    IF profile_row.gender IS NOT NULL THEN 
        completion_rate := completion_rate + 25; 
    END IF;
    IF profile_row.prefecture IS NOT NULL AND LENGTH(profile_row.prefecture) > 0 THEN 
        completion_rate := completion_rate + 25; 
    END IF;
    
    -- 追加項目ボーナス（各5点）
    IF profile_row.meeting_purpose IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.nickname IS NOT NULL AND LENGTH(profile_row.nickname) > 0 THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.height IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.body_type IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.city IS NOT NULL AND LENGTH(profile_row.city) > 0 THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.occupation IS NOT NULL AND LENGTH(profile_row.occupation) > 0 THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.bio IS NOT NULL AND LENGTH(profile_row.bio) > 10 THEN 
        completion_rate := completion_rate + 10; 
    END IF;
    IF profile_row.hometown_prefecture IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.drinking IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.smoking IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.free_days IS NOT NULL THEN 
        completion_rate := completion_rate + 5; 
    END IF;
    IF profile_row.main_image_url IS NOT NULL AND LENGTH(profile_row.main_image_url) > 0 THEN 
        completion_rate := completion_rate + 10; 
    END IF;
    
    -- 最大値を130に制限（100% + ボーナス30%）
    IF completion_rate > 130 THEN 
        completion_rate := 130; 
    END IF;
    
    RETURN completion_rate;
END;
$$ LANGUAGE plpgsql;

-- Step 7: 完成度計算トリガー更新
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_rate := calculate_profile_completion_extended(NEW);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存トリガーがあれば削除して再作成
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Step 8: 既存データの完成度再計算
UPDATE profiles SET 
    profile_completion_rate = calculate_profile_completion_extended(profiles.*),
    updated_at = NOW()
WHERE id IS NOT NULL;

-- Step 9: 選択肢用のマスターデータテーブル作成
CREATE TABLE IF NOT EXISTS profile_options (
    category VARCHAR(50) NOT NULL,
    value VARCHAR(50) NOT NULL,
    label_ja VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (category, value)
);

-- Step 10: 選択肢データの挿入
INSERT INTO profile_options (category, value, label_ja, sort_order) VALUES
-- 出会いの目的
('meeting_purpose', 'chat', 'チャット相手', 1),
('meeting_purpose', 'friend', '友達', 2),
('meeting_purpose', 'relationship', '恋人', 3),
('meeting_purpose', 'marriage', '結婚相手', 4),

-- 体型
('body_type', 'slim', 'スリム', 1),
('body_type', 'normal', '普通', 2),
('body_type', 'chubby', 'ぽっちゃり', 3),
('body_type', 'overweight', '太め', 4),

-- 飲酒
('drinking', 'never', '飲まない', 1),
('drinking', 'sometimes', '時々', 2),
('drinking', 'often', 'よく飲む', 3),

-- 喫煙
('smoking', 'never', '吸わない', 1),
('smoking', 'sometimes', '時々', 2),
('smoking', 'often', 'よく吸う', 3),
('smoking', 'quit_for_partner', '相手が嫌がれば禁煙', 4),

-- 休日
('free_days', 'irregular', '不定期', 1),
('free_days', 'weekends', '土日', 2),
('free_days', 'weekdays', '平日', 3),

-- 会う頻度
('meeting_frequency', 'monthly', '月1回', 1),
('meeting_frequency', 'twice_monthly', '月2回', 2),
('meeting_frequency', 'weekly', '週1回', 3),
('meeting_frequency', 'multiple_weekly', '週2-3回', 4),
('meeting_frequency', 'frequent', '週4回以上', 5)

ON CONFLICT (category, value) DO NOTHING;

-- Step 11: マスターデータテーブルのRLS設定
ALTER TABLE profile_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile options readable by authenticated users" ON profile_options
    FOR SELECT USING (auth.role() = 'authenticated');

-- 実行完了の確認クエリ
SELECT 
    'プロフィール項目追加完了' as status,
    COUNT(*) as total_profiles,
    AVG(profile_completion_rate) as avg_completion_rate
FROM profiles;