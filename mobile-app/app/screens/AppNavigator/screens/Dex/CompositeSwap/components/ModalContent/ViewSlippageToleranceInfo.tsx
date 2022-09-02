import { memo } from 'react'
import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { translate } from '@translations'

export const ViewSlippageToleranceInfo = (): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
   const slippageInfo = {
    title: 'Slippage tolerance',
    content: 'Slippages are rate charges that occur within an order transaction. Note that the slippage tolerance also includes the DEX stablizaion fees. Choose how much of this slippage you are willing to accept'
   }
  return (
    <ThemedViewV2 style={tailwind('px-5 h-full flex flex-grow')}>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900 border-mono-dark-v2-300')}
        light={tailwind('text-mono-light-v2-900 border-mono-dark-v2-300')}
        style={tailwind('text-lg font-normal-v2 pb-5 border-b-0.5')} // border not showing on ios
        testID='slippage_info_title'
      >
        {translate('screens/CompositeSwapScreen', slippageInfo.title)}
      </ThemedTextV2>

      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('font-normal-v2 mt-4')}
        testID='slippage_info_description'
      >
        {translate('screens/CompositeSwapScreen', slippageInfo.content)}
      </ThemedTextV2>
    </ThemedViewV2>
  )
})
