import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { profileService } from '../services/profileService'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  hasProfile: boolean | null
  loading: boolean
  refreshProfileStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // プロフィール存在確認
  const checkProfile = async (userId: string) => {
    try {
      console.log('プロフィール確認開始:', userId)
      const profileExists = await Promise.race([
        profileService.hasProfile(userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('タイムアウト')), 10000)
        )
      ]) as boolean
      
      console.log('プロフィール確認結果:', profileExists)
      setHasProfile(profileExists)
    } catch (error) {
      console.warn('プロフィール確認エラー:', error)
      // エラー時はプロフィール未作成として扱う
      setHasProfile(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log('認証状態初期化開始')
        
        // 現在のセッションを取得
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('セッション取得エラー:', error)
          if (isMounted) {
            setSession(null)
            setUser(null)
            setHasProfile(null)
            setLoading(false)
          }
          return
        }

        console.log('初期セッション:', session?.user?.email || '未認証')
        
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // ユーザーが認証済みの場合、プロフィール確認
            await checkProfile(session.user.id)
          } else {
            setHasProfile(null)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('認証初期化エラー:', error)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setHasProfile(null)
          setLoading(false)
        }
      }
    }

    // 認証状態変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user?.email || '未認証')
      
      if (!isMounted) return

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // ユーザーが認証された場合、プロフィール確認
        await checkProfile(session.user.id)
      } else {
        setHasProfile(null)
      }
    })

    // 初期化実行
    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const refreshProfileStatus = async () => {
    if (user?.id) {
      await checkProfile(user.id)
    }
  }

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    hasProfile,
    loading,
    refreshProfileStatus,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}