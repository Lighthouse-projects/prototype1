import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native'

interface Props {
  navigation: any
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [agreesToTerms, setAgreesToTerms] = useState(false)

  const handleContinue = () => {
    if (!agreesToTerms) {
      Alert.alert(
        'エラー',
        '利用規約とプライバシーポリシーに同意していただく必要があります。'
      )
      return
    }
    navigation.navigate('SignUp')
  }

  const handleSignIn = () => {
    navigation.navigate('Login')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>prototype1へようこそ</Text>
      
      <Text style={styles.description}>
        格安料金で素敵な出会いを見つけましょう。{'\n'}
        安心・安全なマッチングサービスです。
      </Text>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>アプリの特徴</Text>
        <Text style={styles.featureItem}>• 格安な利用料金</Text>
        <Text style={styles.featureItem}>• 本人確認による安全性</Text>
        <Text style={styles.featureItem}>• シンプルで使いやすい</Text>
      </View>

      <View style={styles.termsContainer}>
        <View style={styles.termsRow}>
          <Switch
            value={agreesToTerms}
            onValueChange={setAgreesToTerms}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={agreesToTerms ? '#ffffff' : '#f4f3f4'}
          />
          <Text style={styles.termsText}>
            利用規約とプライバシーポリシーに同意する
          </Text>
        </View>
        <Text style={styles.termsNote}>
          ※ 18歳未満の方はご利用いただけません
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: agreesToTerms ? '#007AFF' : '#cccccc' }
        ]}
        onPress={handleContinue}
        disabled={!agreesToTerms}
      >
        <Text style={styles.continueButtonText}>アカウントを作成</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>
          既にアカウントをお持ちの方はこちら
        </Text>
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
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  termsNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  continueButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signInButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})