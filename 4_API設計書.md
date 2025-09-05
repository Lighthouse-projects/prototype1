# REST API 設計

## 認証関連
### POST /api/auth/signup
**認証**: 不要  
**説明**: 新規ユーザー登録

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "gender": "male"
  }'
```

リクエストボディ:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "gender": "male"
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "email_verified": false,
      "created_at": "2024-01-01T10:00:00Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.MRjVnEiCaORowxYVwEYvf...",
      "expires_at": "2024-01-01T18:00:00Z"
    }
  }
}
```

**レスポンス**: 201 Created  
**エラー**: 400 Bad Request, 409 Conflict (Email already exists)

### POST /api/auth/login
**認証**: 不要  
**説明**: ユーザーログイン

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

リクエストボディ:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "is_verified": true
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.MRjVnEiCaORowxYVwEYvf...",
      "expires_at": "2024-01-01T18:00:00Z"
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 400 Bad Request, 401 Unauthorized (Invalid credentials)

### POST /api/auth/logout
**認証**: 必要  
**説明**: ユーザーログアウト

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

## プロフィール関連
### GET /api/profiles/me
**認証**: 必要  
**説明**: 自分のプロフィール情報取得

リクエスト例:
```bash
curl -X GET https://api.matchingapp.com/api/profiles/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "田中太郎",
    "age": 28,
    "gender": "male",
    "prefecture": "東京都",
    "city": "渋谷区",
    "occupation": "エンジニア",
    "bio": "よろしくお願いします",
    "interests": ["映画鑑賞", "旅行", "読書"],
    "preferred_min_age": 25,
    "preferred_max_age": 35,
    "preferred_prefecture": "東京都",
    "profile_completion_rate": 85,
    "images": [
      {
        "id": "image-1",
        "file_path": "https://cdn.example.com/images/user1_1.jpg",
        "is_primary": true,
        "order_index": 0
      }
    ],
    "default_avatar": "https://cdn.example.com/avatars/default_male.png"
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

### PUT /api/profiles/me
**認証**: 必要  
**説明**: 自分のプロフィール更新

リクエスト例:
```bash
curl -X PUT https://api.matchingapp.com/api/profiles/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "田中太郎",
    "age": 28,
    "prefecture": "東京都",
    "bio": "新しい自己紹介文です"
  }'
