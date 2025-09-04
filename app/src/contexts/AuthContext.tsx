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

  // 緊急時の強制ローディング終了（3秒）
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 緊急: 3秒経過、強制的にローディング終了')
      setLoading(false)
      setUser(null)
      setSession(null)
      setHasProfile(null)
    }, 3000)

    return () => clearTimeout(emergencyTimeout)
  }, [])

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

    // 非常に短時間でローディングを終了（1秒）
    const forceLoadingEnd = setTimeout(() => {
      console.log('強制的にローディング終了（1秒経過）')
      if (isMounted) {
        setSession(null)
        setUser(null)
        setHasProfile(null)
        setLoading(false)
      }
    }, 1000)

    // 簡素化された初期化
    const initializeAuth = () => {
      try {
        console.log('認証初期化（簡素版）')
        
        // 初期状態を即座に設定
        setSession(null)
        setUser(null)
        setHasProfile(null)
        setLoading(false)
        
        clearTimeout(forceLoadingEnd)
      } catch (error) {
        console.error('認証初期化エラー:', error)
        clearTimeout(forceLoadingEnd)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setHasProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // 認証状態の変更のみ監視（初期取得はスキップ）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user?.email || '未認証')
      
      if (!isMounted) return

      setSession(session)
      setUser(session?.user ?? null)
      setHasProfile(session?.user ? false : null)
      
      // 認証状態変更時はローディングを即座に終了
      setLoading(false)
    })

    return () => {
      isMounted = false
      clearTimeout(forceLoadingEnd)
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

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    hasProfile,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}