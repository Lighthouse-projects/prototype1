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
  Image,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useAuth } from '../../contexts/AuthContext'
import { profileService } from '../../services/profileService'
import { mediaService, MediaPickerResult } from '../../services/mediaService'
import { 
  ProfileFormData, 
  Prefecture, 
  Profile,
  MEETING_PURPOSE_OPTIONS,
  BODY_TYPE_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  FREE_DAYS_OPTIONS,
  MEETING_FREQUENCY_OPTIONS
} from '../../types/profile'
import { HeightPicker } from '../../components/HeightPicker'
import { OptionPicker } from '../../components/OptionPicker'
import { validateProfile, ValidationError } from '../../services/validationService'

interface Props {
  navigation: any
}

export const ProfileEditScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [selectedMainImage, setSelectedMainImage] = useState<MediaPickerResult | null>(null)
  const [selectedAdditionalImages, setSelectedAdditionalImages] = useState<MediaPickerResult[]>([])
  const [selectedVideo, setSelectedVideo] = useState<MediaPickerResult | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  
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
    main_image_url: '',
    additional_images: [],
    video_url: '',
    
    // 新規追加項目（Phase 1 - 基本項目）
    meeting_purpose: '',
    nickname: '',
    height: '',
    body_type: '',
    
    // 新規追加項目（Phase 2 - 推奨項目）
    hometown_prefecture: '',
    drinking: '',
    smoking: '',
    free_days: '',
    
    // 新規追加項目（Phase 3 - 詳細項目）
    meeting_frequency: '',
    future_dreams: '',
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

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
        setCurrentProfile(profileData)
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
          main_image_url: profileData.main_image_url || '',
          additional_images: profileData.additional_images || [],
          video_url: profileData.video_url || '',
          
          // 新規追加項目（Phase 1 - 基本項目）
          meeting_purpose: profileData.meeting_purpose || '',
          nickname: profileData.nickname || '',
          height: profileData.height?.toString() || '',
          body_type: profileData.body_type || '',
          
          // 新規追加項目（Phase 2 - 推奨項目）
          hometown_prefecture: profileData.hometown_prefecture || '',
          drinking: profileData.drinking || '',
          smoking: profileData.smoking || '',
          free_days: profileData.free_days || '',
          
          // 新規追加項目（Phase 3 - 詳細項目）
          meeting_frequency: profileData.meeting_frequency || '',
          future_dreams: profileData.future_dreams || '',
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
    const errors = validateProfile(formData)
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      const firstError = errors[0]
      Alert.alert('エラー', firstError.message)
      return false
    }
    
    return true
  }

  const handleHeightChange = (height: number | undefined) => {
    setFormData(prev => ({
      ...prev,
      height: height ? height.toString() : ''
    }))
  }

  const getValidationError = (field: string): string | undefined => {
    const error = validationErrors.find(e => e.field === field)
    return error?.message
  }

  const handlePickMainImage = async () => {
    try {
      const result = await mediaService.pickImage()
      if (result) {
        setSelectedMainImage(result)
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '画像の選択に失敗しました。')
    }
  }

  const handlePickAdditionalImage = async () => {
    const currentCount = selectedAdditionalImages.length + (formData.additional_images?.length || 0)
    if (currentCount >= 5) {
      Alert.alert('制限', '追加画像は最大5枚まで選択できます。')
      return
    }

    try {
      const result = await mediaService.pickImage()
      if (result) {
        setSelectedAdditionalImages(prev => [...prev, result])
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '画像の選択に失敗しました。')
    }
  }

  const handlePickVideo = async () => {
    try {
      const result = await mediaService.pickVideo()
      if (result) {
        setSelectedVideo(result)
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '動画の選択に失敗しました。')
    }
  }

  const removeAdditionalImage = (index: number) => {
    setSelectedAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingAdditionalImage = (index: number) => {
    const updatedImages = [...(formData.additional_images || [])]
    updatedImages.splice(index, 1)
    updateFormData('additional_images', updatedImages)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が取得できません。')
      return
    }

    try {
      setSaving(true)
      setUploadingMedia(true)

      let updatedFormData = { ...formData }

      // 新しいメイン画像をアップロード
      if (selectedMainImage) {
        const mainImageUrl = await mediaService.uploadMainImage(selectedMainImage, user.id)
        updatedFormData.main_image_url = mainImageUrl
      }

      // 新しい追加画像をアップロード
      if (selectedAdditionalImages.length > 0) {
        const newAdditionalImageUrls = await mediaService.uploadAdditionalImages(selectedAdditionalImages, user.id)
        const existingImages = updatedFormData.additional_images || []
        updatedFormData.additional_images = [...existingImages, ...newAdditionalImageUrls]
      }

      // 新しい動画をアップロード
      if (selectedVideo) {
        const videoUrl = await mediaService.uploadVideo(selectedVideo, user.id)
        updatedFormData.video_url = videoUrl
      }

      setUploadingMedia(false)
      
      await profileService.updateProfile(updatedFormData)
      
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
      setUploadingMedia(false)
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

        {/* === 新規追加項目 Phase 1 === */}
        <Text style={styles.sectionHeader}>詳細プロフィール</Text>

        {/* 出会いの目的 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>出会いの目的</Text>
          <OptionPicker
            options={MEETING_PURPOSE_OPTIONS}
            value={formData.meeting_purpose}
            onValueChange={(value) => updateFormData('meeting_purpose', value || '')}
            placeholder="目的を選択してください"
            title="出会いの目的を選択"
            style={styles.picker}
          />
          {getValidationError('meeting_purpose') && (
            <Text style={styles.errorText}>{getValidationError('meeting_purpose')}</Text>
          )}
        </View>

        {/* ニックネーム */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            style={styles.input}
            value={formData.nickname}
            onChangeText={(value) => updateFormData('nickname', value)}
            placeholder="呼んでほしい名前"
            maxLength={30}
          />
          {getValidationError('nickname') && (
            <Text style={styles.errorText}>{getValidationError('nickname')}</Text>
          )}
        </View>

        {/* 身長 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>身長</Text>
          <HeightPicker
            value={formData.height ? parseInt(formData.height) : undefined}
            onValueChange={handleHeightChange}
            placeholder="身長を選択してください"
            style={styles.picker}
          />
          {getValidationError('height') && (
            <Text style={styles.errorText}>{getValidationError('height')}</Text>
          )}
        </View>

        {/* 体型 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>体型</Text>
          <OptionPicker
            options={BODY_TYPE_OPTIONS}
            value={formData.body_type}
            onValueChange={(value) => updateFormData('body_type', value || '')}
            placeholder="体型を選択してください"
            title="体型を選択"
            style={styles.picker}
          />
          {getValidationError('body_type') && (
            <Text style={styles.errorText}>{getValidationError('body_type')}</Text>
          )}
        </View>

        {/* === 新規追加項目 Phase 2 === */}
        <Text style={styles.sectionHeader}>ライフスタイル</Text>

        {/* 出身地 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>出身地</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.hometown_prefecture}
              onValueChange={(value) => updateFormData('hometown_prefecture', value)}
              style={styles.picker}
            >
              <Picker.Item label="選択してください" value="" />
              {prefectures.map(pref => (
                <Picker.Item key={`hometown_${pref.code}`} label={pref.name} value={pref.name} />
              ))}
            </Picker>
          </View>
          {getValidationError('hometown_prefecture') && (
            <Text style={styles.errorText}>{getValidationError('hometown_prefecture')}</Text>
          )}
        </View>

        {/* 飲酒 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>飲酒</Text>
          <OptionPicker
            options={DRINKING_OPTIONS}
            value={formData.drinking}
            onValueChange={(value) => updateFormData('drinking', value || '')}
            placeholder="飲酒について選択してください"
            title="飲酒について選択"
            style={styles.picker}
          />
          {getValidationError('drinking') && (
            <Text style={styles.errorText}>{getValidationError('drinking')}</Text>
          )}
        </View>

        {/* 喫煙 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>喫煙</Text>
          <OptionPicker
            options={SMOKING_OPTIONS}
            value={formData.smoking}
            onValueChange={(value) => updateFormData('smoking', value || '')}
            placeholder="喫煙について選択してください"
            title="喫煙について選択"
            style={styles.picker}
          />
          {getValidationError('smoking') && (
            <Text style={styles.errorText}>{getValidationError('smoking')}</Text>
          )}
        </View>

        {/* 休日 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>休日</Text>
          <OptionPicker
            options={FREE_DAYS_OPTIONS}
            value={formData.free_days}
            onValueChange={(value) => updateFormData('free_days', value || '')}
            placeholder="休日について選択してください"
            title="休日について選択"
            style={styles.picker}
          />
          {getValidationError('free_days') && (
            <Text style={styles.errorText}>{getValidationError('free_days')}</Text>
          )}
        </View>

        {/* === 新規追加項目 Phase 3 === */}
        <Text style={styles.sectionHeader}>将来について</Text>

        {/* 会う頻度 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>理想的な会う頻度</Text>
          <OptionPicker
            options={MEETING_FREQUENCY_OPTIONS}
            value={formData.meeting_frequency}
            onValueChange={(value) => updateFormData('meeting_frequency', value || '')}
            placeholder="会う頻度を選択してください"
            title="理想的な会う頻度を選択"
            style={styles.picker}
          />
          {getValidationError('meeting_frequency') && (
            <Text style={styles.errorText}>{getValidationError('meeting_frequency')}</Text>
          )}
        </View>

        {/* 将来の夢 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>将来の夢</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.future_dreams}
            onChangeText={(value) => updateFormData('future_dreams', value)}
            placeholder="あなたの将来の夢や目標を教えてください..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
          {getValidationError('future_dreams') && (
            <Text style={styles.errorText}>{getValidationError('future_dreams')}</Text>
          )}
        </View>

        {/* === 画像・動画セクション === */}
        <Text style={styles.sectionHeader}>写真・動画</Text>

        {/* メイン画像 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>メイン画像</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handlePickMainImage}>
            {selectedMainImage ? (
              <Image source={{ uri: selectedMainImage.uri }} style={styles.selectedImage} />
            ) : formData.main_image_url ? (
              <Image source={{ uri: formData.main_image_url }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>画像を選択</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.hintText}>タップして新しい画像に変更</Text>
        </View>

        {/* 追加画像 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>追加画像（最大5枚）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.additionalImagesContainer}>
              {/* 既存の追加画像 */}
              {formData.additional_images?.map((imageUrl, index) => (
                <View key={`existing-${index}`} style={styles.additionalImageItem}>
                  <Image source={{ uri: imageUrl }} style={styles.additionalImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeExistingAdditionalImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {/* 新しく選択した追加画像 */}
              {selectedAdditionalImages.map((image, index) => (
                <View key={`new-${index}`} style={styles.additionalImageItem}>
                  <Image source={{ uri: image.uri }} style={styles.additionalImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAdditionalImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {/* 追加ボタン */}
              {(selectedAdditionalImages.length + (formData.additional_images?.length || 0)) < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handlePickAdditionalImage}>
                  <Text style={styles.addImageButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        {/* 動画 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>動画（1本まで）</Text>
          <TouchableOpacity style={styles.videoButton} onPress={handlePickVideo}>
            {selectedVideo ? (
              <View style={styles.selectedVideo}>
                <Text style={styles.selectedVideoText}>新しい動画選択済み</Text>
                <Text style={styles.selectedVideoName}>{selectedVideo.fileName}</Text>
              </View>
            ) : formData.video_url ? (
              <View style={styles.selectedVideo}>
                <Text style={styles.selectedVideoText}>動画設定済み</Text>
                <Text style={styles.selectedVideoName}>タップして変更</Text>
              </View>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>動画を選択</Text>
              </View>
            )}
          </TouchableOpacity>
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
            { backgroundColor: (saving || uploadingMedia) ? '#cccccc' : '#007AFF' }
          ]}
          onPress={handleSubmit}
          disabled={saving || uploadingMedia}
        >
          {saving || uploadingMedia ? (
            <View style={styles.loadingContainer2}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText2}>
                {uploadingMedia ? 'メディアアップロード中...' : 'プロフィール更新中...'}
              </Text>
            </View>
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
  imageButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalImageItem: {
    position: 'relative',
    marginRight: 12,
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addImageButtonText: {
    fontSize: 24,
    color: '#999',
  },
  videoButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  selectedVideo: {
    alignItems: 'center',
  },
  selectedVideoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectedVideoName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  loadingContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText2: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
})