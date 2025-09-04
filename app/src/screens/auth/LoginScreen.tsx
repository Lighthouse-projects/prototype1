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
  ScrollView,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  navigation: any
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。')
      return false
    }

    return true
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await signIn(email, password)
      // ログイン成功後はAuthContextが自動的にユーザー状態を更新
    } catch (error: any) {
      let errorMessage = 'ログインに失敗しました。'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスの認証が完了していません。'
      }
      
      Alert.alert('エラー', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    navigation.navigate('SignUp')
  }

  const handleForgotPassword = () => {
    navigation.navigate('PasswordReset')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ログイン</Text>
        <Text style={styles.subtitle}>
          メールアドレスとパスワードを入力してください
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="パスワードを入力"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.signInButton,
            { backgroundColor: loading ? '#cccccc' : '#007AFF' }
          ]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
          <Text style={styles.forgotButtonText}>
            パスワードを忘れた方はこちら
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>
            新規アカウント作成
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 80,
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
  },
  form: {
    marginBottom: 24,
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
  signInButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  forgotButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
})