import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native'
import { ProfileWithLike } from '../services/matchingService'

const { width, height } = Dimensions.get('window')

interface MatchModalProps {
  visible: boolean
  profile: ProfileWithLike | null
  onClose: () => void
  onSendMessage: () => void
  onKeepSwiping: () => void
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  profile,
  onClose,
  onSendMessage,
  onKeepSwiping,
}) => {
  if (!profile) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 背景装飾 */}
          <View style={styles.confettiContainer}>
            <Text style={styles.confettiText}>🎉</Text>
            <Text style={styles.confettiText}>💕</Text>
            <Text style={styles.confettiText}>✨</Text>
            <Text style={styles.confettiText}>🎊</Text>
          </View>

          {/* メインコンテンツ */}
          <View style={styles.content}>
            <Text style={styles.matchTitle}>マッチしました！</Text>
            
            {/* プロフィール画像 */}
            <View style={styles.profileImageContainer}>
              {profile.main_image_url ? (
                <Image
                  source={{ uri: profile.main_image_url }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.profileImage, styles.noImageContainer]}>
                  <Text style={styles.noImageText}>写真なし</Text>
                </View>
              )}
            </View>

            {/* プロフィール情報 */}
            <Text style={styles.profileName}>
              {profile.display_name}, {profile.age}
            </Text>
            {profile.prefecture && (
              <Text style={styles.profileLocation}>{profile.prefecture}</Text>
            )}

            <Text style={styles.matchMessage}>
              お互いにいいね！しました{'\n'}
              メッセージを送って会話を始めませんか？
            </Text>

            {/* アクションボタン */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.messageButton]}
                onPress={onSendMessage}
              >
                <Text style={styles.messageButtonText}>
                  メッセージを送る
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.continueButton]}
                onPress={onKeepSwiping}
              >
                <Text style={styles.continueButtonText}>
                  スワイプを続ける
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 閉じるボタン */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 10,
    zIndex: -1,
  },
  confettiText: {
    fontSize: 24,
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#4ECDC4',
  },
  noImageContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#4ECDC4',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  continueButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
})