import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  navigation: any
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { loading } = useAuth()
  const [transitionAttempted, setTransitionAttempted] = useState(false)

  useEffect(() => {

    // 即座に遷移を試行
    const immediateTransition = setTimeout(() => {
      if (!transitionAttempted) {
        setTransitionAttempted(true)
        navigation.replace('Welcome')
      }
    }, 500)

    // 1秒後にも遷移を試行
    const secondTransition = setTimeout(() => {
      if (!transitionAttempted) {
        setTransitionAttempted(true)
        navigation.replace('Welcome')
      }
    }, 1000)

    // 2秒後に強制遷移
    const forceTransition = setTimeout(() => {
      setTransitionAttempted(true)
      navigation.replace('Welcome')
    }, 2000)

    // 通常の遷移（ローディング完了時）
    if (!loading && !transitionAttempted) {
      setTransitionAttempted(true)
      clearTimeout(immediateTransition)
      clearTimeout(secondTransition)
      clearTimeout(forceTransition)
      navigation.replace('Welcome')
    }

    return () => {
      clearTimeout(immediateTransition)
      clearTimeout(secondTransition) 
      clearTimeout(forceTransition)
    }
  }, [loading, navigation, transitionAttempted])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>prototype1</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 50,
  },
  loader: {
    marginTop: 20,
  },
})