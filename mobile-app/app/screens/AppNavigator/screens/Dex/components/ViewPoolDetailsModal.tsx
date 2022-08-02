import { tailwind } from '@tailwind'
import { View, ViewProps } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedTextV2, ThemedIcon } from '@components/themed'
import { BottomSheetModal } from '@components/BottomSheetModal'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'

type IViewPoolShareDetailsProps = React.PropsWithChildren<ViewProps> & ViewPoolShareDetailsProps
interface ViewPoolShareDetailsProps {
    pairData: PoolPairData
    triggerLabel?: string
}

export function ViewPoolDetailsModal ({
    pairData,
    triggerLabel,
    children
}: IViewPoolShareDetailsProps): JSX.Element {
  const TokenIconA = getNativeIcon(pairData.tokenA.displaySymbol)
  const TokenIconB = getNativeIcon(pairData.tokenB.displaySymbol)

  return (
    <View style={tailwind('w-full items-center my-8')}>
      <View>
        <TokenIconA style={tailwind('absolute z-50')} width={56} height={56} />
        <TokenIconB style={tailwind('ml-9 z-40')} width={56} height={56} />
      </View>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('mt-2 text-lg font-semibold-v2')}
      >
        {`${pairData.tokenA.displaySymbol}-${pairData.tokenB.displaySymbol}`}
      </ThemedTextV2>

      <BottomSheetModal
        name={`${pairData.tokenA.displaySymbol}_${pairData.tokenB.displaySymbol}_modal_info`}
        index={0}
        snapPoints={['50%']}
        triggerComponent={
          <View style={tailwind('flex-row')}>
            <ThemedIcon
              size={16}
              name='info-outline'
              iconType='MaterialIcons'
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
            />
            <ThemedTextV2
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              style={tailwind('ml-1 text-xs font-semibold-v2')}
            >
              {triggerLabel}
            </ThemedTextV2>
          </View>
        }
        enableScroll
      >
        <View style={tailwind('pt-0 pb-16')}>
          <View
            style={tailwind('flex-row mb-3')}
          >
            <View>
              <TokenIconA style={tailwind('absolute z-50')} width={32} height={32} />
              <TokenIconB style={tailwind('ml-5 z-40')} width={32} height={32} />
            </View>
            <ThemedTextV2
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('pl-1 text-2xl font-semibold')}
            >
              {`${pairData.tokenA.displaySymbol}-${pairData.tokenB.displaySymbol}`}
            </ThemedTextV2>
          </View>

          <View style={tailwind('mt-5')}>
            {children}
          </View>
        </View>
      </BottomSheetModal>
    </View>
  )
}
