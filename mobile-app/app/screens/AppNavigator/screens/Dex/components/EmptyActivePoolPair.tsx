import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { EmptyLPTokenIcon } from '../../Portfolio/assets/EmptyLPTokenIcon'

export function EmptyActivePoolpair (): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind('flex items-center pt-16 px-14 h-full')}
      testID='empty_active_poolpair'
    >
      <EmptyLPTokenIcon />
      <ThemedTextV2
        style={tailwind('text-xl font-semibold-v2 text-center mb-2 mt-8')}
      >{translate('screens/DexScreen', 'No LP tokens found')}
      </ThemedTextV2>
      <ThemedTextV2
        style={tailwind('text-center font-normal-v2')}
      >{translate('screens/DexScreen', 'Add liquidity to get started')}
      </ThemedTextV2>
    </ThemedViewV2>
  )
}
