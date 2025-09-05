-- チャット機能用テーブル作成SQL
-- Supabase Dashboard > SQL Editor で実行してください

-- チャットルームテーブル作成
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- 同じマッチに対して複数のチャットルーム作成防止
    UNIQUE(match_id)
);

-- メッセージテーブル作成
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- メッセージは削除されても履歴として残す（論理削除）
    CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 1000)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_chat_rooms_match ON chat_rooms (match_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated ON chat_rooms (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages (chat_room_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (chat_room_id, read_at) WHERE read_at IS NULL;

-- RLS（行レベルセキュリティ）有効化
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- chat_rooms テーブルのRLSポリシー
-- 注意: EdgeFunctionではService Role Keyを使用するため、
-- これらのポリシーは直接クライアントアクセス用（基本的に使用されない）

CREATE POLICY "Users can view own chat rooms" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches m 
            WHERE m.id = match_id 
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
            AND m.status = 'matched'
        )
    );

-- messages テーブルのRLSポリシー
CREATE POLICY "Users can view messages in their chat rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms cr
            JOIN matches m ON cr.match_id = m.id
            WHERE cr.id = chat_room_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
            AND m.status = 'matched'
        )
    );

CREATE POLICY "Users can insert messages in their chat rooms" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_rooms cr
            JOIN matches m ON cr.match_id = m.id
            WHERE cr.id = chat_room_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
            AND m.status = 'matched'
        )
    );

-- チャットルーム作成時の自動処理関数
CREATE OR REPLACE FUNCTION create_or_get_chat_room(p_match_id UUID)
RETURNS UUID AS $$
DECLARE
    room_id UUID;
BEGIN
    -- 既存のチャットルームがあるかチェック
    SELECT id INTO room_id FROM chat_rooms WHERE match_id = p_match_id;
    
    -- なければ新規作成
    IF room_id IS NULL THEN
        INSERT INTO chat_rooms (match_id) VALUES (p_match_id) RETURNING id INTO room_id;
    END IF;
    
    RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メッセージ挿入時のチャットルーム更新関数
CREATE OR REPLACE FUNCTION update_chat_room_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- チャットルームの最終メッセージ情報を更新
    UPDATE chat_rooms 
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.sent_at,
        updated_at = NOW()
    WHERE id = NEW.chat_room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メッセージ挿入時のトリガー設定
CREATE TRIGGER trigger_update_chat_room_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_on_message();

-- Realtimeの有効化（リアルタイム通信用）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- 統計情報更新（パフォーマンス最適化）
ANALYZE chat_rooms;
ANALYZE messages;