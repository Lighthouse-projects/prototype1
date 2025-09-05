import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { MatchingService, MatchData } from '../services/matchingService'
import { supabase } from '../lib/supabase'

const { width } = Dimensions.get('window')

interface MatchWithProfile extends MatchData {
  partnerProfile: {
    id: string
    display_name: string
    age: number
    prefecture: string
    main_image_url?: string
  }
}

interface Props {
  navigation: any
}

export const MatchListScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadMatches = async () => {
    try {
      const matchesWithProfiles = await MatchingService.getMatchesWithProfiles()
      setMatches(matchesWithProfiles)
    } catch (error: any) {
      console.error('マッチ取得エラー:', error)
      Alert.alert('エラー', 'マッチ情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMatches()
    setRefreshing(false)
  }

  const handleUnmatch = async (match: MatchWithProfile) => {
    Alert.alert(
      'マッチ解除の確認',
      `${match.partnerProfile.display_name}さんとのマッチを解除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'マッチ解除',
          style: 'destructive',
          onPress: async () => {
            try {
              await MatchingService.unmatch(match.id)
              await loadMatches() // リスト更新
              Alert.alert('完了', 'マッチを解除しました')
            } catch (error: any) {
              Alert.alert('エラー', error.message)
            }
          }
        }
      ]
    )
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今日'
    } else if (diffDays === 1) {
      return '昨日'
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMatches()
    }, [])
  )

  const renderMatchItem = ({ item }: { item: MatchWithProfile }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => {
        navigation.navigate('PartnerProfile', {
          partnerId: item.partnerProfile.id,
          partnerName: item.partnerProfile.display_name
        })
      }}
    >
      <View style={styles.matchContent}>
        {/* プロフィール画像 */}
        <View style={styles.imageContainer}>
          {item.partnerProfile.main_image_url ? (
            <Image
              source={{ uri: item.partnerProfile.main_image_url }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>写真なし</Text>
            </View>
          )}
        </View>

        {/* プロフィール情報 */}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>
            {item.partnerProfile.display_name}, {item.partnerProfile.age}
          </Text>
          <Text style={styles.prefecture}>{item.partnerProfile.prefecture}</Text>
          <Text style={styles.matchDate}>
            {formatMatchDate(item.matched_at)}にマッチ
          </Text>
          {item.last_message_at && (
            <Text style={styles.lastMessage}>
              最後のメッセージ: {formatMatchDate(item.last_message_at)}
            </Text>
          )}
        </View>

        {/* アクションボタン */}
        <TouchableOpacity
          style={styles.unmatchButton}
          onPress={(e) => {
            e.stopPropagation()
            handleUnmatch(item)
          }}
        >
          <Text style={styles.unmatchButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.matchIndicator}>
        <Text style={styles.matchIndicatorText}>💕</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>マッチング一覧</Text>
      
      {matches.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            まだマッチがありません
          </Text>
          <Text style={styles.emptySubText}>
            スワイプ画面でいいね！を送ってマッチを探しましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  noImageContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  prefecture: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  matchDate: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  unmatchButton: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 12.5,
  },
  unmatchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  matchIndicatorText: {
    fontSize: 16,
  },
})