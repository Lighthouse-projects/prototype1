import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatWithPartner {
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

    console.log(`Getting chat list for user: ${user.user.id}`)

    // ユーザーのマッチ一覧を取得
    const { data: matches, error: matchError } = await supabaseServiceRole
      .from('matches')
      .select('id, user1_id, user2_id, created_at')
      .eq('status', 'matched')
      .or(`user1_id.eq.${user.user.id},user2_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false })

    if (matchError) {
      console.error('Match query error:', matchError)
      throw new Error('マッチ情報の取得に失敗しました')
    }

    console.log(`Found ${matches?.length || 0} matches`)

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ chats: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatsWithPartners: ChatWithPartner[] = []

    for (const match of matches) {
      const partnerId = match.user1_id === user.user.id ? match.user2_id : match.user1_id

      // 相手のプロフィール情報を取得
      const { data: partnerProfile, error: profileError } = await supabaseServiceRole
        .from('profiles')
        .select('id, display_name, main_image_url')
        .eq('id', partnerId)
        .single()

      if (profileError || !partnerProfile) {
        console.error(`Partner profile error for ${partnerId}:`, profileError)
        continue
      }

      // チャットルーム情報を取得
      const { data: chatRoom, error: chatRoomError } = await supabaseServiceRole
        .from('chat_rooms')
        .select('id, last_message_id, last_message_at')
        .eq('match_id', match.id)
        .single()

      let chatRoomId = chatRoom?.id
      let lastMessage = null
      let lastMessageAt = null

      if (chatRoom) {
        // 最後のメッセージを取得
        if (chatRoom.last_message_id) {
          const { data: lastMsg, error: msgError } = await supabaseServiceRole
            .from('messages')
            .select('content')
            .eq('id', chatRoom.last_message_id)
            .single()

          if (!msgError && lastMsg) {
            lastMessage = lastMsg.content
            lastMessageAt = chatRoom.last_message_at
          }
        }
      }

      // 未読メッセージ数を計算
      let unreadCount = 0
      if (chatRoomId) {
        const { data: unreadMessages, error: unreadError } = await supabaseServiceRole
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('chat_room_id', chatRoomId)
          .neq('sender_id', user.user.id)
          .is('read_at', null)

        if (!unreadError) {
          unreadCount = unreadMessages?.length || 0
        }
      }

      chatsWithPartners.push({
        chat_room_id: chatRoomId || '',
        match_id: match.id,
        last_message: lastMessage,
        last_message_at: lastMessageAt,
        unread_count: unreadCount,
        partner: {
          id: partnerProfile.id,
          display_name: partnerProfile.display_name,
          main_image_url: partnerProfile.main_image_url
        }
      })
    }

    console.log(`Returning ${chatsWithPartners.length} chats`)

    return new Response(
      JSON.stringify({ chats: chatsWithPartners }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-chat-list:', error)
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