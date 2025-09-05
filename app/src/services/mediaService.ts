import * as ImagePicker from 'expo-image-picker'
import { Platform, Linking, Alert } from 'react-native'
import { supabase } from '../lib/supabase'

export interface MediaPickerResult {
  uri: string
  type: 'image' | 'video'
  fileName: string
}

export const mediaService = {
  // スマホの設定画面を開く
  openAppSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  },

  // 権限エラー時のアラートと設定画面遷移
  showPermissionAlert(): void {
    Alert.alert(
      '権限が必要です',
      'この機能を使用するには、写真へのアクセス権限が必要です。設定画面でアプリの権限を有効にしてください。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '設定を開く', 
          onPress: () => this.openAppSettings() 
        }
      ]
    )
  },

  // カメラ・ギャラリー権限の確認と要求
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    return status === 'granted'
  },

  // 画像選択
  async pickImage(): Promise<MediaPickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        this.showPermissionAlert()
        throw new Error('メディアライブラリへのアクセス権限が必要です')
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        
        return {
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `image_${Date.now()}.jpg`
        }
      }

      return null
    } catch (error) {
      console.error('画像選択エラー:', error)
      throw error
    }
  },

  // 動画選択
  async pickVideo(): Promise<MediaPickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        this.showPermissionAlert()
        throw new Error('メディアライブラリへのアクセス権限が必要です')
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Videos',
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
        base64: false,
        exif: false,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        
        return {
          uri: asset.uri,
          type: 'video',
          fileName: asset.fileName || `video_${Date.now()}.mp4`
        }
      }

      return null
    } catch (error) {
      console.error('動画選択エラー:', error)
      throw error
    }
  },

  // Supabase Storageにファイルをアップロード
  async uploadFile(
    file: MediaPickerResult, 
    userId: string, 
    folder: 'images' | 'videos'
  ): Promise<string | null> {
    try {
      
      const fileExt = file.fileName.split('.').pop()?.toLowerCase() || (file.type === 'image' ? 'jpg' : 'mp4')
      // より一意性の高いファイル名を生成
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const fileName = `${userId}/${folder}/${timestamp}_${random}.${fileExt}`
      
      // React NativeでFormDataを正しく使用してアップロード
      const formData = new FormData()
      
      // React Nativeの場合、ファイルオブジェクトを正しい形式で追加
      formData.append('', {
        uri: file.uri,
        type: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: file.fileName,
      } as any)
      
      // Supabase Storage REST APIを直接呼び出し
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('認証セッションがありません')
      }
      
      
      const response = await fetch(
        `${supabase.supabaseUrl}/storage/v1/object/profile-media/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'x-upsert': 'true', // 重複の場合は上書き
            // Content-Typeは設定しない（FormDataが自動設定）
          },
          body: formData,
        }
      )
      
      
      if (!response.ok) {
        // 重複エラーの場合は再試行
        if (response.status === 400 || response.status === 409) {
          const errorText = await response.text()
          
          // より確実な一意性を持つファイル名で再試行
          const newRandom = Math.random().toString(36).substring(2, 15)
          const newFileName = `${userId}/${folder}/${timestamp}_${newRandom}.${fileExt}`
          
          const retryResponse = await fetch(
            `${supabase.supabaseUrl}/storage/v1/object/profile-media/${newFileName}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'x-upsert': 'true',
              },
              body: formData,
            }
          )
          
          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text()
            console.error('再試行も失敗:', retryErrorText)
            throw new Error(`アップロード失敗(再試行): ${retryResponse.status} - ${retryErrorText}`)
          }
          
          const retryResult = await retryResponse.json()
          
          // 新しいファイル名でパブリックURLを取得
          const { data: urlData } = supabase.storage
            .from('profile-media')
            .getPublicUrl(newFileName)

          return urlData.publicUrl
        } else {
          const errorText = await response.text()
          console.error('API エラー詳細:', errorText)
          throw new Error(`アップロード失敗: ${response.status} - ${errorText}`)
        }
      }
      
      const result = await response.json()
      
      // パブリックURLを取得
      const { data: urlData } = supabase.storage
        .from('profile-media')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('ファイルアップロード失敗:', error)
      throw error
    }
  },

  // メイン画像をアップロード
  async uploadMainImage(file: MediaPickerResult, userId: string): Promise<string> {
    const url = await this.uploadFile(file, userId, 'images')
    if (!url) {
      throw new Error('メイン画像のアップロードに失敗しました')
    }
    return url
  },

  // 追加画像をアップロード（複数枚対応）
  async uploadAdditionalImages(files: MediaPickerResult[], userId: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId, 'images'))
    const results = await Promise.all(uploadPromises)
    
    // null値を除外
    return results.filter((url): url is string => url !== null)
  },

  // 動画をアップロード
  async uploadVideo(file: MediaPickerResult, userId: string): Promise<string> {
    const url = await this.uploadFile(file, userId, 'videos')
    if (!url) {
      throw new Error('動画のアップロードに失敗しました')
    }
    return url
  },

  // ファイルを削除
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('profile-media')
        .remove([filePath])

      if (error) {
        console.error('ファイル削除エラー:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('ファイル削除失敗:', error)
      return false
    }
  }
}