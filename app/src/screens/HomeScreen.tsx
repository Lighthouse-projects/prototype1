import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { CardSwiper } from '../components/CardSwiper'
import { MatchingService, ProfileWithLike } from '../services/matchingService'
import { supabase } from '../lib/supabase'

interface Props {
  navigation: any
}


export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user } = useAuth()
  const [profiles, setProfiles] = useState<ProfileWithLike[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendedProfiles()
  }, [])

  const loadRecommendedProfiles = async () => {
    try {
      setLoading(true)
      const recommendedProfiles = await MatchingService.getRecommendedProfiles(10)
      setProfiles(recommendedProfiles)
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'プロフィールの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  const handleSwipeRight = (profile: ProfileWithLike) => {
    // いいねの処理は CardSwiper 内部で実行
  }

  const handleSwipeLeft = (profile: ProfileWithLike) => {
    // パスの処理
  }

  const handleSwipeTop = (profile: ProfileWithLike) => {
    // スーパーいいねの処理は CardSwiper 内部で実行
  }

  const handleMatchFound = (profile: ProfileWithLike) => {
    // マッチ一覧画面への遷移
    navigation.navigate('Matches')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>出会いを探す</Text>
      </View>

      <View style={styles.swiperContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
          </View>
        ) : (
          <CardSwiper
            profiles={profiles}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeTop={handleSwipeTop}
            onMatchFound={handleMatchFound}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  swiperContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})