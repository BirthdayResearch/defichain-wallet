import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'
import { translate } from '@translations'
import { StyleProp, View, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import { BottomSheetInfo } from '@components/BottomSheetInfo'

interface FeeInfoRowProps {
  value: string | number
  type: FeeType
  suffix?: string
  testID: string
  lhsThemedProps?: ThemedProps
  rhsThemedProps?: ThemedProps
  containerStyle?: ThemedProps & { style: StyleProp<ViewStyle> }
}

type FeeType = 'ESTIMATED_FEE' | 'VAULT_FEE'

export function FeeInfoRow (props: FeeInfoRowProps): JSX.Element {
  const estimatedFee = {
    title: 'Estimated fee',
    message: 'Each transaction will be subject to a small amount of fees. The amount may vary depending on the network’s congestion.'
  }
  const vaultFee = {
    title: 'Vault fee',
    message: 'This fee serves as initial deposit for your vault. You will receive 1 DFI back when you choose to close this vault.'
  }

  return (
    <ThemedView
      dark={props.containerStyle?.dark ?? tailwind('bg-gray-800 border-b border-gray-700')}
      light={props.containerStyle?.light ?? tailwind('bg-white border-b border-gray-200')}
      style={props.containerStyle?.style ?? tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText style={tailwind('text-sm mr-1')} testID={`${props.testID}_label`} {...props.lhsThemedProps}>
            {translate('components/BottomSheetInfo', props.type === 'ESTIMATED_FEE' ? estimatedFee.title : vaultFee.title)}
          </ThemedText>
          <BottomSheetInfo alertInfo={props.type === 'ESTIMATED_FEE' ? estimatedFee : vaultFee} name={props.type === 'ESTIMATED_FEE' ? estimatedFee.title : vaultFee.title} />
        </View>
      </View>

      <View style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
              style={tailwind('text-sm text-right')}
              testID={props.testID}
              {...props.rhsThemedProps}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={props.value}
        />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-sm ml-1')}
          testID={`${props.testID}_suffix`}
          {...props.rhsThemedProps}
        >
          {props.suffix}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
