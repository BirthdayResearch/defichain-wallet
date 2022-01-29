import { View } from '@components'
import { tailwind } from '@tailwind'

import BigNumber from 'bignumber.js'
import { ThemedText } from './themed'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'

interface TokenIconGroupProps {
  symbols: string[]
  maxIconToDisplay: number
  testID?: string
}

export function TokenIconGroup (props: TokenIconGroupProps): JSX.Element {
  const additionalIcon = BigNumber.max(props.symbols?.length - props.maxIconToDisplay, 0)
  return (
    <View style={tailwind('flex flex-row')}>
      {
        props.symbols?.map((symbol, index): JSX.Element | null => {
          if (index < props.maxIconToDisplay) {
            return (
              <View testID={`${props.testID ?? ''}_${symbol}`} key={symbol} style={[tailwind('rounded-full p-px relative'), { left: index * -5 }]}>
                <SymbolIcon
                  key={symbol}
                  symbol={symbol}
                />
              </View>
            )
          }
          return null
        })
      }
      {additionalIcon.gt(0) &&
        (
          <ThemedText
            light={tailwind('text-dfxgray-500')}
            dark={tailwind('text-dfxgray-400')}
            style={[tailwind('relative text-xs font-medium'), { left: (props.maxIconToDisplay - 2) * -5 }]}
          >
            {`& ${additionalIcon.toFixed()} ${translate('components/TokenIconGroup', 'more')}`}
          </ThemedText>
        )}
    </View>

  )
}
