-- マッチング機能用テーブル作成SQL
-- Supabase Dashboard > SQL Editor で実行してください

-- likesテーブル作成（スワイプ「いいね！」の記録）
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_super_like BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同じユーザー間で重複いいね防止
    UNIQUE(from_user_id, to_user_id),
    
    -- 自分に自分でいいねできない制約
    CHECK (from_user_id != to_user_id)
);

-- matchesテーブル作成（マッチング成立の記録）
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'unmatched', 'blocked')),
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    unmatched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同じユーザー間で重複マッチ防止
    UNIQUE(user1_id, user2_id),
    
    -- 自分と自分でマッチできない制約
    CHECK (user1_id != user2_id)
);

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_likes_from_user ON likes (from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON likes (to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_mutual ON likes (from_user_id, to_user_id);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches (user1_id, status, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches (user2_id, status, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_last_message ON matches (last_message_at DESC NULLS LAST);

-- RLS（行レベルセキュリティ）有効化
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- likes テーブルのRLSポリシー
CREATE POLICY "Users can insert own likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view own likes sent" ON likes
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can view likes received" ON likes
    FOR SELECT USING (auth.uid() = to_user_id);

-- matches テーブルのRLSポリシー
CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own matches" ON matches
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- マッチング成立時の自動処理関数
CREATE OR REPLACE FUNCTION handle_new_match()
RETURNS TRIGGER AS $$
BEGIN
    -- 相互いいね確認
    IF EXISTS (
        SELECT 1 FROM likes 
        WHERE from_user_id = NEW.to_user_id 
        AND to_user_id = NEW.from_user_id
    ) THEN
        -- マッチング成立：matchesテーブルに挿入
        INSERT INTO matches (user1_id, user2_id, matched_at)
        VALUES (
            LEAST(NEW.from_user_id, NEW.to_user_id),
            GREATEST(NEW.from_user_id, NEW.to_user_id),
            NOW()
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- likes テーブルにトリガー設定（新しいいいねがあった時にマッチ確認）
CREATE TRIGGER trigger_handle_new_match
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_match();

-- プロフィールとの外部キー関連付け用ビュー（パフォーマンス向上）
CREATE OR REPLACE VIEW matches_with_profiles AS
SELECT 
    m.*,
    p1.display_name as user1_name,
    p1.age as user1_age,
    p1.main_image_url as user1_image,
    p2.display_name as user2_name,
    p2.age as user2_age,
    p2.main_image_url as user2_image
FROM matches m
JOIN profiles p1 ON m.user1_id = p1.id
JOIN profiles p2 ON m.user2_id = p2.id;

-- RLS有効化（ビューも同様の権限）
ALTER VIEW matches_with_profiles SET (security_invoker = true);