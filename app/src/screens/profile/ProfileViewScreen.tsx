import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useAuth } from '../../contexts/AuthContext'
import { profileService } from '../../services/profileService'
import { 
  Profile,
  MEETING_PURPOSE_OPTIONS,
  BODY_TYPE_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  FREE_DAYS_OPTIONS,
  MEETING_FREQUENCY_OPTIONS
} from '../../types/profile'

interface Props {
  navigation: any
}

const VideoPlayer: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, player => {
    player.loop = true
  })

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>動画</Text>
      <VideoView
        player={player}
        style={styles.videoPlayer}
        allowsFullscreen
        nativeControls
        contentFit="contain"
      />
    </View>
  )
}

export const ProfileViewScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user?.id) {
      Alert.alert('エラー', 'ユーザー情報が取得できません')
      navigation.goBack()
      return
    }

    try {
      setLoading(true)
      const profileData = await profileService.getProfile(user.id)
      if (profileData) {
        setProfile(profileData)
      } else {
        Alert.alert('エラー', 'プロフィールが見つかりません')
        navigation.goBack()
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      Alert.alert('エラー', 'プロフィールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '男性'
      case 'female': return '女性'
      case 'other': return 'その他'
      default: return '未設定'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // 新規追加項目用のヘルパー関数
  const getOptionLabel = (value: string | undefined, options: readonly { value: string; label: string }[]) => {
    if (!value) return '未設定'
    const option = options.find(opt => opt.value === value)
    return option?.label || '未設定'
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>プロフィールが見つかりません</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* メイン画像 */}
      {profile.main_image_url && (
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: profile.main_image_url }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* ヘッダー情報 */}
      <View style={styles.header}>
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.basicInfo}>
          {profile.age}歳 • {getGenderText(profile.gender)} • {profile.prefecture}
        </Text>
        {profile.city && (
          <Text style={styles.location}>{profile.city}</Text>
        )}
      </View>

      {/* 追加画像 */}
      {profile.additional_images && profile.additional_images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他の写真</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.additionalImagesContainer}>
              {profile.additional_images.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.additionalImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 動画 */}
      {profile.video_url && (
        <VideoPlayer videoUrl={profile.video_url} />
      )}

      {/* プロフィール完成度 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール完成度</Text>
        <View style={styles.completionBar}>
          <View 
            style={[
              styles.completionFill, 
              { width: `${profile.profile_completion_rate}%` }
            ]} 
          />
        </View>
        <Text style={styles.completionText}>{profile.profile_completion_rate}%</Text>
      </View>

      {/* 基本情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本情報</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>職業</Text>
          <Text style={styles.value}>{profile.occupation || '未設定'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>居住地</Text>
          <Text style={styles.value}>
            {profile.prefecture}{profile.city ? `・${profile.city}` : ''}
          </Text>
        </View>
      </View>

      {/* === 詳細プロフィール === */}
      {(profile.meeting_purpose || profile.nickname || profile.height || profile.body_type) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>詳細プロフィール</Text>
          
          {profile.meeting_purpose && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>出会いの目的</Text>
              <Text style={styles.value}>{getOptionLabel(profile.meeting_purpose, MEETING_PURPOSE_OPTIONS)}</Text>
            </View>
          )}

          {profile.nickname && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>ニックネーム</Text>
              <Text style={styles.value}>{profile.nickname}</Text>
            </View>
          )}

          {profile.height && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>身長</Text>
              <Text style={styles.value}>{profile.height}cm</Text>
            </View>
          )}

          {profile.body_type && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>体型</Text>
              <Text style={styles.value}>{getOptionLabel(profile.body_type, BODY_TYPE_OPTIONS)}</Text>
            </View>
          )}
        </View>
      )}

      {/* === ライフスタイル === */}
      {(profile.hometown_prefecture || profile.drinking || profile.smoking || profile.free_days) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ライフスタイル</Text>
          
          {profile.hometown_prefecture && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>出身地</Text>
              <Text style={styles.value}>{profile.hometown_prefecture}</Text>
            </View>
          )}

          {profile.drinking && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>飲酒</Text>
              <Text style={styles.value}>{getOptionLabel(profile.drinking, DRINKING_OPTIONS)}</Text>
            </View>
          )}

          {profile.smoking && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>喫煙</Text>
              <Text style={styles.value}>{getOptionLabel(profile.smoking, SMOKING_OPTIONS)}</Text>
            </View>
          )}

          {profile.free_days && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>休日</Text>
              <Text style={styles.value}>{getOptionLabel(profile.free_days, FREE_DAYS_OPTIONS)}</Text>
            </View>
          )}
        </View>
      )}

      {/* === 将来について === */}
      {(profile.meeting_frequency || profile.future_dreams) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>将来について</Text>
          
          {profile.meeting_frequency && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>理想的な会う頻度</Text>
              <Text style={styles.value}>{getOptionLabel(profile.meeting_frequency, MEETING_FREQUENCY_OPTIONS)}</Text>
            </View>
          )}

          {profile.future_dreams && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>将来の夢</Text>
              <Text style={styles.value}>{profile.future_dreams}</Text>
            </View>
          )}
        </View>
      )}

      {/* 自己紹介 */}
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自己紹介</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* 希望条件 */}
      {(profile.preferred_min_age || profile.preferred_max_age || profile.preferred_prefecture) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>希望条件</Text>
          
          {(profile.preferred_min_age || profile.preferred_max_age) && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>希望年齢</Text>
              <Text style={styles.value}>
                {profile.preferred_min_age || '下限なし'}歳 ～ {profile.preferred_max_age || '上限なし'}歳
              </Text>
            </View>
          )}

          {profile.preferred_prefecture && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>希望地域</Text>
              <Text style={styles.value}>{profile.preferred_prefecture}</Text>
            </View>
          )}
        </View>
      )}

      {/* アカウント情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント情報</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>登録日</Text>
          <Text style={styles.value}>{formatDate(profile.created_at)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>最終更新</Text>
          <Text style={styles.value}>{formatDate(profile.updated_at)}</Text>
        </View>
      </View>

      {/* 編集ボタン */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <Text style={styles.editButtonText}>プロフィールを編集</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  basicInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  completionBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mainImageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  additionalImagesContainer: {
    flexDirection: 'row',
  },
  additionalImage: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 8,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#000',
  },
})