export interface Profile {
  id: string
  display_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  prefecture: string
  city?: string
  occupation?: string
  bio?: string
  interests?: string[]
  preferred_min_age?: number
  preferred_max_age?: number
  preferred_prefecture?: string
  main_image_url?: string
  additional_images?: string[]
  video_url?: string
  profile_completion_rate: number
  last_active: string
  created_at: string
  updated_at: string
  
  // 新規追加項目（Phase 1 - 基本項目）
  meeting_purpose?: 'chat' | 'friend' | 'relationship' | 'marriage'
  nickname?: string
  height?: number
  body_type?: 'slim' | 'normal' | 'chubby' | 'overweight'
  
  // 新規追加項目（Phase 2 - 推奨項目）
  hometown_prefecture?: string
  drinking?: 'never' | 'sometimes' | 'often'
  smoking?: 'never' | 'sometimes' | 'often' | 'quit_for_partner'
  free_days?: 'irregular' | 'weekends' | 'weekdays'
  
  // 新規追加項目（Phase 3 - 詳細項目）
  meeting_frequency?: 'monthly' | 'twice_monthly' | 'weekly' | 'multiple_weekly' | 'frequent'
  future_dreams?: string
}

export interface ProfileFormData {
  display_name: string
  age: string
  gender: 'male' | 'female' | 'other' | ''
  prefecture: string
  city: string
  occupation: string
  bio: string
  preferred_min_age: string
  preferred_max_age: string
  preferred_prefecture: string
  main_image_url?: string
  additional_images?: string[]
  video_url?: string
  
  // 新規追加項目（Phase 1 - 基本項目）
  meeting_purpose: 'chat' | 'friend' | 'relationship' | 'marriage' | ''
  nickname: string
  height: string
  body_type: 'slim' | 'normal' | 'chubby' | 'overweight' | ''
  
  // 新規追加項目（Phase 2 - 推奨項目）
  hometown_prefecture: string
  drinking: 'never' | 'sometimes' | 'often' | ''
  smoking: 'never' | 'sometimes' | 'often' | 'quit_for_partner' | ''
  free_days: 'irregular' | 'weekends' | 'weekdays' | ''
  
  // 新規追加項目（Phase 3 - 詳細項目）
  meeting_frequency: 'monthly' | 'twice_monthly' | 'weekly' | 'multiple_weekly' | 'frequent' | ''
  future_dreams: string
}

export interface Prefecture {
  code: string
  name: string
}

export interface ProfileOption {
  category: string
  value: string
  label_ja: string
  sort_order: number
  is_active: boolean
}

// 新しいプロフィール項目の定数定義
export const MEETING_PURPOSE_OPTIONS = [
  { value: 'chat', label: 'チャット相手' },
  { value: 'friend', label: '友達' },
  { value: 'relationship', label: '恋人' },
  { value: 'marriage', label: '結婚相手' },
] as const

export const BODY_TYPE_OPTIONS = [
  { value: 'slim', label: 'スリム' },
  { value: 'normal', label: '普通' },
  { value: 'chubby', label: 'ぽっちゃり' },
  { value: 'overweight', label: '太め' },
] as const

export const DRINKING_OPTIONS = [
  { value: 'never', label: '飲まない' },
  { value: 'sometimes', label: '時々' },
  { value: 'often', label: 'よく飲む' },
] as const

export const SMOKING_OPTIONS = [
  { value: 'never', label: '吸わない' },
  { value: 'sometimes', label: '時々' },
  { value: 'often', label: 'よく吸う' },
  { value: 'quit_for_partner', label: '相手が嫌がれば禁煙' },
] as const

export const FREE_DAYS_OPTIONS = [
  { value: 'irregular', label: '不定期' },
  { value: 'weekends', label: '土日' },
  { value: 'weekdays', label: '平日' },
] as const

export const MEETING_FREQUENCY_OPTIONS = [
  { value: 'monthly', label: '月1回' },
  { value: 'twice_monthly', label: '月2回' },
  { value: 'weekly', label: '週1回' },
  { value: 'multiple_weekly', label: '週2-3回' },
  { value: 'frequent', label: '週4回以上' },
] as const

// 身長の範囲定数
export const HEIGHT_MIN = 140
export const HEIGHT_MAX = 220