```

リクエストボディ:
```json
{
  "display_name": "田中太郎",
  "age": 28,
  "prefecture": "東京都",
  "city": "渋谷区",
  "occupation": "エンジニア",
  "bio": "新しい自己紹介文です",
  "interests": ["映画鑑賞", "旅行"],
  "preferred_min_age": 25,
  "preferred_max_age": 35
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "田中太郎",
    "age": 28,
    "updated_at": "2024-01-01T10:30:00Z"
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 400 Bad Request, 401 Unauthorized

### GET /api/profiles/{user_id}
**認証**: 必要  
**説明**: 他のユーザーのプロフィール取得

リクエスト例:
```bash
curl -X GET https://api.matchingapp.com/api/profiles/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "山田花子",
    "age": 26,
    "prefecture": "東京都",
    "occupation": "デザイナー",
    "bio": "よろしくお願いします",
    "interests": ["カフェ巡り", "写真"],
    "images": [
      {
        "id": "image-2",
        "file_path": "https://cdn.example.com/images/user2_1.jpg",
        "is_primary": true
      }
    ],
    "default_avatar": "https://cdn.example.com/avatars/default_female.png",
    "last_active": "2024-01-01T09:00:00Z"
  }
}
```

**注意事項**:
- imagesが空配列の場合、フロントエンドはdefault_avatarを表示
- default_avatarはユーザーの性別に応じて自動設定

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

## 画像・動画関連
### POST /api/profiles/images
**認証**: 必要  
**説明**: プロフィール画像・動画アップロード

リクエスト例（画像）:
```bash
curl -X POST https://api.matchingapp.com/api/profiles/images \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@profile.jpg" \
  -F "order_index=0" \
  -F "is_primary=true"
```

リクエスト例（動画）:
```bash
curl -X POST https://api.matchingapp.com/api/profiles/images \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@profile_video.mp4" \
  -F "order_index=1" \
  -F "is_primary=false"
```

**制限事項**:
- 画像: JPEG, PNG形式、最大10MB
- 動画: MP4形式、最大20秒、最大50MB
- 画像・動画合わせて最大5ファイル

レスポンス例（画像）:
```json
{
  "success": true,
  "data": {
    "id": "image-123",
    "file_path": "https://cdn.example.com/images/user1_new.jpg",
    "file_type": "image",
    "file_size": 2048576,
    "order_index": 0,
    "is_primary": true,
    "moderation_status": "pending",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

レスポンス例（動画）:
```json
{
  "success": true,
  "data": {
    "id": "video-456",
    "file_path": "https://cdn.example.com/videos/user1_intro.mp4",
    "file_type": "video",
    "file_size": 15728640,
    "duration": 18,
    "order_index": 1,
    "is_primary": false,
    "moderation_status": "pending",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**レスポンス**: 201 Created  
**エラー**: 400 Bad Request, 401 Unauthorized, 413 Payload Too Large

### DELETE /api/profiles/images/{image_id}
**認証**: 必要  
**説明**: プロフィール画像削除

リクエスト例:
```bash
curl -X DELETE https://api.matchingapp.com/api/profiles/images/image-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

## 発見・検索関連
### POST /functions/v1/get-recommended-profiles (Supabase Edge Function)
**認証**: 必要 (Bearer Token)  
**説明**: セキュアな推奨プロフィール取得  
**実装形態**: Supabase Edge Function  

**セキュリティ機能**:
- Service Role Keyによるサーバーサイドデータアクセス
- RLSポリシーを迂回した安全なデータ取得
- いいね済みユーザーの自動除外
- 年齢・プロフィール完成度による自動フィルタリング

リクエスト例:
```bash
curl -X POST https://gcdvaqpgwflnkrdcjkkg.supabase.co/functions/v1/get-recommended-profiles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10
  }'
```

リクエストボディ:
```json
{
  "limit": 10
}
```

**パラメータ**:
- `limit` (number, optional): 取得するプロフィール数（デフォルト: 10）

レスポンス例（成功）:
```json
{
  "profiles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "display_name": "山田花子",
      "age": 26,
      "prefecture": "東京都",
      "occupation": "デザイナー",
      "main_image_url": "https://cdn.example.com/images/user2_1.jpg",
      "additional_images": [
        "https://cdn.example.com/images/user2_2.jpg"
      ],
      "bio": "よろしくお願いします",
      "liked_by_current_user": false
    }
  ]
}
```

**フィルタリングロジック**:
1. 現在のユーザー以外
2. プロフィール必須項目が完成済み（display_name, age, gender）
3. 現在のユーザーの希望年齢範囲内
4. いいね済みユーザーを除外

**エラーレスポンス**:
```json
{
  "error": "認証が必要です"
}
```

```json
{
  "error": "プロフィールが見つかりません"
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found, 500 Internal Server Error

**技術仕様**:
- **実行環境**: Deno Runtime
- **アクセス制御**: JWT認証 + Service Role Key
- **パフォーマンス**: 平均応答時間 < 1秒
- **制限**: レート制限（ユーザーあたり60リクエスト/分）

### GET /api/discover (従来のREST API - Phase2実装予定)
**認証**: 必要  
**説明**: マッチング対象ユーザー検索（地理的検索機能付き）

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/discover?page=1&limit=10&min_age=25&max_age=35&prefecture=東京都" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "display_name": "山田花子",
        "age": 26,
        "prefecture": "東京都",
        "occupation": "デザイナー",
        "bio": "よろしくお願いします",
        "images": [
          {
            "file_path": "https://cdn.example.com/images/user2_1.jpg",
            "is_primary": true
          }
        ],
        "distance_km": 5.2,
        "last_active": "2024-01-01T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "has_more": true
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 400 Bad Request

## いいね関連
### POST /api/likes
**認証**: 必要  
**説明**: 他のユーザーにいいねを送信

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/likes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "to_user_id": "550e8400-e29b-41d4-a716-446655440001",
    "is_super_like": false
  }'
```

リクエストボディ:
```json
{
  "to_user_id": "550e8400-e29b-41d4-a716-446655440001",
  "is_super_like": false
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "like-123",
    "to_user_id": "550e8400-e29b-41d4-a716-446655440001",
    "is_super_like": false,
    "created_at": "2024-01-01T10:00:00Z",
    "is_match": true
  }
}
```

**レスポンス**: 201 Created  
**エラー**: 400 Bad Request, 401 Unauthorized, 409 Conflict

### GET /api/likes/received
**認証**: 必要  
**説明**: 受信したいいね一覧取得

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/likes/received?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "id": "like-456",
        "from_user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "display_name": "佐藤次郎",
          "age": 30,
          "images": [
            {
              "file_path": "https://cdn.example.com/images/user3_1.jpg",
              "is_primary": true
            }
          ]
        },
        "is_super_like": false,
        "created_at": "2024-01-01T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "has_more": false
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

## マッチ関連
### GET /api/matches
**認証**: 必要  
**説明**: マッチ一覧取得

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/matches?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "match-123",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "display_name": "山田花子",
          "age": 26,
          "images": [
            {
              "file_path": "https://cdn.example.com/images/user2_1.jpg",
              "is_primary": true
            }
          ]
        },
        "matched_at": "2024-01-01T10:00:00Z",
        "last_message": {
          "content": "こんにちは！",
          "created_at": "2024-01-01T10:30:00Z",
          "is_from_me": false
        },
        "unread_count": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "has_more": false
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

### DELETE /api/matches/{match_id}
**認証**: 必要  
**説明**: マッチ解除

リクエスト例:
```bash
curl -X DELETE https://api.matchingapp.com/api/matches/match-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "message": "Match removed successfully"
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

