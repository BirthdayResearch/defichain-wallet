import { TextProps, View } from '@components'
import { ThemedProps, ThemedText } from '@components/themed'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'

import { StyleProp } from 'react-native'

interface VaultInfoProps {
  label: string
  value?: BigNumber
  tokens: string[]
  prefix?: string
  suffix?: string
  decimalPlace?: number
  valueThemedProps?: ThemedProps
  valueStyleProps?: StyleProp<TextProps>
  testID: string
}

export function VaultInfo (props: VaultInfoProps): JSX.Element {
  return (
    <View style={tailwind('flex-row items-center w-full my-1')}>
      <View style={tailwind('w-6/12')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('components/VaultCard', props.label)}
        </ThemedText>
      </View>
      <View style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}>
        <TokenIconGroup symbols={props.tokens} maxIconToDisplay={5} testID={`${props.testID}_loan_symbol`} offsetContainer />
      </View>
    </View>
  )
}
