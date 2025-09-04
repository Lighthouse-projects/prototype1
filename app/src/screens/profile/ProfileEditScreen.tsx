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
import { ProfileFormData, Prefecture, Profile } from '../../types/profile'

interface Props {
  navigation: any
}

export const ProfileEditScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user?.id) {
      Alert.alert('エラー', 'ユーザー情報が取得できません')
      navigation.goBack()
      return
    }

    try {
      setLoading(true)
      
      // プロフィールと都道府県データを並行取得
      const [profileData, prefectureData] = await Promise.all([
        profileService.getProfile(user.id),
        profileService.getPrefectures()
      ])

      setPrefectures(prefectureData)

      if (profileData) {
        // プロフィールデータをフォーム用に変換
        setFormData({
          display_name: profileData.display_name,
          age: profileData.age.toString(),
          gender: profileData.gender,
          prefecture: profileData.prefecture,
          city: profileData.city || '',
          occupation: profileData.occupation || '',
          bio: profileData.bio || '',
          preferred_min_age: profileData.preferred_min_age?.toString() || '',
          preferred_max_age: profileData.preferred_max_age?.toString() || '',
          preferred_prefecture: profileData.preferred_prefecture || '',
        })
      } else {
        Alert.alert('エラー', 'プロフィールが見つかりません')
        navigation.goBack()
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
      Alert.alert('エラー', 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

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

    // 希望年齢の範囲チェック
    if (formData.preferred_min_age) {
      const minAge = parseInt(formData.preferred_min_age)
      if (minAge < 18 || minAge > 99) {
        Alert.alert('エラー', '希望年齢は18歳以上99歳以下で選択してください。')
        return false
      }
    }

    if (formData.preferred_max_age) {
      const maxAge = parseInt(formData.preferred_max_age)
      if (maxAge < 18 || maxAge > 99) {
        Alert.alert('エラー', '希望年齢は18歳以上99歳以下で選択してください。')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)
      await profileService.updateProfile(formData)
      
      Alert.alert(
        'プロフィール更新完了',
        'プロフィールが正常に更新されました。',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      Alert.alert('エラー', error.message || 'プロフィールの更新に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>プロフィールを編集</Text>
        <Text style={styles.subtitle}>
          情報を更新してください
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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.preferred_min_age}
                onValueChange={(value) => updateFormData('preferred_min_age', value)}
                style={styles.picker}
              >
                <Picker.Item label="指定なし" value="" />
                {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                  <Picker.Item key={age} label={`${age}歳`} value={age.toString()} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>希望年齢（最大）</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.preferred_max_age}
                onValueChange={(value) => updateFormData('preferred_max_age', value)}
                style={styles.picker}
              >
                <Picker.Item label="指定なし" value="" />
                {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                  <Picker.Item key={age} label={`${age}歳`} value={age.toString()} />
                ))}
              </Picker>
            </View>
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

        {/* 更新ボタン */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            { backgroundColor: saving ? '#cccccc' : '#007AFF' }
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>プロフィールを更新</Text>
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
    minHeight: 50,
    maxHeight: 70,
    justifyContent: 'center',
    
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? -10 : 55,
    color: '#333',
    ...Platform.select({
      android: {
        marginVertical: -8,
      },
    }),
  },
  row: {
    flexDirection: 'row',
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  updateButtonText: {
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