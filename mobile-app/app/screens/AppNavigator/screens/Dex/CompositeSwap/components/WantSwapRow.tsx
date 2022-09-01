import { View } from 'react-native'
import { ThemedTextV2 } from '@components/themed'
import NumberFormat from 'react-number-format'
import { ActiveUSDValueV2 } from '../../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ButtonGroupTabKey } from '../CompositeSwapScreenV2'
import { translate } from '@translations'

interface WantSwapRowProps {
    tokenAmount: string
    tokenUsdAmount: BigNumber
    activeTab: ButtonGroupTabKey
}

export function WantSwapRow ({ tokenAmount, tokenUsdAmount, activeTab }: WantSwapRowProps): JSX.Element {
    return (
      <>
        {activeTab === ButtonGroupTabKey.InstantSwap
        ? (
          <View style={tailwind('w-6/12 mr-2')}>
            <NumberFormat
              decimalScale={8}
              displayType='text'
              renderText={(val: string) => (
                <ThemedTextV2
                  style={tailwind('text-left font-normal-v2 text-xl')}
                  light={tailwind('text-mono-light-v2-700')}
                  dark={tailwind('text-mono-dark-v2-700')}
                >
                  {val === '' ? '0.00' : val}
                </ThemedTextV2>
                                          )}
              value={new BigNumber(tokenAmount).toFixed(8)}
            />
            <ActiveUSDValueV2
              price={tokenUsdAmount}
              testId='amount_input_in_usd'
              containerStyle={tailwind('w-full break-words')}
            />
          </View>
                )
        : (
          <View style={tailwind('w-1/3')}>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              style={tailwind('text-lg font-normal-v2')}
            >
              {translate('screens/CompositeSwapScreen', 'Settlement value +5%')}
            </ThemedTextV2>
          </View>
        )}
      </>
    )
}
