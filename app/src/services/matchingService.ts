import { supabase } from '../lib/supabase'

export interface LikeData {
  id: string
  from_user_id: string
  to_user_id: string
  created_at: string
  is_super_like: boolean
}

export interface MatchData {
  id: string
  user1_id: string
  user2_id: string
  status: 'matched' | 'unmatched' | 'blocked'
  matched_at: string
  last_message_at?: string
}

export interface ProfileWithLike {
  id: string
  display_name: string
  age: number
  prefecture: string
  occupation?: string
  main_image_url?: string
  additional_images?: string[]
  bio?: string
  liked_by_current_user?: boolean
}

export class MatchingService {
  static async findMatchWithPartner(partnerId: string): Promise<{ match_id: string } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { data: match, error } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'matched')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${user.id})`)
        .single()

      if (error) {
        console.log('No match found:', error)
        return null
      }

      return { match_id: match.id }
    } catch (error: any) {
      console.error('Error finding match:', error)
      return null
    }
  }

  static async sendLike(toUserId: string, isSuperLike: boolean = false): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { error } = await supabase
        .from('likes')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          is_super_like: isSuperLike,
        })

      if (error) {
        if (error.code === '23505') {
          throw new Error('既にいいねしています')
        }
        throw error
      }

      return true
    } catch (error: any) {
      console.error('いいね送信エラー:', error)
      throw new Error(error.message || 'いいねの送信に失敗しました')
    }
  }

  static async getLikesReceived(): Promise<ProfileWithLike[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // まず、いいねを受信したレコードを取得
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('from_user_id, created_at, is_super_like')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })

      if (likesError) throw likesError

      if (!likes || likes.length === 0) return []

      // 各いいねの送信者のプロフィールを取得
      const profileIds = likes.map(like => like.from_user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          age,
          prefecture,
          occupation,
          main_image_url,
          additional_images,
          bio
        `)
        .in('id', profileIds)

      if (profilesError) throw profilesError

      // プロフィールデータを結合
      return profiles?.map(profile => ({
        ...profile,
        liked_by_current_user: false
      })) || []
    } catch (error: any) {
      console.error('受信いいね取得エラー:', error)
      throw new Error(error.message || '受信いいねの取得に失敗しました')
    }
  }

  static async getLikesSent(): Promise<ProfileWithLike[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // まず、送信したいいねを取得
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('to_user_id, created_at, is_super_like')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })

      if (likesError) throw likesError

      if (!likes || likes.length === 0) return []

      // 各いいねの受信者のプロフィールを取得
      const profileIds = likes.map(like => like.to_user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          age,
          prefecture,
          occupation,
          main_image_url,
          additional_images,
          bio
        `)
        .in('id', profileIds)

      if (profilesError) throw profilesError

      // プロフィールデータを結合
      return profiles?.map(profile => ({
        ...profile,
        liked_by_current_user: true
      })) || []
    } catch (error: any) {
      console.error('送信いいね取得エラー:', error)
      throw new Error(error.message || '送信いいねの取得に失敗しました')
    }
  }

  static async getMatches(): Promise<MatchData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          matched_at,
          last_message_at
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'matched')
        .order('matched_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('マッチ取得エラー:', error)
      throw new Error(error.message || 'マッチの取得に失敗しました')
    }
  }

  static async unmatch(matchId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { error } = await supabase
        .from('matches')
        .update({
          status: 'unmatched',
          unmatched_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (error) throw error

      return true
    } catch (error: any) {
      console.error('マッチ解除エラー:', error)
      throw new Error(error.message || 'マッチの解除に失敗しました')
    }
  }

  static async blockUser(matchId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { error } = await supabase
        .from('matches')
        .update({ status: 'blocked' })
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (error) throw error

      return true
    } catch (error: any) {
      console.error('ブロックエラー:', error)
      throw new Error(error.message || 'ブロックに失敗しました')
    }
  }

  static async checkMutualLike(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .or(`and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`)

      if (error) throw error

      return (data?.length || 0) === 2
    } catch (error: any) {
      console.error('相互いいね確認エラー:', error)
      return false
    }
  }

  static async checkIfMatched(userId1: string, userId2: string): Promise<MatchData | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${Math.min(userId1, userId2) === userId1 ? userId1 : userId2},user2_id.eq.${Math.max(userId1, userId2) === userId1 ? userId1 : userId2})`)
        .eq('status', 'matched')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data || null
    } catch (error: any) {
      console.error('マッチ確認エラー:', error)
      return null
    }
  }

  static async getMatchesWithProfiles(): Promise<any[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase.functions.invoke('get-matches-with-profiles', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw new Error(error.message || 'マッチ取得に失敗しました')
      }

      if (!data || !data.matches) {
        throw new Error('マッチデータが取得できませんでした')
      }

      return data.matches
    } catch (error: any) {
      console.error('マッチリスト取得エラー:', error)
      throw new Error(error.message || 'マッチリストの取得に失敗しました')
    }
  }

  static async getPartnerProfile(partnerId: string): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase.functions.invoke('get-partner-profile', {
        body: { partnerId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw new Error(error.message || '相手プロフィール取得に失敗しました')
      }

      if (!data || !data.profile) {
        throw new Error('相手プロフィールデータが取得できませんでした')
      }

      return data.profile
    } catch (error: any) {
      console.error('相手プロフィール取得エラー:', error)
      throw new Error(error.message || '相手プロフィールの取得に失敗しました')
    }
  }

  static async getRecommendedProfiles(limit: number = 10): Promise<ProfileWithLike[]> {
    try {
      // 認証状態の確認
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      // Edge Functionを呼び出し
      const { data, error } = await supabase.functions.invoke('get-recommended-profiles', {
        body: { limit },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw new Error(error.message || 'プロフィール取得に失敗しました')
      }

      if (!data || !data.profiles) {
        throw new Error('プロフィールデータが取得できませんでした')
      }

      return data.profiles as ProfileWithLike[]
    } catch (error: any) {
      console.error('推奨プロフィール取得エラー:', error)
      throw new Error(error.message || 'おすすめプロフィールの取得に失敗しました')
    }
  }
}