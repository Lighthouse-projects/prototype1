import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

export const AppNavigator: React.FC = () => {
  const { user, hasProfile, loading } = useAuth()

  // 短時間ローディング表示（最大1秒）
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>prototype1</Text>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>起動中...</Text>
      </View>
    )
  }

  // 認証済みユーザーの処理
  if (user) {
    // プロフィール確認中の場合はローディング表示
    if (hasProfile === null) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>prototype1</Text>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>プロフィール確認中...</Text>
        </View>
      )
    }
    // プロフィールの有無に関わらずMainNavigatorで適切に制御
    return <MainNavigator />
  }

  // 未認証の場合は認証フロー
  return <AuthNavigator />
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})