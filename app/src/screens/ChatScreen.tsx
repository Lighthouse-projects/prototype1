import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { Image } from 'expo-image'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path } from 'react-native-svg'
import { ChatService, MessageWithSender } from '../services/chatService'
import { SoundService } from '../services/soundService'

// LINEスタイルの吹き出しコンポーネント
const ChatBubble: React.FC<{
  children: React.ReactNode
  isOwn: boolean
  style?: any
}> = ({ children, isOwn, style }) => {
  return (
    <View style={[{ position: 'relative' }, style]}>
      <Svg
        width="100%"
        height="100%"
        style={{ position: 'absolute' }}
        viewBox={isOwn ? "0 0 100 100" : "-15 0 115 100"}
        preserveAspectRatio="none"
      >
        <Path
          d={isOwn 
            ? "M15,0 L90,0 Q100,0 100,15 L100,70 Q100,85 85,85 L90,90 L75,85 L15,85 Q0,85 0,70 L0,15 Q0,0 15,0"
            : "M15,0 L85,0 Q100,0 100,15 L100,70 Q100,85 85,85 L30,85 L15,90 L15,85 Q0,85 0,70 L0,15 Q0,0 15,0"
          }
          fill={isOwn ? "#007AFF" : "#ffffff"}
          stroke={isOwn ? "none" : "#e0e0e0"}
          strokeWidth={isOwn ? 0 : 1}
        />
      </Svg>
      <View style={{ 
        padding: 12, 
        paddingBottom: isOwn ? 16 : 16,
        paddingLeft: isOwn ? 12 : 16,
        paddingRight: isOwn ? 16 : 16,
        zIndex: 1 
      }}>
        {children}
      </View>
    </View>
  )
}

interface Props {
  navigation: any
  route: {
    params: {
      matchId: string
      chatRoomId?: string
      partnerName: string
      partnerImage?: string
    }
  }
}

