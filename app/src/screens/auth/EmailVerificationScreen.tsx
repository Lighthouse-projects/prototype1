import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  navigation: any
  route: {
    params: {
      email: string
    }
  }
}

export const EmailVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { signUp, user } = useAuth()
  const { email } = route.params

  // カウントダウンタイマー
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // ユーザーがログインしたらメイン画面へ（今回はログイン画面に戻る）
  useEffect(() => {
    if (user) {
      Alert.alert(
        '認証完了',
        'メールアドレスの認証が完了しました。',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      )
    }
  }, [user, navigation])

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      await signUp(email, '') // Supabaseでは再送信のため空パスワードでOK
      setCountdown(60) // 60秒間再送信を無効化
      Alert.alert('成功', '認証メールを再送信しました。')
    } catch (error: any) {
      Alert.alert('エラー', 'メールの再送信に失敗しました。')
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    navigation.navigate('Login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>メール認証</Text>
        
        <Text style={styles.description}>
          以下のメールアドレスに認証リンクを送信しました。
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          メールに記載されているリンクをタップして、
          アカウントの認証を完了してください。
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.resendButton,
              { 
                backgroundColor: (countdown > 0 || isResending) ? '#cccccc' : '#007AFF',
              }
            ]}
            onPress={handleResendEmail}
            disabled={countdown > 0 || isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.resendButtonText}>
                {countdown > 0 
                  ? `再送信まで ${countdown}秒` 
                  : 'メールを再送信'
                }
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Text style={styles.backButtonText}>
              ログイン画面に戻る
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  resendButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    lineHeight: 16,
  },
})