import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  navigation: any
}

export const PasswordResetScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()

  const validateForm = () => {
    if (!email) {
      Alert.alert('エラー', 'メールアドレスを入力してください。')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。')
      return false
    }

    return true
  }

  const handleResetPassword = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await resetPassword(email)
      setEmailSent(true)
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'パスワードリセットに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigation.goBack()
  }

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>メール送信完了</Text>
          
          <Text style={styles.description}>
            以下のメールアドレスにパスワードリセット用のリンクを送信しました。
          </Text>
          
          <Text style={styles.email}>{email}</Text>
          
          <Text style={styles.instructions}>
            メールに記載されているリンクをタップして、
            新しいパスワードを設定してください。
          </Text>

          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Text style={styles.backButtonText}>
              ログイン画面に戻る
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>パスワードリセット</Text>
        <Text style={styles.subtitle}>
          登録されているメールアドレスを入力してください
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="mail@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: loading ? '#cccccc' : '#007AFF' }
          ]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>
            {loading ? '送信中...' : 'リセットメールを送信'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleBackToLogin}>
          <Text style={styles.cancelButtonText}>
            キャンセル
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
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
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  resetButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
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