export const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { matchId, chatRoomId: initialChatRoomId, partnerName, partnerImage } = route.params
  
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [inputText, setInputText] = useState('')
  const [chatRoomId, setChatRoomId] = useState<string | undefined>(initialChatRoomId)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isNearBottom, setIsNearBottom] = useState(true) // 最下部付近にいるかどうか
  const currentScrollPosition = useRef({ isNearBottom: true }) // リアルタイム更新用
  
  const flatListRef = useRef<FlatList>(null)
  const subscriptionRef = useRef<any>(null)
  const presenceChannelRef = useRef<any>(null)

  // スクロール位置を監視して最下部付近にいるかどうか判定
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const paddingToBottom = 50 // 最下部から50px以内なら「最下部付近」と判定
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y)
    const isAtBottom = distanceFromBottom <= paddingToBottom
    
    // 両方のstateとrefを更新
    setIsNearBottom(isAtBottom)
    currentScrollPosition.current.isNearBottom = isAtBottom
  }

  // メッセージ読み込み
  const loadMessages = useCallback(async (offset: number = 0, isLoadMore: boolean = false, skipAutoScroll: boolean = false) => {
    if (!chatRoomId) {
      setMessages([])
      setLoading(false)
      setHasMore(false)
      return
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true)
      }

      const { messages: newMessages, hasMore: moreAvailable } = await ChatService.getChatMessages(
        chatRoomId, 
        50, 
        offset
      )




      if (isLoadMore) {
        setMessages(prev => [...newMessages, ...prev])
      } else {
        setMessages(newMessages)
        
        // 初回ロード時（オフセット0）かつ最下部付近にいる場合のみスクロール
        if (offset === 0 && newMessages.length > 0 && (loading || isNearBottom) && !skipAutoScroll) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false })
          }, 100)
        }
      }
      
      setHasMore(moreAvailable)
    } catch (error: any) {
      console.error('メッセージ読み込みエラー:', error)
      Alert.alert('エラー', error.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [chatRoomId])

  // メッセージ送信
  const sendMessage = async () => {
    if (!inputText.trim() || sending) return

    const messageContent = inputText.trim()
    setInputText('')
    setSending(true)

    try {
      const response = await ChatService.sendMessage(matchId, messageContent)
      
      // 初回送信時にchatRoomIdを設定
      if (!chatRoomId) {
        setChatRoomId(response.chat_room_id)
      }

      // 送信したメッセージをローカルに追加
      setMessages(prev => [...prev, response.message])

      // 最下部にスクロール（送信後すぐに）
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error)
      Alert.alert('エラー', error.message)
      // 入力テキストを復元
      setInputText(messageContent)
    } finally {
      setSending(false)
    }
  }

  // リアルタイムメッセージ購読設定
  const setupRealtimeSubscription = useCallback(() => {
    if (!chatRoomId) {
      return
    }

    // 既存の購読を解除
    if (subscriptionRef.current) {
      ChatService.unsubscribeFromMessages(subscriptionRef.current)
    }

    // 新しい購読を開始
    subscriptionRef.current = ChatService.subscribeToMessages(
      chatRoomId,
      async (messagePayload, eventType) => {
        try {
          // INSERTイベント（新着メッセージ）かつ自分以外からのメッセージの場合のみ通知音を鳴らす
          if (eventType === 'INSERT' && currentUserId && messagePayload.sender_id && messagePayload.sender_id !== currentUserId) {
            SoundService.playMessageSound()
          }
          
          // リロード前のスクロール位置を保存
          const wasNearBottomBeforeReload = currentScrollPosition.current.isNearBottom
          
          await loadMessages(0, false, true)
          
          // 新着メッセージの場合で、かつ最下部付近にいる場合のみ自動スクロール
          if (eventType === 'INSERT' && wasNearBottomBeforeReload) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true })
            }, 300)
          }
        } catch (error) {
          console.error('❌ 新着メッセージ処理エラー:', error)
        }
      },
      (error) => {
        console.error('リアルタイム接続エラー:', error)
      }
    )
  }, [chatRoomId, loadMessages, currentUserId])

  // 過去のメッセージをさらに読み込み
  const loadMoreMessages = () => {
    if (!hasMore || loadingMore) return
    loadMessages(messages.length, true)
  }

  // 現在のユーザーIDを取得
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const { supabase } = await import('../lib/supabase')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
        }
      } catch (error) {
        console.error('ユーザーID取得エラー:', error)
      }
    }
    getCurrentUserId()
  }, [])

  // 初期化時にchatRoomIdを取得
  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!initialChatRoomId && matchId) {
        try {
          const roomId = await ChatService.getChatRoomByMatchId(matchId)
          if (roomId) {
            setChatRoomId(roomId)
          }
        } catch (error) {
          console.error('チャットルームID取得エラー:', error)
        }
      }
    }
    
    initializeChatRoom()
  }, [matchId, initialChatRoomId])

  // 画面フォーカス時の処理
  useFocusEffect(
    useCallback(() => {
      SoundService.initialize()
      loadMessages()
      
      if (chatRoomId) {
        setupRealtimeSubscription()
      }

      return () => {
        if (subscriptionRef.current) {
          ChatService.unsubscribeFromMessages(subscriptionRef.current)
        }
        if (presenceChannelRef.current) {
          ChatService.leaveChatRoom(presenceChannelRef.current)
        }
        SoundService.cleanup()
      }
    }, [chatRoomId, loadMessages, setupRealtimeSubscription])
  )

  // chatRoomIdが変更されたときの処理
  useEffect(() => {
    if (chatRoomId) {
      setupRealtimeSubscription()
    }
  }, [chatRoomId, setupRealtimeSubscription])

  // メッセージアイテムのレンダリング
  const renderMessage = ({ item }: { item: MessageWithSender }) => {
    const isOwnMessage = item.is_own_message

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.partnerMessage
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {item.sender.main_image_url ? (
              <Image
                source={{ uri: item.sender.main_image_url }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4' }}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="person" size={20} color="#999" />
              </View>
            )}
          </View>
        )}
        
        {isOwnMessage ? (
          <ChatBubble 
            isOwn={isOwnMessage}
            style={[
              styles.bubbleContainer,
              styles.ownBubbleContainer
            ]}
          >
            <Text style={[
              styles.messageText,
              styles.ownMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.messageTime,
              styles.ownMessageTime
            ]}>
              {new Date(item.sent_at).toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {item.read_at && (
                <Text style={styles.readStatus}> ✓✓</Text>
              )}
            </Text>
          </ChatBubble>
        ) : (
          <ChatBubble 
            isOwn={isOwnMessage}
            style={[
              styles.bubbleContainer,
              styles.partnerBubbleContainer
            ]}
          >
            <Text style={[
              styles.messageText,
              styles.partnerMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.messageTime,
              styles.partnerMessageTime
            ]}>
              {new Date(item.sent_at).toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </ChatBubble>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>チャットを読み込み中...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* メッセージリスト */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted={false}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          ListHeaderComponent={loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadMoreText}>過去のメッセージを読み込み中...</Text>
            </View>
          ) : null}
          showsVerticalScrollIndicator={false}
        />

        {/* メッセージ入力エリア */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="メッセージを入力..."
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  partnerMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleContainer: {
    maxWidth: '75%',
    minHeight: 40,
  },
  ownBubbleContainer: {
    alignSelf: 'flex-end',
  },
  partnerBubbleContainer: {
    alignSelf: 'flex-start',
  },
  partnerMessageBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  partnerMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  partnerMessageTime: {
    color: '#999',
  },
  readStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
})