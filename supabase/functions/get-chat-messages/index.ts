import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageWithSender {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: user, error: userError } = await supabaseServiceRole.auth.getUser(token)
    if (userError || !user) {
      throw new Error('認証に失敗しました')
    }

    const { chat_room_id, limit = 50, offset = 0 } = await req.json()

    if (!chat_room_id) {
      throw new Error('チャットルームIDが必要です')
    }

    console.log(`Getting messages for chat room: ${chat_room_id}, limit: ${limit}, offset: ${offset}`)

    // チャットルームのアクセス権限を確認
    const { data: chatRoom, error: chatRoomError } = await supabaseServiceRole
      .from('chat_rooms')
      .select(`
        id,
        match_id,
        matches!inner(
          id,
          user1_id,
          user2_id,
          status
        )
      `)
      .eq('id', chat_room_id)
      .single()

    if (chatRoomError || !chatRoom) {
      throw new Error('チャットルームが見つかりません')
    }

    const match = chatRoom.matches
    if (!match || match.status !== 'matched' ||
        (match.user1_id !== user.user.id && match.user2_id !== user.user.id)) {
      throw new Error('このチャットルームにアクセスする権限がありません')
    }

    // メッセージを取得
    const { data: messages, error: messagesError } = await supabaseServiceRole
      .from('messages')
      .select(`
        id,
        content,
        message_type,
        sent_at,
        read_at,
        sender_id,
        profiles!messages_sender_id_fkey(
          id,
          display_name,
          main_image_url
        )
      `)
      .eq('chat_room_id', chat_room_id)
      .eq('is_deleted', false)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Messages query error:', messagesError)
      throw new Error('メッセージの取得に失敗しました')
    }

    console.log(`Found ${messages?.length || 0} messages`)

    // メッセージを正しい形式に変換
    const messagesWithSender: MessageWithSender[] = (messages || []).map(message => ({
      id: message.id,
      content: message.content,
      message_type: message.message_type,
      sent_at: message.sent_at,
      read_at: message.read_at,
      sender: {
        id: message.profiles.id,
        display_name: message.profiles.display_name,
        main_image_url: message.profiles.main_image_url
      },
      is_own_message: message.sender_id === user.user.id
    })).reverse() // 時系列順に並び替え

    // 自分宛ての未読メッセージを既読にする
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.sender_id !== user.user.id && !msg.read_at)
        .map(msg => msg.id)

      if (unreadMessageIds.length > 0) {
        await supabaseServiceRole
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessageIds)
      }
    }

    // より多くのメッセージがあるかチェック
    const { data: nextMessages, error: nextError } = await supabaseServiceRole
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('chat_room_id', chat_room_id)
      .eq('is_deleted', false)
      .range(offset + limit, offset + limit)

    const hasMore = !nextError && (nextMessages?.length || 0) > 0

    return new Response(
      JSON.stringify({ 
        messages: messagesWithSender,
        has_more: hasMore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-chat-messages:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})