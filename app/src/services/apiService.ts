import { supabase } from '../lib/supabase'
import { AuthService } from './authService'
import { Logger } from '../utils/logger'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface EdgeFunctionOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

export class ApiService {
  private static readonly DEFAULT_TIMEOUT = 10000 // 10秒
  private static readonly DEFAULT_RETRIES = 3

  /**
   * Edge Function呼び出しの統一メソッド
   */
  static async callEdgeFunction<T>(
    functionName: string, 
    body?: any, 
    options?: EdgeFunctionOptions
  ): Promise<T> {
    const startTime = Date.now()
    const context = `EdgeFunction:${functionName}`
    
    try {
      Logger.debug(context, 'Starting Edge Function call', { 
        functionName, 
        hasBody: !!body 
      })

      // 認証トークン取得
      const session = await AuthService.getCurrentSession()
      
      const response = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })

      // レスポンス処理
      if (response.error) {
        const errorMessage = response.error.message || 'Edge Function呼び出しに失敗しました'
        Logger.api('POST', `/functions/v1/${functionName}`, false, {
          metadata: { error: response.error }
        })
        throw new Error(errorMessage)
      }

      if (!response.data) {
        const errorMessage = 'Edge Functionからデータが返されませんでした'
        Logger.api('POST', `/functions/v1/${functionName}`, false)
        throw new Error(errorMessage)
      }

      // 成功ログ
      Logger.api('POST', `/functions/v1/${functionName}`, true)
      Logger.performance(context, startTime)

      return response.data as T

    } catch (error: any) {
      Logger.error(context, error, {
        metadata: { functionName, hasBody: !!body }
      })
      Logger.performance(context, startTime, { success: false })
      throw error
    }
  }

  /**
   * Supabaseクエリの統一エラーハンドリング
   */
  static async executeQuery<T>(
    queryBuilder: any,
    context: string = 'Database'
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      Logger.debug(context, 'Executing database query')
      
      const { data, error } = await queryBuilder
      
      if (error) {
        Logger.api('DB_QUERY', context, false, {
          metadata: { error: error.message }
        })
        throw new Error(error.message)
      }
      
      Logger.api('DB_QUERY', context, true)
      Logger.performance(`DB:${context}`, startTime)
      
      return data as T
      
    } catch (error: any) {
      Logger.error(`DB:${context}`, error)
      Logger.performance(`DB:${context}`, startTime, { success: false })
      throw error
    }
  }

  /**
   * リトライ機能付きAPI呼び出し
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = ApiService.DEFAULT_RETRIES
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug(context, `Attempt ${attempt}/${maxRetries}`)
        return await operation()
      } catch (error: any) {
        lastError = error
        Logger.warn(context, `Attempt ${attempt} failed: ${error.message}`)
        
        if (attempt === maxRetries) {
          Logger.error(context, `All ${maxRetries} attempts failed`, {
            metadata: { finalError: error.message }
          })
          break
        }
        
        // 指数バックオフ待機
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * Edge Function専用のリトライ付き呼び出し
   */
  static async callEdgeFunctionWithRetry<T>(
    functionName: string,
    body?: any,
    options?: EdgeFunctionOptions
  ): Promise<T> {
    return this.withRetry(
      () => this.callEdgeFunction<T>(functionName, body, options),
      `EdgeFunction:${functionName}`,
      options?.retries
    )
  }

  /**
   * バッチ処理用：複数のEdge Function呼び出し
   */
  static async callEdgeFunctionsBatch<T>(
    calls: Array<{ functionName: string; body?: any; options?: EdgeFunctionOptions }>
  ): Promise<Array<T | Error>> {
    const results = await Promise.allSettled(
      calls.map(call => 
        this.callEdgeFunction<T>(call.functionName, call.body, call.options)
      )
    )

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    )
  }

  /**
   * キャッシュ付きAPI呼び出し（簡易実装）
   */
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5分

  static async callEdgeFunctionCached<T>(
    functionName: string,
    body?: any,
    cacheDuration: number = ApiService.CACHE_DURATION
  ): Promise<T> {
    const cacheKey = `${functionName}:${JSON.stringify(body)}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      Logger.debug(`Cache:${functionName}`, 'Using cached data')
      return cached.data
    }
    
    const result = await this.callEdgeFunction<T>(functionName, body)
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
    
    return result
  }

  /**
   * キャッシュクリア
   */
  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}