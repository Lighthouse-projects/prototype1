-- 認証・オンボーディング用の最小限のusersテーブル設定

-- RLS有効化（既にauth.usersテーブルは存在するのでカスタムテーブルのみ）
-- Supabase Authが自動的にauth.usersを管理

-- プロフィール情報は後のPhaseで追加予定
-- 今回は認証機能のみ実装

-- メール認証設定
-- Supabase Dashboard > Authentication > Settings で以下を設定:
-- 1. Email confirmation: 有効化
-- 2. Site URL: http://localhost:8081 (開発時)
-- 3. Redirect URLs: http://localhost:8081 (開発時)

-- Supabase設定値をメモ：
-- Project URL: https://your-project-id.supabase.co
-- Anon Key: your-anon-key-here

-- 設定後、.envファイルを更新:
-- EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
-- EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here