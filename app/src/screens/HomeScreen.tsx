import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { CardSwiper } from '../components/CardSwiper'
import { mockProfiles } from '../data/mockProfiles'

interface Props {
  navigation: any
}

interface Profile {
  id: string
  name: string
  age: number
  location: string
  occupation?: string
  images: string[]
  bio?: string
  // 新規追加項目
  nickname?: string
  height?: number
  body_type?: 'slim' | 'normal' | 'chubby' | 'overweight'
  meeting_purpose?: 'chat' | 'friend' | 'relationship' | 'marriage'
  hometown_prefecture?: string
  drinking?: 'never' | 'sometimes' | 'often'
  smoking?: 'never' | 'sometimes' | 'often' | 'quit_for_partner'
  free_days?: 'irregular' | 'weekends' | 'weekdays'
  meeting_frequency?: 'monthly' | 'twice_monthly' | 'weekly' | 'multiple_weekly' | 'frequent'
  future_dreams?: string
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user } = useAuth()
  const [profiles] = useState<Profile[]>(mockProfiles)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  const handleSwipeRight = (profile: Profile) => {
    console.log(`${profile.name}にいいねしました`)
  }

  const handleSwipeLeft = (profile: Profile) => {
    console.log(`${profile.name}をパスしました`)
  }

  const handleSwipeTop = (profile: Profile) => {
    console.log(`${profile.name}にスーパーいいねしました`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>出会いを探す</Text>
      </View>

      <View style={styles.swiperContainer}>
        <CardSwiper
          profiles={profiles}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onSwipeTop={handleSwipeTop}
        />
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
})