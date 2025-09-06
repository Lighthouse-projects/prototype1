import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // 必要に応じて拡張可能
}

export class AuthService {
  /**
   * 現在ログイン中のユーザーを取得
   * @returns 認証済みユーザー
   * @throws 未認証の場合はエラーを投げる
   */
  static async getCurrentUser(): Promise<AuthUser> {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`認証エラー: ${error.message}`)
    }
    
    if (!user) {
      throw new Error('認証が必要です')
    }
    
    return user as AuthUser
  }

  /**
   * 現在のセッション情報を取得
   * @returns セッション情報（認証済みの場合）
   * @throws 未認証またはセッションエラーの場合はエラーを投げる
   */
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`セッション取得エラー: ${error.message}`)
    }
    
    if (!session?.access_token) {
      throw new Error('認証が必要です')
    }
    
    return session
  }

  /**
   * ユーザーが認証済みかチェック（エラーを投げない）
   * @returns 認証状態のboolean
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }

  /**
   * 指定されたユーザーIDが現在のユーザーと一致するかチェック
   * @param userId チェック対象のユーザーID
   * @returns 一致する場合true
   * @throws 未認証の場合はエラーを投げる
   */
  static async isCurrentUser(userId: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user.id === userId
  }

  /**
   * Bearer Tokenフォーマットでアクセストークンを取得
   * EdgeFunction呼び出し用
   */
  static async getBearerToken(): Promise<string> {
    const session = await this.getCurrentSession()
    return `Bearer ${session.access_token}`
  }

  /**
   * 認証状態の変更を監視
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}