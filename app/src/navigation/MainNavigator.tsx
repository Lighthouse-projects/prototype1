import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ProfileCreationScreen } from '../screens/profile/ProfileCreationScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { useAuth } from '../contexts/AuthContext'

export type MainStackParamList = {
  ProfileCreation: undefined
  Home: undefined
  ProfileView: undefined
}

const Stack = createStackNavigator<MainStackParamList>()

export const MainNavigator: React.FC = () => {
  const { hasProfile } = useAuth()

  return (
    <Stack.Navigator
      initialRouteName={hasProfile === false ? 'ProfileCreation' : 'Home'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="ProfileCreation" 
        component={ProfileCreationScreen}
        options={{
          headerShown: true,
          title: 'プロフィール作成',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
          headerLeft: () => null, // 戻るボタンを非表示
        }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
      />
    </Stack.Navigator>
  )
}