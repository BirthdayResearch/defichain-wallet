import React from 'react'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from './themed'
import { BottomSheetModal } from './BottomSheetModal'
import { translate } from '@translations'
import { StyleProp, TextStyle, View } from 'react-native'

export interface BottomSheetAlertInfo {
  title: string
  message: string
}
interface BottomSheetInfoProps {
  name: string
  alertInfo: BottomSheetAlertInfo
  infoIconStyle?: StyleProp<TextStyle>
}

export function BottomSheetInfo ({
  name,
  alertInfo,
  infoIconStyle
}: BottomSheetInfoProps): JSX.Element {
  return (
    <BottomSheetModal
      name={name}
      snapPoints={['30%']}
      alertInfo={alertInfo}
      triggerComponent={
        <ThemedIcon
          size={16}
          name='info-outline'
          iconType='MaterialIcons'
          dark={tailwind('text-gray-200')}
          light={tailwind('text-gray-700')}
          style={infoIconStyle}
        />
      }
    >
      <View style={tailwind('py-4 px-6 pt-0')}>
        <View
          style={tailwind('flex-row mb-3 items-center')}
        >
          <ThemedIcon
            size={20}
            name='info-outline'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
          />
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('ml-2 text-2xl font-semibold')}
          >
            {translate('components/BottomSheetInfo', alertInfo.title)}
          </ThemedText>

        </View>
        <View>
          <ThemedText
            style={tailwind('text-base')}
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
          >
            {translate('components/BottomSheetInfo', alertInfo.message)}
          </ThemedText>
        </View>
      </View>
    </BottomSheetModal>
  )
}
