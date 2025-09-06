import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Props {
  navigation: any
}

interface Profile {
  id: string
  display_name: string
}

export const MyPageScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      if (!user) return
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>マイページ</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.userInfo}>
          {loading ? (
            <ActivityIndicator size="small" color="#4ECDC4" />
          ) : (
            <>
              {profile && (
                <Text style={styles.userName}>{profile.display_name}</Text>
              )}
              <Text style={styles.userEmail}>{user?.email}</Text>
            </>
          )}
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ProfileView')}
          >
            <Text style={styles.menuText}>👤 プロフィール表示</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Text style={styles.menuText}>✏️ プロフィール編集</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔔 通知設定</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔒 プライバシー設定</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>❓ ヘルプ・FAQ</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>📞 お問い合わせ</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.menuItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <Text style={[styles.menuText, styles.signOutText]}>🚪 ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ff4444',
    fontWeight: '500',
  },
})