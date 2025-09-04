import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SplashScreen } from '../screens/auth/SplashScreen'
import { WelcomeScreen } from '../screens/auth/WelcomeScreen'
import { SignUpScreen } from '../screens/auth/SignUpScreen'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen'
import { PasswordResetScreen } from '../screens/auth/PasswordResetScreen'

export type AuthStackParamList = {
  Splash: undefined
  Welcome: undefined
  SignUp: undefined
  Login: undefined
  EmailVerification: { email: string }
  PasswordReset: undefined
}

const Stack = createStackNavigator<AuthStackParamList>()

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{ animationEnabled: false }}
      />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
      <Stack.Screen 
        name="PasswordReset" 
        component={PasswordResetScreen}
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#007AFF',
        }}
      />
    </Stack.Navigator>
  )
}