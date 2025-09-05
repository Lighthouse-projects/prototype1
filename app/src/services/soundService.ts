import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'

export class SoundService {
  private static messageSound: Audio.Sound | null = null
  private static isInitialized = false

  static async initialize() {
    if (this.isInitialized) return

    try {
      // オーディオモードを設定
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      this.isInitialized = true
      console.log('SoundService initialized')
    } catch (error) {
      console.error('Failed to initialize SoundService:', error)
    }
  }

  static async playMessageSound() {
    try {
      // LINEのような軽やかで上品なHaptic Feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      
      // 短い間隔で軽いバイブレーション（通知音の代替）
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        } catch (error) {
          console.error('追加Haptic Feedbackエラー:', error)
        }
      }, 100)

    } catch (error) {
      console.error('Haptic Feedbackエラー:', error)
    }
  }

  // 軽い通知音（新着メッセージ用）
  static async playNotificationSound() {
    try {
      // Haptic Feedbackのみで軽量化
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      console.log('Notification haptic feedback played')
    } catch (error) {
      console.error('Failed to play notification:', error)
    }
  }

  static async cleanup() {
    try {
      if (this.messageSound) {
        await this.messageSound.unloadAsync()
        this.messageSound = null
      }
    } catch (error) {
      console.error('Failed to cleanup sounds:', error)
    }
  }
}