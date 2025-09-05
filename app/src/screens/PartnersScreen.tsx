import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'

interface Props {
  navigation: any
}

export const PartnersScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>お相手から</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>💌 お相手からの連絡</Text>
          <Text style={styles.comingSoonText}>
            こちらの機能は現在開発中です。{'\n'}
            近日中にリリース予定です！
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>予定機能：</Text>
            <Text style={styles.featureItem}>• 受信したいいね一覧</Text>
            <Text style={styles.featureItem}>• お相手からのメッセージ</Text>
            <Text style={styles.featureItem}>• 応募・連絡の管理</Text>
            <Text style={styles.featureItem}>• マッチング通知</Text>
            <Text style={styles.featureItem}>• ブロック・報告機能</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  comingSoonContainer: {
    backgroundColor: '#fff5f5',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 50,
    borderWidth: 1,
    borderColor: '#fce7e7',
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})