import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  navigation: any
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ホーム画面</Text>
      <Text style={styles.subtitle}>
        プロフィール作成が完了しました！
      </Text>
      
      <Text style={styles.userInfo}>
        ログイン中: {user?.email}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ProfileView')}
        >
          <Text style={styles.buttonText}>プロフィールを見る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            サインアウト
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        ※ この画面は仮実装です。{'\n'}
        次のPhaseでマッチング機能を実装予定です。
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  userInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
  },
})