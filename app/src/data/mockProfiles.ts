export interface MockProfile {
  id: string
  name: string
  age: number
  location: string
  occupation: string
  images: string[]
  bio: string
  // 新規追加項目
  meeting_purpose?: 'chat' | 'friend' | 'relationship' | 'marriage'
  nickname?: string
  height?: number
  body_type?: 'slim' | 'normal' | 'chubby' | 'overweight'
  hometown_prefecture?: string
  drinking?: 'never' | 'sometimes' | 'often'
  smoking?: 'never' | 'sometimes' | 'often' | 'quit_for_partner'
  free_days?: 'irregular' | 'weekends' | 'weekdays'
  meeting_frequency?: 'monthly' | 'twice_monthly' | 'weekly' | 'multiple_weekly' | 'frequent'
  future_dreams?: string
}

export const mockProfiles: MockProfile[] = [
  {
    id: '1',
    name: '花子',
    nickname: 'はなちゃん',
    age: 25,
    location: '東京都',
    hometown_prefecture: '静岡県',
    occupation: 'マーケティング',
    height: 162,
    body_type: 'normal',
    meeting_purpose: 'relationship',
    drinking: 'sometimes',
    smoking: 'never',
    free_days: 'weekends',
    meeting_frequency: 'twice_monthly',
    future_dreams: '海外で働いて、いろんな文化を体験したいです',
    images: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
    ],
    bio: '旅行と美味しいものが大好きです！休日はカフェ巡りをしています。',
  },
  {
    id: '2',
    name: '美咲',
    nickname: 'みーちゃん',
    age: 28,
    location: '神奈川県',
    hometown_prefecture: '神奈川県',
    occupation: 'デザイナー',
    height: 158,
    body_type: 'slim',
    meeting_purpose: 'friend',
    drinking: 'often',
    smoking: 'quit_for_partner',
    free_days: 'irregular',
    meeting_frequency: 'weekly',
    future_dreams: '自分のデザインスタジオを持つことが夢です',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face',
    ],
    bio: 'クリエイティブなことが好きです。映画鑑賞とアートが趣味です。',
  },
  {
    id: '3',
    name: 'あやか',
    nickname: 'あーちゃん',
    age: 23,
    location: '大阪府',
    hometown_prefecture: '大阪府',
    occupation: '看護師',
    height: 155,
    body_type: 'normal',
    meeting_purpose: 'marriage',
    drinking: 'never',
    smoking: 'never',
    free_days: 'irregular',
    meeting_frequency: 'monthly',
    future_dreams: '患者さんの笑顔をもっと見られるような看護師になりたい',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
    ],
    bio: '人の笑顔を見るのが好きです。ヨガとランニングが趣味です。',
  },
  {
    id: '4',
    name: 'さくら',
    nickname: 'さくちゃん',
    age: 26,
    location: '京都府',
    hometown_prefecture: '奈良県',
    occupation: '教師',
    height: 160,
    body_type: 'normal',
    meeting_purpose: 'relationship',
    drinking: 'sometimes',
    smoking: 'never',
    free_days: 'weekends',
    meeting_frequency: 'twice_monthly',
    future_dreams: '子どもたちの心に残る先生になりたいです',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=400&h=600&fit=crop&crop=face',
    ],
    bio: '子どもたちと関わる仕事をしています。読書と料理が好きです。',
  },
  {
    id: '5',
    name: 'りな',
    nickname: 'りなっち',
    age: 24,
    location: '愛知県',
    hometown_prefecture: '三重県',
    occupation: 'エンジニア',
    height: 168,
    body_type: 'slim',
    meeting_purpose: 'chat',
    drinking: 'never',
    smoking: 'never',
    free_days: 'weekdays',
    meeting_frequency: 'multiple_weekly',
    future_dreams: '世界中の人が使えるアプリを作りたいです',
    images: [
      'https://images.unsplash.com/photo-1506629905150-7cf6abcd3e3d?w=400&h=600&fit=crop&crop=face',
    ],
    bio: 'プログラミングが好きです。最新技術に興味があります。',
  },
  {
    id: '6',
    name: 'ゆい',
    nickname: 'ゆいゆい',
    age: 27,
    location: '福岡県',
    hometown_prefecture: '福岡県',
    occupation: '営業',
    height: 165,
    body_type: 'chubby',
    meeting_purpose: 'friend',
    drinking: 'often',
    smoking: 'sometimes',
    free_days: 'weekends',
    meeting_frequency: 'weekly',
    future_dreams: '会社を立ち上げて、たくさんの人を支援したいです',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=600&fit=crop&crop=face',
    ],
    bio: '人と話すのが好きです。スポーツ観戦とお酒が趣味です。',
  },
]