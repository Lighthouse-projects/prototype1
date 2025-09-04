import { ProfileFormData, HEIGHT_MIN, HEIGHT_MAX } from '../types/profile'

export interface ValidationError {
  field: string
  message: string
}

export class ProfileValidator {
  private errors: ValidationError[] = []

  validate(data: ProfileFormData): ValidationError[] {
    this.errors = []
    
    // 基本必須項目の検証
    this.validateDisplayName(data.display_name)
    this.validateAge(data.age)
    this.validateGender(data.gender)
    this.validatePrefecture(data.prefecture)
    
    // 新規追加項目の検証
    this.validateNickname(data.nickname)
    this.validateHeight(data.height)
    this.validateBodyType(data.body_type)
    this.validateMeetingPurpose(data.meeting_purpose)
    
    // Phase 2 項目の検証
    this.validateDrinking(data.drinking)
    this.validateSmoking(data.smoking)
    this.validateFreeDays(data.free_days)
    
    // Phase 3 項目の検証
    this.validateMeetingFrequency(data.meeting_frequency)
    this.validateFutureDreams(data.future_dreams)
    
    // その他の項目
    this.validateBio(data.bio)
    this.validateAgePreferences(data.preferred_min_age, data.preferred_max_age)
    
    return this.errors
  }

  private addError(field: string, message: string): void {
    this.errors.push({ field, message })
  }

  private validateDisplayName(value: string): void {
    if (!value || value.trim().length === 0) {
      this.addError('display_name', '表示名は必須です')
      return
    }
    
    if (value.length < 2) {
      this.addError('display_name', '表示名は2文字以上で入力してください')
    }
    
    if (value.length > 50) {
      this.addError('display_name', '表示名は50文字以内で入力してください')
    }

    // 不適切な文字のチェック
    const invalidChars = /[<>\"'&]/
    if (invalidChars.test(value)) {
      this.addError('display_name', '表示名に不適切な文字が含まれています')
    }
  }

  private validateAge(value: string): void {
    if (!value || value.trim().length === 0) {
      this.addError('age', '年齢は必須です')
      return
    }
    
    const age = parseInt(value)
    if (isNaN(age)) {
      this.addError('age', '年齢は数値で入力してください')
      return
    }
    
    if (age < 18) {
      this.addError('age', '18歳未満の方はご利用いただけません')
    }
    
    if (age > 99) {
      this.addError('age', '年齢は99歳以下で入力してください')
    }
  }

  private validateGender(value: string): void {
    if (!value || value.trim().length === 0) {
      this.addError('gender', '性別は必須です')
      return
    }
    
    const validGenders = ['male', 'female', 'other']
    if (!validGenders.includes(value)) {
      this.addError('gender', '性別の値が不正です')
    }
  }

  private validatePrefecture(value: string): void {
    if (!value || value.trim().length === 0) {
      this.addError('prefecture', '都道府県は必須です')
      return
    }
  }

  private validateNickname(value: string): void {
    if (value && value.length > 30) {
      this.addError('nickname', 'ニックネームは30文字以内で入力してください')
    }
    
    // 不適切な文字のチェック
    if (value) {
      const invalidChars = /[<>\"'&]/
      if (invalidChars.test(value)) {
        this.addError('nickname', 'ニックネームに不適切な文字が含まれています')
      }
    }
  }

  private validateHeight(value: string): void {
    if (value && value.trim().length > 0) {
      const height = parseInt(value)
      if (isNaN(height)) {
        this.addError('height', '身長は数値で入力してください')
        return
      }
      
      if (height < HEIGHT_MIN) {
        this.addError('height', `身長は${HEIGHT_MIN}cm以上で入力してください`)
      }
      
      if (height > HEIGHT_MAX) {
        this.addError('height', `身長は${HEIGHT_MAX}cm以下で入力してください`)
      }
    }
  }

  private validateBodyType(value: string): void {
    if (value && value.trim().length > 0) {
      const validTypes = ['slim', 'normal', 'chubby', 'overweight']
      if (!validTypes.includes(value)) {
        this.addError('body_type', '体型の値が不正です')
      }
    }
  }

  private validateMeetingPurpose(value: string): void {
    if (value && value.trim().length > 0) {
      const validPurposes = ['chat', 'friend', 'relationship', 'marriage']
      if (!validPurposes.includes(value)) {
        this.addError('meeting_purpose', '出会いの目的の値が不正です')
      }
    }
  }

  private validateDrinking(value: string): void {
    if (value && value.trim().length > 0) {
      const validOptions = ['never', 'sometimes', 'often']
      if (!validOptions.includes(value)) {
        this.addError('drinking', '飲酒の値が不正です')
      }
    }
  }

  private validateSmoking(value: string): void {
    if (value && value.trim().length > 0) {
      const validOptions = ['never', 'sometimes', 'often', 'quit_for_partner']
      if (!validOptions.includes(value)) {
        this.addError('smoking', '喫煙の値が不正です')
      }
    }
  }

  private validateFreeDays(value: string): void {
    if (value && value.trim().length > 0) {
      const validOptions = ['irregular', 'weekends', 'weekdays']
      if (!validOptions.includes(value)) {
        this.addError('free_days', '休日の値が不正です')
      }
    }
  }

  private validateMeetingFrequency(value: string): void {
    if (value && value.trim().length > 0) {
      const validOptions = ['monthly', 'twice_monthly', 'weekly', 'multiple_weekly', 'frequent']
      if (!validOptions.includes(value)) {
        this.addError('meeting_frequency', '会う頻度の値が不正です')
      }
    }
  }

  private validateFutureDreams(value: string): void {
    if (value && value.length > 500) {
      this.addError('future_dreams', '将来の夢は500文字以内で入力してください')
    }
  }

  private validateBio(value: string): void {
    if (value && value.length > 1000) {
      this.addError('bio', '自己紹介は1000文字以内で入力してください')
    }
  }

  private validateAgePreferences(minAge: string, maxAge: string): void {
    if (minAge && maxAge) {
      const min = parseInt(minAge)
      const max = parseInt(maxAge)
      
      if (!isNaN(min) && !isNaN(max)) {
        if (min > max) {
          this.addError('preferred_min_age', '最小年齢は最大年齢より小さくしてください')
        }
        
        if (min < 18) {
          this.addError('preferred_min_age', '希望最小年齢は18歳以上で設定してください')
        }
        
        if (max > 99) {
          this.addError('preferred_max_age', '希望最大年齢は99歳以下で設定してください')
        }
      }
    }
  }
}

// バリデーション実行関数
export function validateProfile(data: ProfileFormData): ValidationError[] {
  const validator = new ProfileValidator()
  return validator.validate(data)
}

// 特定フィールドのバリデーション
export function validateField(field: string, value: string, allData?: Partial<ProfileFormData>): ValidationError[] {
  const validator = new ProfileValidator()
  const tempData: ProfileFormData = {
    display_name: '',
    age: '',
    gender: '',
    prefecture: '',
    city: '',
    occupation: '',
    bio: '',
    preferred_min_age: '',
    preferred_max_age: '',
    preferred_prefecture: '',
    meeting_purpose: '',
    nickname: '',
    height: '',
    body_type: '',
    hometown_prefecture: '',
    drinking: '',
    smoking: '',
    free_days: '',
    meeting_frequency: '',
    future_dreams: '',
    ...allData,
    [field]: value
  }
  
  const allErrors = validator.validate(tempData)
  return allErrors.filter(error => error.field === field)
}