import React, { useState, useEffect } from 'react'
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
  ActivityIndicator,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useAuth } from '../../contexts/AuthContext'
import { profileService } from '../../services/profileService'
import { ProfileFormData, Prefecture } from '../../types/profile'

interface Props {
  navigation: any
}

export const ProfileCreationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: '',
    age: '',
    gender: '',
    prefecture: '',
    city: '',
    occupation: '',
    bio: '',
    preferred_min_age: '',
    preferred_max_age: '',
    preferred_prefecture: '',
  })

  // 都道府県データを取得
  useEffect(() => {
    const loadPrefectures = async () => {
      try {
        const data = await profileService.getPrefectures()
        setPrefectures(data)
      } catch (error) {
        console.error('都道府県データ取得エラー:', error)
      }
    }
    loadPrefectures()
  }, [])

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.display_name.trim()) {
      Alert.alert('エラー', '表示名を入力してください。')
      return false
    }

    if (formData.display_name.length > 50) {
      Alert.alert('エラー', '表示名は50文字以内で入力してください。')
      return false
    }

    const age = parseInt(formData.age)
    if (!age || age < 18 || age > 99) {
      Alert.alert('エラー', '年齢は18歳以上99歳以下で入力してください。')
      return false
    }

    if (!formData.gender) {
      Alert.alert('エラー', '性別を選択してください。')
      return false
    }

    if (!formData.prefecture) {
      Alert.alert('エラー', '都道府県を選択してください。')
      return false
    }

    // 希望年齢の整合性チェック
    if (formData.preferred_min_age && formData.preferred_max_age) {
      const minAge = parseInt(formData.preferred_min_age)
      const maxAge = parseInt(formData.preferred_max_age)
      if (minAge > maxAge) {
        Alert.alert('エラー', '希望年齢の最小値が最大値を上回っています。')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await profileService.createProfile(formData)
      
      Alert.alert(
        'プロフィール作成完了',
        'プロフィールが正常に作成されました。',
        [{ text: 'OK', onPress: () => navigation.replace('Home') }]
      )
    } catch (error: any) {
      console.error('プロフィール作成エラー:', error)
      Alert.alert('エラー', error.message || 'プロフィールの作成に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>プロフィールを作成</Text>
        <Text style={styles.subtitle}>
          あなたの基本情報を入力してください
        </Text>

        {/* 表示名 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>表示名 *</Text>
          <TextInput
            style={styles.input}
            value={formData.display_name}
            onChangeText={(value) => updateFormData('display_name', value)}
            placeholder="例：太郎"
            maxLength={50}
          />
        </View>

        {/* 年齢 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>年齢 *</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(value) => updateFormData('age', value)}
            placeholder="例：28"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* 性別 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>性別 *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => updateFormData('gender', value)}
              style={styles.picker}
            >
              <Picker.Item label="選択してください" value="" />
              <Picker.Item label="男性" value="male" />
              <Picker.Item label="女性" value="female" />
              <Picker.Item label="その他" value="other" />
            </Picker>
          </View>
        </View>

        {/* 都道府県 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>都道府県 *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.prefecture}
              onValueChange={(value) => updateFormData('prefecture', value)}
              style={styles.picker}
            >
              <Picker.Item label="選択してください" value="" />
              {prefectures.map(pref => (
                <Picker.Item key={pref.code} label={pref.name} value={pref.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* 市区町村 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>市区町村</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(value) => updateFormData('city', value)}
            placeholder="例：渋谷区"
          />
        </View>

        {/* 職業 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>職業</Text>
          <TextInput
            style={styles.input}
            value={formData.occupation}
            onChangeText={(value) => updateFormData('occupation', value)}
            placeholder="例：会社員"
          />
        </View>

        {/* 自己紹介 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>自己紹介</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(value) => updateFormData('bio', value)}
            placeholder="あなたの魅力を自由に書いてください..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 希望年齢 */}
        <Text style={styles.sectionTitle}>お相手の希望条件</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>希望年齢（最小）</Text>
            <TextInput
              style={styles.input}
              value={formData.preferred_min_age}
              onChangeText={(value) => updateFormData('preferred_min_age', value)}
              placeholder="18"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>希望年齢（最大）</Text>
            <TextInput
              style={styles.input}
              value={formData.preferred_max_age}
              onChangeText={(value) => updateFormData('preferred_max_age', value)}
              placeholder="99"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        {/* 希望地域 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>希望地域</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.preferred_prefecture}
              onValueChange={(value) => updateFormData('preferred_prefecture', value)}
              style={styles.picker}
            >
              <Picker.Item label="指定なし" value="" />
              {prefectures.map(pref => (
                <Picker.Item key={pref.code} label={pref.name} value={pref.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* 作成ボタン */}
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: loading ? '#cccccc' : '#007AFF' }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>プロフィールを作成</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.requiredNote}>* は必須項目です</Text>
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
    paddingTop: 20,
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  createButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
})