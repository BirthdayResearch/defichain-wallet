import { ThemedViewV2, ThemedIcon, ThemedTextV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { View, TouchableOpacity } from 'react-native'
import { PricesSectionV2, PriceRateProps } from '@components/PricesSectionV2'
import { NumberRowV2 } from '@components/NumberRowV2'
import { ButtonGroupTabKey } from '../CompositeSwapScreenV2'
import NumberFormat from 'react-number-format'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'

interface SwapSummaryProps {
    instantSwapPriceRate: PriceRateProps[]
    // futureSwapPriceRate: PriceRateProps[]
    fee: BigNumber
    activeTab: ButtonGroupTabKey
    executionBlock?: number
    transactionDate?: string
    // onFeeBreakdownPress: () => void
}

export function SwapSummary ({ instantSwapPriceRate, fee, activeTab, executionBlock, transactionDate }: SwapSummaryProps): JSX.Element {
  const { getTokenPrice } = useTokenPrice()
    return (
      <>
        {activeTab === ButtonGroupTabKey.InstantSwap
        ? (
          <View>
            <PricesSectionV2
              priceRates={instantSwapPriceRate}
              testID='instant_swap_summary'
            />
            <ThemedViewV2
              light={tailwind('border-mono-light-v2-300')}
              dark={tailwind('border-mono-dark-v2-300')}
              style={tailwind('pt-5 border-t-0.5')}
            >
              <NumberRowV2
                lhs={{
                    value: translate('screens/CompositeSwapScreen', 'Total fees'),
                    testID: 'swap_total_fees',
                    themedProps: {
                        light: tailwind('text-mono-light-v2-500'),
                        dark: tailwind('text-mono-dark-v2-500')
                    }
                }}
                rhs={{
                    value: fee.toFixed(8),
                    testID: 'swap_total_fee_amount',
                    prefix: '$',
                    themedProps: {
                        style: tailwind('font-normal-v2 text-sm')
                    },
                    usdTextStyle: tailwind('text-sm')
                }}
              />
            </ThemedViewV2>
            <TouchableOpacity style={tailwind('flex-row items-center mt-5')}>
              <ThemedIcon
                name='info-outline'
                size={16}
                iconType='MaterialIcons'
                light={tailwind('text-mono-light-v2-900')}
                dark={tailwind('text-mono-dark-v2-900')}
              />
              <ThemedTextV2
                light={tailwind('text-mono-light-v2-900')}
                dark={tailwind('text-mono-dark-v2-900')}
                style={tailwind('ml-1 font-semibold-v2 text-xs')}
              >
                {translate('screens/CompositeSwapScreen', 'Fee breakdown')}
              </ThemedTextV2>
            </TouchableOpacity>
          </View>)
          : (
            <View>
              <SettlementBlockInfo blockCount={executionBlock} transactionDate={transactionDate} />
              <ThemedViewV2
                light={tailwind('border-mono-light-v2-300')}
                dark={tailwind('border-mono-dark-v2-300')}
                style={tailwind('pt-5')}
              >
                <NumberRowV2
                  lhs={{
                    value: translate('screens/CompositeSwapScreen', 'Total fees'),
                    testID: 'swap_total_fees',
                    themedProps: {
                        light: tailwind('text-mono-light-v2-500'),
                        dark: tailwind('text-mono-dark-v2-500')
                    }
                }}
                  rhs={{
                    value: fee.toFixed(8),
                    testID: 'swap_total_fee_amount',
                    usdAmount: getTokenPrice('DFI', new BigNumber(fee)), // Just putting here as placeholder
                    suffix: 'DFI',
                    themedProps: {
                        style: tailwind('font-normal-v2 text-sm')
                    },
                    usdTextStyle: tailwind('text-sm')
                }}
                />
              </ThemedViewV2>
              <View style={tailwind('flex-row items-center mt-5')}>
                <ThemedTextV2
                  light={tailwind('text-mono-light-v2-900')}
                  dark={tailwind('text-mono-dark-v2-900')}
                  style={tailwind('mr-1 font-semibold-v2 text-xs')}
                >
                  {translate('screens/CompositeSwapScreen', 'Learn about settlements')}
                </ThemedTextV2>
                <ThemedIcon
                  name='info-outline'
                  size={16}
                  iconType='MaterialIcons'
                  light={tailwind('text-mono-light-v2-900')}
                  dark={tailwind('text-mono-dark-v2-900')}
                />
              </View>
            </View>)}
      </>
    )
}

function SettlementBlockInfo ({ blockCount, transactionDate }: { blockCount?: number, transactionDate?: string }): JSX.Element {
  // const { getBlocksUrl } = useDeFiScanContext()

  // const onBlockUrlPressed = async (): Promise<void> => {
  //   if (blockCount !== undefined) {
  //     const url = getBlocksUrl(blockCount)
  //     await Linking.openURL(url)
  //   }
  // }

  return (
    <ThemedViewV2
      style={tailwind('flex-row items-start w-full bg-transparent pt-5')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <View style={tailwind('w-6/12')}>
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-sm')}
          light={tailwind('text-mono-light-v2-500')}
          dark={tailwind('text-mono-dark-v2-500')}
        >
          {translate('screens/NetworkDetails', 'Settlement block')}
        </ThemedTextV2>
      </View>

      <View
        style={tailwind('flex-1')}
      >
        <TouchableOpacity
          // onPress={onBlockUrlPressed}
          testID='block_detail_explorer_url'
        >
          <NumberFormat
            displayType='text'
            renderText={(val: string) => (
              <ThemedTextV2
                light={tailwind('text-mono-light-v2-900')}
                dark={tailwind('text-mono-dark-v2-900')}
                style={tailwind('text-sm font-normal-v2 flex-wrap text-right')}
                testID='network_details_block_height'
              >
                {val}
              </ThemedTextV2>
              )}
            thousandSeparator
            value={blockCount}
          />
          <View style={tailwind('flex-row items-center justify-end')}>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              style={tailwind('text-right text-sm font-normal-v2')}
            >
              {transactionDate}
            </ThemedTextV2>

            <View style={tailwind('ml-1 flex-grow-0 justify-center')}>
              <ThemedIcon
                iconType='MaterialIcons'
                light={tailwind('text-mono-light-v2-700')}
                dark={tailwind('text-mono-dark-v2-700')}
                name='open-in-new'
                size={16}
              />
            </View>
          </View>

        </TouchableOpacity>
      </View>
    </ThemedViewV2>
  )
}
