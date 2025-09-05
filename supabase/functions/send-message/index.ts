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

    const { match_id, content, message_type = 'text' } = await req.json()

    if (!match_id || !content) {
      throw new Error('マッチIDとメッセージ内容が必要です')
    }

    if (content.length > 1000) {
      throw new Error('メッセージが長すぎます（1000文字以内）')
    }

    console.log(`Sending message for match: ${match_id}`)

    // マッチの確認とアクセス権限チェック
    const { data: match, error: matchError } = await supabaseServiceRole
      .from('matches')
      .select('id, user1_id, user2_id, status')
      .eq('id', match_id)
      .single()

    if (matchError || !match) {
      throw new Error('マッチが見つかりません')
    }

    if (match.status !== 'matched') {
      throw new Error('このマッチではチャットできません')
    }

    if (match.user1_id !== user.user.id && match.user2_id !== user.user.id) {
      throw new Error('このチャットにアクセスする権限がありません')
    }

    // チャットルームの取得または作成
    const { data: chatRoomId, error: chatRoomError } = await supabaseServiceRole
      .rpc('create_or_get_chat_room', { p_match_id: match_id })

    if (chatRoomError || !chatRoomId) {
      console.error('Chat room creation error:', chatRoomError)
      throw new Error('チャットルームの作成に失敗しました')
    }

    console.log(`Using chat room: ${chatRoomId}`)

    // メッセージを挿入
    const { data: newMessage, error: messageError } = await supabaseServiceRole
      .from('messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: user.user.id,
        content: content,
        message_type: message_type,
        sent_at: new Date().toISOString()
      })
      .select(`
        id,
        content,
        message_type,
        sent_at,
        read_at,
        sender_id
      `)
      .single()

    if (messageError || !newMessage) {
      console.error('Message insertion error:', messageError)
      throw new Error('メッセージの送信に失敗しました')
    }

    // 送信者のプロフィール情報を取得
    const { data: senderProfile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('id, display_name, main_image_url')
      .eq('id', user.user.id)
      .single()

    if (profileError || !senderProfile) {
      console.error('Sender profile error:', profileError)
      throw new Error('送信者情報の取得に失敗しました')
    }

    // レスポンス用のメッセージオブジェクトを作成
    const messageWithSender: MessageWithSender = {
      id: newMessage.id,
      content: newMessage.content,
      message_type: newMessage.message_type,
      sent_at: newMessage.sent_at,
      read_at: newMessage.read_at,
      sender: {
        id: senderProfile.id,
        display_name: senderProfile.display_name,
        main_image_url: senderProfile.main_image_url
      },
      is_own_message: true
    }

    console.log(`Message sent successfully: ${newMessage.id}`)

    return new Response(
      JSON.stringify({ 
        message: messageWithSender,
        chat_room_id: chatRoomId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-message:', error)
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