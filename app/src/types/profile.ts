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
  profile_completion_rate: number
  last_active: string
  created_at: string
  updated_at: string
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
}

export interface Prefecture {
  code: string
  name: string
}