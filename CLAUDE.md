# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Instructions for Claude

- すべての回答と生成物は日本語で出力してください。
- プロジェクトのコード内のコメントやドキュメントも、特に指定がない限り日本語で記述してください。
- ユーザーからの指示が日本語である場合、常に日本語で応答してください。
- 技術用語は日本語訳を併記するか、そのまま日本語の文脈に溶け込ませて使用してください。

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Do not make any changes, until you have 95% confidence that you know what to build
ask me follow up questions until you have that confidence.

## プロジェクト概要

このプロジェクトは格安マッチングアプリ「prototype1」のMVP実装プロジェクトです。React Native + Expo をベースとしたモバイルアプリケーションで、Supabaseをバックエンドとして使用しています。

## 技術スタック

- **フロントエンド**: React Native, Expo
- **バックエンド**: Supabase (Database + Storage)
- **UIコンポーネント**: @react-native-picker/picker
- **メディア処理**: expo-image-picker, expo-av
- **ナビゲーション**: @react-navigation/native, @react-navigation/stack
- **プラットフォーム**: iOS/Android

## プロジェクト構造

```
prototype1/
├── README.md                           # プロジェクト基本情報
├── CLAUDE.md                           # このファイル
├── 1_要件定義書.md                    # 詳細な機能要件・非機能要件
├── 2_アーキテクチャ設計書.md           # 技術スタック・アーキテクチャ設計
├── 3_データベース設計書.md             # DBスキーマ・テーブル設計
├── 4_API設計書.md                     # REST API仕様書
├── 5_サイトマップ設計書.md             # 画面遷移・ユーザーフロー
├── supabase-profiles-setup.sql        # Supabaseデータベース初期設定
├── supabase-profile-extension.sql     # プロフィール項目拡張SQL
├── app/                                # React Nativeアプリケーション
│   ├── App.tsx                         # メインアプリコンポーネント
│   ├── app.config.js                   # Expo設定ファイル
│   ├── package.json                    # 依存関係管理
│   └── src/                            # ソースコード
│       ├── contexts/                   # Reactコンテキスト
│       │   └── AuthContext.tsx         # 認証状態管理
│       ├── navigation/                 # 画面ナビゲーション
│       │   ├── AppNavigator.tsx        # メインナビゲーター
│       │   ├── AuthNavigator.tsx       # 認証フローナビゲーター
│       │   └── MainNavigator.tsx       # メイン機能ナビゲーター
│       ├── screens/                    # 画面コンポーネント
│       │   ├── auth/                   # 認証関連画面
│       │   ├── profile/                # プロフィール関連画面
│       │   │   ├── ProfileCreationScreen.tsx    # プロフィール作成
│       │   │   ├── ProfileEditScreen.tsx        # プロフィール編集
│       │   │   └── ProfileViewScreen.tsx        # プロフィール表示
│       │   └── HomeScreen.tsx          # ホーム画面（カードスワイプ機能搭載）
│       ├── components/                 # 再利用可能なコンポーネント
│       │   ├── CardSwiper.tsx          # カードスワイプコンポーネント
│       │   ├── ProfileCard.tsx         # プロフィールカード表示コンポーネント
│       │   ├── HeightPicker.tsx        # 身長選択コンポーネント
│       │   └── OptionPicker.tsx        # 汎用選択肢ピッカーコンポーネント
│       ├── data/                       # モックデータ
│       │   └── mockProfiles.ts         # テスト用プロフィールデータ
│       ├── services/                   # APIサービス
│       │   ├── profileService.ts       # プロフィール関連API
│       │   ├── mediaService.ts         # 画像・動画アップロードAPI
│       │   └── validationService.ts    # プロフィール入力値検証サービス
│       ├── types/                      # TypeScript型定義
│       │   └── profile.ts              # プロフィール型定義
│       └── lib/                        # 外部ライブラリ設定
│           └── supabase.ts             # Supabaseクライアント設定
└── docs/                               # 旧設計ドキュメント格納フォルダー
    ├── 00_作成するドキュメント一覧.txt
    ├── 01_要件定義テンプレ.txt
    └── 01_要件定義INPUT.txt
```

## 実装済み機能（MVP）

### 1. ユーザー認証・登録
- メールアドレス/パスワード認証（Supabase Auth）
- サインアップ、サインイン、サインアウト機能
- パスワードリセット機能
- 認証状態の自動管理とナビゲーション制御

### 2. プロフィール機能 ✅ 拡張完了
- **プロフィール作成**: 表示名、年齢、性別、都道府県（必須項目）+ 任意項目
- **プロフィール表示**: 完成度表示、基本情報、自己紹介、希望条件の閲覧
- **プロフィール編集**: 既存プロフィール情報の更新
- **希望条件設定**: 年齢範囲（Picker UI）、希望地域の設定
- **バリデーション**: フォーム入力値の検証とエラーハンドリング
- **プロフィール完成度計算**: 入力項目に応じた完成度の自動計算（130%上限）
- **拡張項目**: 出会いの目的、ニックネーム、身長、体型、出身地、ライフスタイル、将来の夢など10項目追加

### 3. 画像・動画機能 ✅ 新規実装完了
- **メイン画像アップロード**: 必須項目として1枚のメイン画像登録
- **追加画像アップロード**: 最大5枚の追加画像登録（任意）
- **動画アップロード**: 1本の動画登録（30秒以内、任意）
- **メディア権限管理**: iOS/AndroidのカメラとフォトライブラリAPIアクセス
- **Supabase Storage連携**: profile-mediaバケットでの画像・動画管理
- **自動リサイズ・最適化**: 品質設定とファイルサイズ最適化
- **重複エラー処理**: ファイル名の一意性確保と自動再試行機能

