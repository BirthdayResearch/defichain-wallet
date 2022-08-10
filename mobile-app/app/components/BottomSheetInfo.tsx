import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from './themed'
import { BottomSheetModal } from './BottomSheetModal'
import { translate } from '@translations'
import { StyleProp, TextStyle, View } from 'react-native'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'

export interface BottomSheetAlertInfo {
  title: string
  message: string
}
interface BottomSheetInfoProps {
  name?: string
  alertInfo?: BottomSheetAlertInfo
  infoIconStyle?: StyleProp<TextStyle>
  scrollEnabled?: boolean
}

export function BottomSheetInfo ({
  name,
  alertInfo,
  infoIconStyle,
  scrollEnabled
}: BottomSheetInfoProps): JSX.Element {
  const { language } = useLanguageContext()

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
      enableScroll={scrollEnabled}
    >
      <View style={tailwind('px-6 pt-0')}>
        <View
          style={tailwind('flex-row mb-3')}
        >
          <ThemedIcon
            size={20}
            name='info-outline'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
            style={tailwind('pt-1.5')}
          />
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('ml-2 pr-10 text-2xl font-semibold')}
          >
            {translate('components/BottomSheetInfo', alertInfo?.title ?? '')}
          </ThemedText>

        </View>
        <View>
          <ThemedText
            style={tailwind('text-base')}
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
          >
            {(language === 'en' || language === undefined) ? btcTextEn : translate('components/BottomSheetInfo', alertInfo?.message ?? '')}
          </ThemedText>
        </View>
      </View>
    </BottomSheetModal>
  )
}

const btcTextEn = `• DFX is a fully-regulated Swiss financial intermediary. Compliance with the regulation in particular to combat money laundering and terrorist financing (AML/CFT) requires elaborate processes that have to be developed and continuously renewed in close coordination with our law firms.

 • Each user must be identified by means of KYC procedures.

 • To enable fast bitcoin deposits, we need to maintain liquidity on the DeFiChain to transfer wrapped Bitcoin directly into users' wallets

 • DFX is building the technical infrastructure to enable Bitcoin deposits to allow wrapped Bitcoin to be transferred to users' DFX wallets and used immediately upon receipt.`
