import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Supabase設定詳細 ===')
console.log('Constants.expoConfig:', Constants.expoConfig?.extra)
console.log('process.env SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
console.log('process.env SUPABASE_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'FOUND' : 'MISSING')
console.log('最終URL:', supabaseUrl)
console.log('最終KEY:', supabaseAnonKey ? 'FOUND' : 'MISSING')
console.log('========================')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase設定が不正です')
  console.error('URL:', supabaseUrl || 'MISSING')
  console.error('KEY:', supabaseAnonKey || 'MISSING')
} else {
  console.log('✅ Supabase設定OK')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)