### 4. ナビゲーション・画面遷移
- 認証状態に基づく自動画面遷移
- プロフィール未作成時の強制プロフィール作成フロー
- プロフィール作成完了後のホーム画面遷移

### 5. カードスワイプ機能 ✅ 新規実装完了
- **カードスワイプUI**: マッチングアプリ風のカードスワイプインターフェース
- **スワイプジェスチャー**: 左右にドラッグしてカードをスワイプ
- **アニメーション**: カードの移動・傾き・フェードアウトアニメーション
- **スワイプインジケーター**: 「いいね！」「パス」の視覚的フィードバック
- **アクションボタン**: スワイプ以外にボタンでの操作も可能
- **モックデータ連携**: 6人分のテスト用プロフィールデータを表示

### 6. プロフィール項目拡張機能 ✅ 新規実装完了
- **詳細プロフィール項目**: 出会いの目的、ニックネーム、身長、体型（4項目）
- **ライフスタイル項目**: 出身地、飲酒、喫煙、休日（4項目）  
- **将来について項目**: 理想の会う頻度、将来の夢（2項目）
- **専用UIコンポーネント**: HeightPicker（身長選択）、OptionPicker（選択肢）
- **入力値検証**: ValidationServiceによる包括的なバリデーション
- **プロフィール完成度**: 新項目を含む完成度計算（最大100%）
- **画面表示対応**: 作成・編集・表示画面での新項目対応完了

### 7. UI/UX
- プラットフォーム対応（iOS/Android）
- レスポンシブデザイン
- ローディング状態の適切な表示
- Picker コンポーネントの位置調整とスタイリング

## Phase2対応予定機能

- **チャット機能**: リアルタイムメッセージ交換
- **マッチング機能**: ユーザー同士のマッチングアルゴリズム
- **ビデオチャット機能**: WebRTCとSupabase Realtimeを使用した1対1ビデオ通話

## 現在の開発状況

- **認証機能**: ✅ 完了
- **プロフィール機能**: ✅ 完了（CRUD操作、UI実装済み）
- **プロフィール項目拡張**: ✅ 完了（10項目追加、バリデーション、UI実装済み）
- **画像・動画機能**: ✅ 完了（メディアアップロード・表示機能実装済み）
- **カードスワイプ機能**: ✅ 完了（スワイプジェスチャー、アニメーション実装済み）
- **ナビゲーション**: ✅ 完了
- **基本UI/UX**: ✅ 完了
- **チャット機能**: ❌ 未着手
- **マッチング機能**: ❌ 未着手

## 重要な注意事項

- このプロジェクトは法的コンプライアンス（18歳未満利用禁止、売春防止法など）への配慮が必要
- セキュリティとプライバシー保護が重要
- 現在はMVP機能の実装が完了し、Phase2機能の開発準備段階

## 開発・デバッグ情報

### テスト環境での起動方法
```bash
cd app
npm install
npm start
# または
npx expo start
```

### 重要な設定ファイル
- `app/src/lib/supabase.ts`: Supabaseクライアント設定
- `app/src/contexts/AuthContext.tsx`: 認証状態管理
- `app/src/services/profileService.ts`: プロフィールAPI操作（拡張完了）
- `app/src/services/validationService.ts`: プロフィールバリデーション（新規）
- `app/src/services/mediaService.ts`: 画像・動画アップロードAPI操作
- `app/src/components/HeightPicker.tsx`: 身長選択UIコンポーネント（新規）
- `app/src/components/OptionPicker.tsx`: 汎用選択UIコンポーネント（新規）
- `app/app.config.js`: Expo設定（メディア権限設定含む）

### Supabaseバックエンド設定
- **データベース**: profilesテーブル（画像・動画URLフィールド + 拡張プロフィール項目10項目追加済み）
- **Storage**: profile-mediaバケット（Public設定、RLSポリシー設定済み）
- **権限**: 認証ユーザーが自分のメディアファイルのみCRUD可能
- **マスターデータ**: profile_optionsテーブル（選択項目データ管理）

### 既知の技術課題
- Picker コンポーネントのプラットフォーム間表示差異（調整済み）
- プロフィール存在確認とナビゲーション制御の同期処理
- React NativeでのBlob処理問題（FormData方式で解決済み）
- `react-native-deck-swiper`ライブラリでの`length`プロパティエラー（自作スワイパーで解決済み）

### 最新の実装詳細

#### CardSwiperコンポーネント
- **技術**: React Native PanResponder + Animated API
- **機能**: 左右スワイプジェスチャー、カードの傾きアニメーション、スワイプインジケーター
- **特徴**: サードパーティライブラリを使わずに自作実装
- **アニメーション**: スワイプ方向への15度傾き、透明度変化、画面外への移動

#### ProfileCardコンポーネント  
- **機能**: プロフィール情報の表示、画像表示、安全なundefinedハンドリング
- **レイアウト**: フルスクリーンカード、オーバーレイ情報表示、画像インジケーター
- **拡張機能**: 出会いの目的タグ表示、新規プロフィール項目対応

#### HeightPicker & OptionPickerコンポーネント
- **HeightPicker**: モーダル式身長選択（140-220cm、5cm刻み）
- **OptionPicker**: 汎用選択肢ピッカー（出会いの目的、体型、飲酒等）
- **共通機能**: モーダル表示、キャンセル・クリア機能、スクロール可能リスト

#### ValidationServiceサービス
- **包括的検証**: 全プロフィール項目のバリデーション
- **エラーハンドリング**: 日本語エラーメッセージ、項目別検証
- **制約チェック**: 身長範囲、テキスト長、選択肢値の検証
