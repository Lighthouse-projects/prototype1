import { supabase } from '../lib/supabase'
import { Profile, ProfileFormData, Prefecture } from '../types/profile'

export const profileService = {
  // プロフィール取得
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('プロフィール取得エラー:', error)
      return null
    }

    return data
  },

  // プロフィール作成
  async createProfile(profileData: ProfileFormData): Promise<Profile | null> {
    console.log('プロフィール作成開始:', profileData)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('認証エラー:', authError)
      throw new Error('認証されていません')
    }

    console.log('認証ユーザー:', user.id, user.email)

    // 文字列を数値に変換
    const processedData = {
      id: user.id,
      display_name: profileData.display_name,
      age: parseInt(profileData.age),
      gender: profileData.gender,
      prefecture: profileData.prefecture,
      city: profileData.city || null,
      occupation: profileData.occupation || null,
      bio: profileData.bio || null,
      preferred_min_age: profileData.preferred_min_age ? parseInt(profileData.preferred_min_age) : null,
      preferred_max_age: profileData.preferred_max_age ? parseInt(profileData.preferred_max_age) : null,
      preferred_prefecture: profileData.preferred_prefecture || null,
      main_image_url: profileData.main_image_url || null,
      additional_images: profileData.additional_images || null,
      video_url: profileData.video_url || null,
      profile_completion_rate: calculateCompletionRate(profileData),
    }

    console.log('処理されたデータ:', processedData)

    const { data, error } = await supabase
      .from('profiles')
      .insert(processedData)
      .select()
      .single()

    if (error) {
      console.error('プロフィール作成エラー詳細:', error)
      throw error
    }

    console.log('プロフィール作成成功:', data)
    return data
  },

  // プロフィール更新
  async updateProfile(profileData: ProfileFormData): Promise<Profile | null> {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      throw new Error('認証されていません')
    }

    const processedData = {
      display_name: profileData.display_name,
      age: parseInt(profileData.age),
      gender: profileData.gender,
      prefecture: profileData.prefecture,
      city: profileData.city || null,
      occupation: profileData.occupation || null,
      bio: profileData.bio || null,
      preferred_min_age: profileData.preferred_min_age ? parseInt(profileData.preferred_min_age) : null,
      preferred_max_age: profileData.preferred_max_age ? parseInt(profileData.preferred_max_age) : null,
      preferred_prefecture: profileData.preferred_prefecture || null,
      main_image_url: profileData.main_image_url || null,
      additional_images: profileData.additional_images || null,
      video_url: profileData.video_url || null,
      profile_completion_rate: calculateCompletionRate(profileData),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(processedData)
      .eq('id', user.data.user.id)
      .select()
      .single()

    if (error) {
      console.error('プロフィール更新エラー:', error)
      throw error
    }

    return data
  },

  // 都道府県一覧取得
  async getPrefectures(): Promise<Prefecture[]> {
    const { data, error } = await supabase
      .from('prefectures')
      .select('*')
      .order('code')

    if (error) {
      console.error('都道府県取得エラー:', error)
      // フォールバック用のハードコーデータ
      return PREFECTURES_FALLBACK
    }

    return data || PREFECTURES_FALLBACK
  },

  // プロフィール存在確認
  async hasProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      // テーブルが存在しない場合のエラー
      if (error && error.code === '42P01') { // relation does not exist
        console.warn('profilesテーブルが存在しません。Supabaseでテーブルを作成してください。')
        return false
      }

      // レコードが見つからない場合（正常）
      if (error && error.code === 'PGRST116') {
        return false
      }

      // その他のエラー
      if (error) {
        console.error('プロフィール存在確認エラー:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('プロフィール確認で予期しないエラー:', error)
      return false
    }
  }
}

// プロフィール完成度計算
function calculateCompletionRate(data: ProfileFormData): number {
  let rate = 0
  
  // 必須項目（20%ずつ）
  if (data.display_name) rate += 20
  if (data.age) rate += 20
  if (data.gender) rate += 20
  if (data.prefecture) rate += 20
  if (data.main_image_url) rate += 20 // メイン画像を必須項目として追加
  
  // 任意項目（追加ポイント）
  if (data.city) rate += 5
  if (data.occupation) rate += 5
  if (data.bio && data.bio.length >= 20) rate += 10
  if (data.preferred_min_age && data.preferred_max_age) rate += 5
  if (data.additional_images && data.additional_images.length > 0) rate += 5
  if (data.video_url) rate += 5
  
  return Math.min(rate, 100)
}

// フォールバック用都道府県データ
const PREFECTURES_FALLBACK: Prefecture[] = [
  { code: '13', name: '東京都' },
  { code: '27', name: '大阪府' },
  { code: '14', name: '神奈川県' },
  { code: '23', name: '愛知県' },
  { code: '11', name: '埼玉県' },
  { code: '12', name: '千葉県' },
  { code: '01', name: '北海道' },
  { code: '40', name: '福岡県' },
  // 他は省略
]