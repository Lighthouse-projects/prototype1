import { supabase } from '../lib/supabase'
import { AuthService } from './authService'
import { ApiService } from './apiService'
import { Logger } from '../utils/logger'

export interface ChatWithPartner {
  chat_room_id: string
  match_id: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  partner: {
    id: string
    display_name: string
    main_image_url?: string
  }
}

export interface MessageWithSender {
  id: string
  content: string
  message_type: string
  sent_at: string
  read_at?: string
  sender: {
    id: string
    display_name: string
    main_image_url?: string
  }
  is_own_message: boolean
}

export interface SendMessageResponse {
  message: MessageWithSender
  chat_room_id: string
}

export class ChatService {
  static async getChatRoomByMatchId(matchId: string): Promise<string | null> {
    try {
      const user = await AuthService.getCurrentUser()

      // まず、matchIdが自分に関連するものかチェック
      const matchData = await ApiService.executeQuery(
        supabase
          .from('matches')
          .select('id')
          .eq('id', matchId)
          .eq('status', 'matched')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .single(),
        'ChatService:checkMatch'
      )

      if (!matchData) {
        Logger.warn('ChatService', 'マッチが見つからないかアクセス権限がありません', {
          userId: user.id,
          metadata: { matchId }
        })
        return null
      }

      // チャットルームを検索
      try {
        const chatRoom = await ApiService.executeQuery(
          supabase
            .from('chat_rooms')
            .select('id')
            .eq('match_id', matchId)
            .single(),
          'ChatService:getChatRoom'
        )
        
        return chatRoom.id
      } catch (error: any) {
        // チャットルームがまだ存在しない場合
        Logger.info('ChatService', 'チャットルームがまだ作成されていません', {
          userId: user.id,
          metadata: { matchId }
        })
        return null
      }
    } catch (error: any) {
      Logger.error('ChatService:getChatRoomByMatchId', error, {
        metadata: { matchId }
      })
      return null
    }
  }

  static async getChatList(): Promise<ChatWithPartner[]> {
    try {
      const response = await ApiService.callEdgeFunction<{ chats: ChatWithPartner[] }>(
        'get-chat-list'
      )

      if (!response.chats) {
        throw new Error('チャットデータが取得できませんでした')
      }

      Logger.info('ChatService', `チャット一覧取得完了: ${response.chats.length}件`)
      return response.chats
    } catch (error: any) {
      Logger.error('ChatService:getChatList', error)
      throw new Error(error.message || 'チャット一覧の取得に失敗しました')
    }
  }

  static async getChatMessages(
    chatRoomId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ messages: MessageWithSender[]; hasMore: boolean }> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase.functions.invoke('get-chat-messages', {
        body: { 
          chat_room_id: chatRoomId, 
          limit, 
          offset 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw new Error(error.message || 'メッセージ取得に失敗しました')
      }

      if (!data || !data.messages) {
        throw new Error('メッセージデータが取得できませんでした')
      }

      return {
        messages: data.messages,
        hasMore: data.has_more || false
      }
    } catch (error: any) {
      console.error('メッセージ取得エラー:', error)
      throw new Error(error.message || 'メッセージの取得に失敗しました')
    }
  }

  static async sendMessage(
    matchId: string, 
    content: string, 
    messageType: string = 'text'
  ): Promise<SendMessageResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      if (!content.trim()) {
        throw new Error('メッセージ内容を入力してください')
      }

      if (content.length > 1000) {
        throw new Error('メッセージが長すぎます（1000文字以内）')
      }

      const { data, error } = await supabase.functions.invoke('send-message', {
        body: { 
          match_id: matchId,
          content: content.trim(),
          message_type: messageType
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw new Error(error.message || 'メッセージ送信に失敗しました')
      }

      if (!data || !data.message) {
        throw new Error('メッセージ送信後のレスポンスが不正です')
      }

      return {
        message: data.message,
        chat_room_id: data.chat_room_id
      }
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error)
      throw new Error(error.message || 'メッセージの送信に失敗しました')
    }
  }

  // リアルタイムメッセージ購読用のヘルパー
  static subscribeToMessages(
    chatRoomId: string,
    onNewMessage: (message: any, eventType?: string) => void,
    onError?: (error: any) => void
  ) {
    try {
      const subscription = supabase
        .channel(`chat_room:${chatRoomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_room_id=eq.${chatRoomId}`,
          },
          (payload) => {
            console.log('🔔 New message INSERT received:', payload.new)
            onNewMessage(payload.new, 'INSERT')
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_room_id=eq.${chatRoomId}`,
          },
          (payload) => {
            console.log('📝 Message UPDATE received (read status):', payload.new)
            onNewMessage(payload.new, 'UPDATE')
          }
        )
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync')
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences)
        })
        .subscribe((status) => {
          console.log(`📡 Subscription status for chat room ${chatRoomId}:`, status)
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Successfully subscribed to chat room: ${chatRoomId}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel error for chat room:', chatRoomId)
            onError?.(new Error('リアルタイム接続でエラーが発生しました'))
          } else if (status === 'CLOSED') {
            console.log(`🔒 Channel closed for chat room: ${chatRoomId}`)
          }
        })

      return subscription
    } catch (error) {
      console.error('メッセージ購読エラー:', error)
      onError?.(error)
      return null
    }
  }

  // チャットルーム購読の解除
  static unsubscribeFromMessages(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
      console.log('Unsubscribed from chat messages')
    }
  }

  // オンラインプレゼンス管理
  static async joinChatRoom(chatRoomId: string, userProfile: { id: string; display_name: string }) {
    try {
      const channel = supabase.channel(`chat_room:${chatRoomId}`)
      
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // プレゼンス情報を送信
          await channel.track({
            user_id: userProfile.id,
            display_name: userProfile.display_name,
            online_at: new Date().toISOString(),
          })
        }
      })

      return channel
    } catch (error) {
      console.error('チャットルーム参加エラー:', error)
      return null
    }
  }

  static async leaveChatRoom(channel: any) {
    if (channel) {
      await channel.untrack()
      supabase.removeChannel(channel)
      console.log('Left chat room')
    }
  }
}