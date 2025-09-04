import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import {
  MEETING_PURPOSE_OPTIONS,
  BODY_TYPE_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  FREE_DAYS_OPTIONS,
  MEETING_FREQUENCY_OPTIONS
} from '../types/profile'

const { width, height } = Dimensions.get('window')

interface ProfileCardProps {
  profile: {
    id: string
    name: string
    age: number
    location: string
    occupation?: string
    images: string[]
    bio?: string
    // 新規追加項目
    nickname?: string
    height?: number
    body_type?: string
    meeting_purpose?: string
    hometown_prefecture?: string
    drinking?: string
    smoking?: string
    free_days?: string
    meeting_frequency?: string
    future_dreams?: string
  }
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const mainImage = profile.images?.[0] || 'https://via.placeholder.com/300x400'

  return (
    <View style={styles.card}>
      <Image source={{ uri: mainImage }} style={styles.image} />
      
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          <View style={styles.basicInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>
          
          <View style={styles.details}>
            <Text style={styles.location}>{profile.location}</Text>
            {profile.height && (
              <Text style={styles.occupation}>{profile.height}cm</Text>
            )}
            {profile.occupation && (
              <Text style={styles.occupation}>{profile.occupation}</Text>
            )}
            {profile.meeting_purpose && (
              <Text style={styles.tag}>
                {MEETING_PURPOSE_OPTIONS.find(opt => opt.value === profile.meeting_purpose)?.label}
              </Text>
            )}
          </View>
          
          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}
        </View>
      </View>
      
      {/* 追加画像のインジケーター */}
      {(profile.images?.length || 0) > 1 && (
        <View style={styles.imageIndicator}>
          {profile.images?.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  infoContainer: {
    gap: 8,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  age: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '500',
  },
  details: {
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  occupation: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  tag: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
    marginTop: 8,
  },
  imageIndicator: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})