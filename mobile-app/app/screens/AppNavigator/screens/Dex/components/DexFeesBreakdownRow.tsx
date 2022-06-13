import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'

interface DexFeesBreakdownRowProps {
  transactionFee: BigNumber
  dexFees: DexFee[]
  testID: string
}

export interface DexFee {
  amount: BigNumber
  suffix: string
}

export function DexFeesBreakdownRow ({ transactionFee, dexFees, testID }: DexFeesBreakdownRowProps): JSX.Element {
  const alertInfo = {
    title: 'Fees breakdown',
    message: 'Each transaction is subject to a small amount of fees. The amount may vary depending on how congested the network is. This also includes a burn fee for swapping.'
  }

  return (
    <ThemedView
      style={tailwind('pt-2.5 pb-2 px-4')}
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
    >
      <View style={tailwind('flex-row items-center justify-start')}>
        <ThemedText
          style={tailwind('text-sm mr-1')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          testID={`${testID}_label`}
        >
          {translate('components/BottomSheetInfo', 'Fees breakdown')}
        </ThemedText>
        <BottomSheetInfo alertInfo={alertInfo} name='dex_fees_breakdown' />
      </View>

      <View style={tailwind('flex-row justify-between mt-1.5 mb-2')}>
        <ThemedText
          style={tailwind('text-xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {translate('', 'Transaction fee')}
        </ThemedText>
        <NumberFormat
          decimalScale={8}
          suffix=' DFI'
          displayType='text'
          renderText={(val: string) => (
            <ThemedText
              style={tailwind('text-xs text-right')}
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
              testID={testID}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={transactionFee.toFixed(8)}
        />
      </View>
      <View style={tailwind('flex-row justify-between mb-1')}>
        <ThemedText
          style={tailwind('text-xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {translate('', 'DEX fee')}
        </ThemedText>
        <View style={tailwind('flex-col justify-end')}>
          {dexFees.map(fee => (
            <NumberFormat
              key={fee.suffix}
              decimalScale={8}
              suffix={` ${fee.suffix}`}
              displayType='text'
              renderText={(val: string) => (
                <ThemedText
                  style={tailwind('text-xs text-right mb-1')}
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  testID={testID}
                >
                  {val}
                </ThemedText>
              )}
              thousandSeparator
              value={fee.amount.toFixed(8)}
            />
          ))}
        </View>
      </View>
    </ThemedView>
  )
}
