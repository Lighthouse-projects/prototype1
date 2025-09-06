import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { CardSwiper } from '../components/CardSwiper'
import { MatchingService, ProfileWithLike, SearchFilters as ServiceSearchFilters } from '../services/matchingService'
import { supabase } from '../lib/supabase'

interface Props {
  navigation: any
}

type TabType = 'recommend' | 'search'

interface SearchFilters {
  ageMin: string
  ageMax: string
  prefecture: string
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('recommend')
  const [profiles, setProfiles] = useState<ProfileWithLike[]>([])
  const [searchProfiles, setSearchProfiles] = useState<ProfileWithLike[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    ageMin: '',
    ageMax: '',
    prefecture: ''
  })

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

  const handleSearch = async () => {
    try {
      setSearchLoading(true)
      // 検索フィルタを使用してプロフィールを検索
      const filters: ServiceSearchFilters = {
        ageMin: searchFilters.ageMin ? parseInt(searchFilters.ageMin) : undefined,
        ageMax: searchFilters.ageMax ? parseInt(searchFilters.ageMax) : undefined,
        prefecture: searchFilters.prefecture || undefined
      }
      const searchResults = await MatchingService.searchProfiles(filters)
      setSearchProfiles(searchResults)
    } catch (error: any) {
      Alert.alert('エラー', error.message || '検索に失敗しました')
    } finally {
      setSearchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchFilters({
      ageMin: '',
      ageMax: '',
      prefecture: ''
    })
    setSearchProfiles([])
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

  const renderTabContent = () => {
    if (activeTab === 'recommend') {
      return (
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
      )
    } else {
      return (
        <ScrollView style={styles.searchContainer}>
          <View style={styles.searchFilters}>
            <Text style={styles.filterTitle}>検索条件</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>年齢</Text>
              <View style={styles.ageInputContainer}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="最小"
                  value={searchFilters.ageMin}
                  onChangeText={(text) => setSearchFilters(prev => ({ ...prev, ageMin: text }))}
                  keyboardType="numeric"
                />
                <Text style={styles.ageSeparator}>〜</Text>
                <TextInput
                  style={styles.ageInput}
                  placeholder="最大"
                  value={searchFilters.ageMax}
                  onChangeText={(text) => setSearchFilters(prev => ({ ...prev, ageMax: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>都道府県</Text>
              <TextInput
                style={styles.textInput}
                placeholder="例: 東京都"
                value={searchFilters.prefecture}
                onChangeText={(text) => setSearchFilters(prev => ({ ...prev, prefecture: text }))}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>検索</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                <Text style={styles.clearButtonText}>クリア</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchResults}>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.loadingText}>検索中...</Text>
              </View>
            ) : searchProfiles.length > 0 ? (
              <CardSwiper
                profiles={searchProfiles}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
                onSwipeTop={handleSwipeTop}
                onMatchFound={handleMatchFound}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {searchFilters.ageMin || searchFilters.ageMax || searchFilters.prefecture
                    ? '検索条件に該当するプロフィールが見つかりませんでした'
                    : '検索条件を入力して検索してください'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>出会いを探す</Text>
      </View>

      {/* タブナビゲーション */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommend' && styles.activeTab]}
          onPress={() => setActiveTab('recommend')}
        >
          <Text style={[styles.tabText, activeTab === 'recommend' && styles.activeTabText]}>
            おすすめ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            検索
          </Text>
        </TouchableOpacity>
      </View>

      {/* タブコンテンツ */}
      {renderTabContent()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  swiperContainer: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
  },
  searchFilters: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  ageSeparator: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResults: {
    flex: 1,
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})