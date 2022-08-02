import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from './themed'
import { BottomSheetModal } from './BottomSheetModal'
import { StyleProp, TextStyle, View } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'

export interface BottomSheetAlertInfo {
  title: string
  message: string
}
interface BottomSheetInfoProps {
  name?: string
  iconA: string
  iconB: string
  alertInfo?: BottomSheetAlertInfo
  infoIconStyle?: StyleProp<TextStyle>
}

export function BottomSheetInfoV2 ({
  name,
  alertInfo,
  infoIconStyle,
  iconA,
  iconB
}: BottomSheetInfoProps): JSX.Element {
  const TokenIconA = getNativeIcon(iconA)
  const TokenIconB = getNativeIcon(iconB)
  return (
    <BottomSheetModal
      name={name}
      index={0}
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
      enableScroll={false}
    >
      <View style={tailwind('px-6 pt-0')}>
        <View
          style={tailwind('flex-row mb-3')}
        >
          <View>
            <TokenIconA style={tailwind('absolute z-50')} width={32} height={32} />
            <TokenIconB style={tailwind('ml-5 z-40')} width={32} height={32} />
          </View>
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('pl-1 text-2xl font-semibold')}
          >
            {`${iconA}-${iconB}`}
          </ThemedText>

        </View>
      </View>
    </BottomSheetModal>
  )
}
