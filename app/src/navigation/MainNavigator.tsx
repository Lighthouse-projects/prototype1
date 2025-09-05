import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { ProfileCreationScreen } from '../screens/profile/ProfileCreationScreen'
import { ProfileViewScreen } from '../screens/profile/ProfileViewScreen'
import { ProfileEditScreen } from '../screens/profile/ProfileEditScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { BoshuScreen } from '../screens/BoshuScreen'
import { PartnersScreen } from '../screens/PartnersScreen'
import { ChatListScreen } from '../screens/ChatListScreen'
import { MatchListScreen } from '../screens/MatchListScreen'
import { MyPageScreen } from '../screens/MyPageScreen'
import { useAuth } from '../contexts/AuthContext'

export type MainStackParamList = {
  ProfileCreation: undefined
  TabNavigator: undefined
  ProfileView: undefined
  ProfileEdit: undefined
}

export type MainTabParamList = {
  Home: undefined
  Boshu: undefined
  Matches: undefined
  ChatList: undefined
  MyPage: undefined
}

const Stack = createStackNavigator<MainStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Boshu" 
        component={BoshuScreen}
        options={{
          tabBarLabel: '募集',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'megaphone' : 'megaphone-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchListScreen}
        options={{
          tabBarLabel: 'マッチ',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{
          tabBarLabel: 'トーク',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen}
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export const MainNavigator: React.FC = () => {
  const { hasProfile } = useAuth()

  return (
    <Stack.Navigator
      initialRouteName={hasProfile === false ? 'ProfileCreation' : 'TabNavigator'}
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
          headerLeft: () => null,
        }}
      />
      <Stack.Screen 
        name="TabNavigator" 
        component={TabNavigator}
      />
      <Stack.Screen 
        name="ProfileView" 
        component={ProfileViewScreen}
        options={{
          headerShown: true,
          title: 'プロフィール',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
      <Stack.Screen 
        name="ProfileEdit" 
        component={ProfileEditScreen}
        options={{
          headerShown: true,
          title: 'プロフィール編集',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
    </Stack.Navigator>
  )
}