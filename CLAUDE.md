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

## プロジェクト概要

このプロジェクトは格安マッチングアプリ「prototype1」の要件定義・設計フェーズです。React Native + Expo をベースとしたモバイルアプリケーションで、Supabaseをバックエンドとして使用する予定です。

## 技術スタック

- **フロントエンド**: React Native, Expo
- **バックエンド**: Supabase
- **ビデオチャット**: WebRTC (react-native-webrtc), Socket.io
- **プラットフォーム**: iOS/Android

## プロジェクト構造

```
prototype1/
├── README.md                    # プロジェクト基本情報
├── 要件定義書.md                # 詳細な機能要件・非機能要件
├── docs/                        # 設計ドキュメント格納フォルダー
│   ├── 00_作成するドキュメント一覧.txt
│   ├── 01_要件定義テンプレ.txt
│   └── 01_要件定義INPUT.txt
└── CLAUDE.md                   # このファイル
```

## 主要機能（MVP）

1. **ユーザー認証・登録**: メールアドレス/パスワード認証
2. **プロフィール機能**: 基本情報、自己紹介、画像・動画アップロード
3. **チャット機能**: リアルタイムメッセージ交換

## Phase2対応予定機能

- **ビデオチャット機能**: WebRTCを使用した1対1ビデオ通話

## 重要な注意事項

- このプロジェクトは法的コンプライアンス（18歳未満利用禁止、売春防止法など）への配慮が必要
- セキュリティとプライバシー保護が重要
- 現在は要件定義・設計フェーズであり、実装コードは未作成
