import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { ThemedTextV2 } from '@components/themed'
import { OwnedTokenState } from '../CompositeSwapScreenV2'

interface WantInfoTextProps {
    tokenAAmount: string
    isReservedUtxoUsed: boolean
    selectedTokenA: OwnedTokenState
}

export function WantInfoText ({ tokenAAmount, selectedTokenA, isReservedUtxoUsed }: WantInfoTextProps): JSX.Element {
    const {
        infoText,
        infoTextThemedProps
      } = useMemo(() => {
        let infoText = ''
        let themedProps

        if (new BigNumber(tokenAAmount).isGreaterThan(selectedTokenA?.amount ?? 0)) {
          infoText = 'Insufficient balance'
          themedProps = {
            dark: tailwind('text-red-v2'),
            light: tailwind('text-red-v2')
          }
        } else if (isReservedUtxoUsed && selectedTokenA?.id === '0_unified') {
          infoText = 'A small amount of UTXO is reserved for fees'
          themedProps = {
            dark: tailwind('text-orange-v2'),
            light: tailwind('text-orange-v2')
          }
        }
        return {
          infoText: translate('screens/SendScreen', infoText),
          infoTextThemedProps: {
            ...themedProps,
            style: tailwind('text-xs mt-2 ml-5 font-normal-v2')
          }
        }
      }, [tokenAAmount, selectedTokenA])

    return (
      <ThemedTextV2 {...infoTextThemedProps}>
        {infoText}
      </ThemedTextV2>
    )
}
