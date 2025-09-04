import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native'
import { HEIGHT_MIN, HEIGHT_MAX } from '../types/profile'

interface HeightPickerProps {
  value?: number
  onValueChange: (height: number | undefined) => void
  placeholder?: string
  style?: any
  disabled?: boolean
}

export const HeightPicker: React.FC<HeightPickerProps> = ({
  value,
  onValueChange,
  placeholder = "身長を選択",
  style,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false)
  
  // 身長選択肢を生成（140cm〜220cm）
  const heightOptions = React.useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let height = HEIGHT_MIN; height <= HEIGHT_MAX; height++) {
      options.push({
        value: height,
        label: `${height}cm`
      })
    }
    return options
  }, [])

  const handleSelect = (height: number) => {
    onValueChange(height)
    setModalVisible(false)
  }

  const handleClear = () => {
    onValueChange(undefined)
    setModalVisible(false)
  }

  const displayValue = value ? `${value}cm` : placeholder

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.picker,
          disabled && styles.pickerDisabled,
          value && styles.pickerSelected
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.pickerText,
          disabled && styles.pickerTextDisabled,
          !value && styles.placeholderText
        ]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>身長を選択</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={handleClear}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>クリア</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {heightOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    value === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const { height: screenHeight } = Dimensions.get('window')

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  pickerDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D1D5DB',
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  pickerTextDisabled: {
    color: '#9CA3AF',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
})