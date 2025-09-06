export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogContext {
  userId?: string
  screen?: string
  action?: string
  functionName?: string
  success?: boolean
  duration?: number
  metadata?: Record<string, any>
}

export class Logger {
  private static isDevelopment = __DEV__

  /**
   * エラーログ出力（本番環境でも出力）
   */
  static error(context: string, error: any, details?: LogContext): void {
    const timestamp = new Date().toISOString()
    const errorMessage = error?.message || error
    const stack = error?.stack
    
    console.error(
      `[${LogLevel.ERROR}][${timestamp}][${context}] ${errorMessage}`,
      details && { ...details, stack }
    )

    // 本番環境では外部ログサービスへの送信を検討
    // if (!this.isDevelopment) {
    //   this.sendToExternalService('error', { context, error, details })
    // }
  }

  /**
   * 警告ログ出力（開発環境のみ）
   */
  static warn(context: string, message: string, details?: LogContext): void {
    if (!this.isDevelopment) return
    
    const timestamp = new Date().toISOString()
    console.warn(`[${LogLevel.WARN}][${timestamp}][${context}] ${message}`, details)
  }

  /**
   * 情報ログ出力（開発環境のみ）
   */
  static info(context: string, message: string, details?: LogContext): void {
    if (!this.isDevelopment) return
    
    const timestamp = new Date().toISOString()
    console.info(`[${LogLevel.INFO}][${timestamp}][${context}] ${message}`, details)
  }

  /**
   * デバッグログ出力（開発環境のみ）
   */
  static debug(context: string, message: string, details?: LogContext): void {
    if (!this.isDevelopment) return
    
    const timestamp = new Date().toISOString()
    console.log(`[${LogLevel.DEBUG}][${timestamp}][${context}] ${message}`, details)
  }

  /**
   * API呼び出しログ
   */
  static api(method: string, endpoint: string, success: boolean, details?: LogContext): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const status = success ? 'SUCCESS' : 'FAILED'
    const message = `${method} ${endpoint} - ${status}`
    
    if (success) {
      this.info('API', message, details)
    } else {
      this.error('API', new Error(message), details)
    }
  }

  /**
   * ユーザーアクション追跡
   */
  static userAction(screen: string, action: string, userId?: string, metadata?: Record<string, any>): void {
    this.info('USER_ACTION', `${screen}:${action}`, {
      screen,
      action,
      userId,
      metadata
    })
  }

  /**
   * パフォーマンス測定
   */
  static performance(context: string, startTime: number, details?: LogContext): void {
    const duration = Date.now() - startTime
    this.info('PERFORMANCE', `${context} took ${duration}ms`, {
      ...details,
      duration
    })
  }

  /**
   * ハンドルされていないエラーをキャッチ
   */
  static captureException(error: any, context: string = 'UNHANDLED_ERROR'): void {
    this.error(context, error, {
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent || 'Unknown'
      }
    })
  }

  // 将来の拡張: 外部ログサービス連携
  // private static async sendToExternalService(level: string, data: any): Promise<void> {
  //   // Sentry、Bugsnag、CloudWatch等への送信
  // }
}