## メッセージ関連
### GET /api/matches/{match_id}/messages
**認証**: 必要  
**説明**: マッチのメッセージ履歴取得

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/matches/match-123/messages?page=1&limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-456",
        "sender_id": "550e8400-e29b-41d4-a716-446655440001",
        "content": "こんにちは！よろしくお願いします",
        "message_type": "text",
        "created_at": "2024-01-01T10:00:00Z",
        "read_at": "2024-01-01T10:05:00Z"
      },
      {
        "id": "msg-457",
        "sender_id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "こちらこそよろしくお願いします！",
        "message_type": "text",
        "created_at": "2024-01-01T10:10:00Z",
        "read_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "has_more": false
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

### POST /api/matches/{match_id}/messages
**認証**: 必要  
**説明**: メッセージ送信

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/matches/match-123/messages \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "こんにちは！元気ですか？",
    "message_type": "text"
  }'
```

リクエストボディ:
```json
{
  "content": "こんにちは！元気ですか？",
  "message_type": "text"
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "msg-789",
    "match_id": "match-123",
    "sender_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "こんにちは！元気ですか？",
    "message_type": "text",
    "created_at": "2024-01-01T11:00:00Z",
    "read_at": null
  }
}
```

**レスポンス**: 201 Created  
**エラー**: 400 Bad Request, 401 Unauthorized, 403 Forbidden (Not verified)

### PUT /api/messages/{message_id}/read
**認証**: 必要  
**説明**: メッセージ既読更新

リクエスト例:
```bash
curl -X PUT https://api.matchingapp.com/api/messages/msg-789/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "msg-789",
    "read_at": "2024-01-01T11:05:00Z"
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

## 通知関連
### GET /api/notifications
**認証**: 必要  
**説明**: 通知一覧取得

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/notifications?page=1&limit=20&unread_only=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-123",
        "notification_type": "like_received",
        "title": "新しいいいねが届きました",
        "body": "山田花子さんがあなたにいいねしました",
        "data": {
          "from_user_id": "550e8400-e29b-41d4-a716-446655440001",
          "like_id": "like-456"
        },
        "is_read": false,
        "sent_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "has_more": false
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

### PUT /api/notifications/{notification_id}/read
**認証**: 必要  
**説明**: 通知既読更新

リクエスト例:
```bash
curl -X PUT https://api.matchingapp.com/api/notifications/notif-123/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "id": "notif-123",
    "is_read": true,
    "read_at": "2024-01-01T11:00:00Z"
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized, 404 Not Found

## ポイント関連（Phase2）
**注意**: Phase2未実装時は全てのポイント関連APIで`404 Not Found`エラーを返します。
### GET /api/points/balance
**認証**: 必要  
**説明**: ポイント残高取得

リクエスト例:
```bash
curl -X GET https://api.matchingapp.com/api/points/balance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_balance": 50,
    "last_transaction_at": "2024-01-01T10:00:00Z"
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

### POST /api/points/purchase
**認証**: 必要  
**説明**: ポイント購入

リクエスト例:
```bash
curl -X POST https://api.matchingapp.com/api/points/purchase \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "receipt_data": {
      "receipt": "base64_encoded_receipt",
      "platform": "ios",
      "product_id": "points_100"
    }
  }'
```

リクエストボディ:
```json
{
  "amount": 100,
  "receipt_data": "base64_encoded_receipt"
}
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "transaction_id": "tx-123",
    "amount": 100,
    "balance_after": 150,
    "created_at": "2024-01-01T11:00:00Z"
  }
}
```

**レスポンス**: 201 Created  
**エラー**: 400 Bad Request, 401 Unauthorized

### GET /api/points/history
**認証**: 必要  
**説明**: ポイント取引履歴取得

リクエスト例:
```bash
curl -X GET "https://api.matchingapp.com/api/points/history?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

レスポンス例:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx-123",
        "transaction_type": "purchase",
        "amount": 100,
        "balance_after": 150,
        "description": "ポイント購入",
        "created_at": "2024-01-01T11:00:00Z"
      },
      {
        "id": "tx-124",
        "transaction_type": "consume",
        "amount": -1,
        "balance_after": 149,
        "description": "いいね送信",
        "created_at": "2024-01-01T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "has_more": false
    }
  }
}
```

**レスポンス**: 200 OK  
**エラー**: 401 Unauthorized

## 共通エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "リクエストが無効です",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### エラーコード一覧
- **400 Bad Request**: `INVALID_REQUEST`, `VALIDATION_ERROR`
- **401 Unauthorized**: `UNAUTHORIZED`, `TOKEN_EXPIRED`
- **403 Forbidden**: `FORBIDDEN`, `NOT_VERIFIED`
- **404 Not Found**: `NOT_FOUND`
- **409 Conflict**: `ALREADY_EXISTS`, `ALREADY_LIKED`
- **413 Payload Too Large**: `FILE_TOO_LARGE`
- **429 Too Many Requests**: `RATE_LIMIT_EXCEEDED`
- **500 Internal Server Error**: `INTERNAL_ERROR`