import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
} from 'react-native'
import { ProfileCard } from './ProfileCard'

const { width, height } = Dimensions.get('window')

interface Profile {
  id: string
  name: string
  age: number
  location: string
  occupation?: string
  images: string[]
  bio?: string
}

interface CardSwiperProps {
  profiles: Profile[]
  onSwipeLeft?: (profile: Profile) => void
  onSwipeRight?: (profile: Profile) => void
  onSwipeTop?: (profile: Profile) => void
}

export const CardSwiper: React.FC<CardSwiperProps> = ({
  profiles,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [pan] = useState(new Animated.ValueXY())
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      })
    },
    onPanResponderMove: (evt, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: gestureState.dy })
    },
    onPanResponderRelease: (evt, gestureState) => {
      pan.flattenOffset()
      
      const SWIPE_THRESHOLD = 120
      
      if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
        const direction = gestureState.dx > 0 ? 'right' : 'left'
        const profile = profiles?.[currentIndex]
        
        if (profile) {
          // アニメーションで画面外に移動
          Animated.timing(pan, {
            toValue: { 
              x: direction === 'right' ? width : -width, 
              y: gestureState.dy 
            },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            // アニメーション完了後にリセットして次のカードを表示
            pan.setValue({ x: 0, y: 0 })
            setCurrentIndex(prev => prev + 1)
            
            // コールバック実行
            if (direction === 'right') {
              onSwipeRight?.(profile)
            } else {
              onSwipeLeft?.(profile)
            }
          })
        }
      } else {
        // スワイプが不十分な場合は元の位置に戻す
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start()
      }
    },
  })

  // アクションボタンの処理
  const handlePassPress = () => {
    const profile = profiles?.[currentIndex]
    if (profile) {
      console.log('パス:', profile.name)
      onSwipeLeft?.(profile)
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleLikePress = () => {
    const profile = profiles?.[currentIndex]
    if (profile) {
      console.log('いいね:', profile.name)
      onSwipeRight?.(profile)
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSuperLikePress = () => {
    const profile = profiles?.[currentIndex]
    if (profile) {
      console.log('スーパーいいね:', profile.name)
      onSwipeTop?.(profile)
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (!profiles || profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>新しい出会いを探しています...</Text>
      </View>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>全て確認済みです</Text>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={() => setCurrentIndex(0)}
        >
          <Text style={styles.resetButtonText}>最初から見る</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentProfile = profiles[currentIndex]

  const rotateInterpolate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  })

  const opacityInterpolate = pan.x.interpolate({
    inputRange: [-width/2, 0, width/2],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.animatedCard,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: rotateInterpolate },
              ],
              opacity: opacityInterpolate,
            },
          ]}
        >
          <ProfileCard profile={currentProfile} />
        </Animated.View>
        
        {/* スワイプインジケーター */}
        <Animated.View 
          style={[
            styles.swipeLabel,
            styles.likeLabel,
            {
              opacity: pan.x.interpolate({
                inputRange: [0, width/4],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.likeLabelText}>いいね！</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.swipeLabel,
            styles.passLabel,
            {
              opacity: pan.x.interpolate({
                inputRange: [-width/4, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.passLabelText}>パス</Text>
        </Animated.View>
      </View>

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.passButton} onPress={handlePassPress}>
          <Text style={styles.passButtonText}>✗</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.superLikeButton} onPress={handleSuperLikePress}>
          <Text style={styles.superLikeButtonText}>★</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLikePress}>
          <Text style={styles.likeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 50,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  animatedCard: {
    position: 'absolute',
  },
  swipeLabel: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 4,
  },
  likeLabel: {
    right: 30,
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    transform: [{ rotate: '-30deg' }],
  },
  likeLabelText: {
    color: '#4ECDC4',
    fontSize: 32,
    fontWeight: 'bold',
  },
  passLabel: {
    left: 30,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    transform: [{ rotate: '30deg' }],
  },
  passLabelText: {
    color: '#FF6B6B',
    fontSize: 32,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  passButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  superLikeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
})