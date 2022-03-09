import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { useTokenBreakdownPercentage } from '../hooks/TokenLockedBalance'

interface TokenBreakdownPercentageProps {
  lockedAmount: BigNumber
  availableAmount: BigNumber
  symbol: string
  onBreakdownPress: () => void
  isBreakdownExpanded: boolean
}

export function TokenBreakdownPercentage (props: TokenBreakdownPercentageProps): JSX.Element {
  const {
    availablePercentage,
    lockedPercentage
  } = useTokenBreakdownPercentage({ available: props.availableAmount, locked: props.lockedAmount })
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet)
  const { hasFetchedVaultsData } = useSelector((state: RootState) => state.loans)

  return (
    <View style={tailwind('flex flex-row items-center bg-transparent justify-between mb-3')}>
      <View style={tailwind('flex flex-row items-center flex-wrap flex-1')}>
        {hasFetchedToken && hasFetchedVaultsData
          ? (
            <>
              <BreakdownPercentageItem
                type='available'
                isDfi={props.symbol === 'DFI'}
                percentage={availablePercentage}
              />
              <BreakdownPercentageItem
                type='locked'
                percentage={lockedPercentage}
              />
            </>
          )
          : (
            <View style={tailwind('flex flex-row')}>
              <View style={tailwind('mr-1')}>
                <TextSkeletonLoader
                  iContentLoaderProps={{
                    width: '120',
                    height: '18',
                    testID: 'available_percentage_skeleton_loader'
                  }}
                  textWidth='120'
                  textXRadius='10'
                  textYRadius='10'
                />
              </View>
              <TextSkeletonLoader
                iContentLoaderProps={{
                  width: '120',
                  height: '18',
                  testID: 'locked_percentage_skeleton_loader'
                }}
                textWidth='120'
                textXRadius='10'
                textYRadius='10'
              />
            </View>
          )}
      </View>
      <TouchableOpacity
        onPress={props.onBreakdownPress}
        style={tailwind('flex flex-row w-1/12')}
        testID={`details_${props.symbol}`}
      >
        <ThemedIcon
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
          iconType='MaterialIcons'
          name={!props.isBreakdownExpanded ? 'expand-more' : 'expand-less'}
          size={28}
        />
      </TouchableOpacity>
    </View>
  )
}

type BreakdownType = 'available' | 'locked'
interface BreakdownPercentageItemProps {
  type: BreakdownType
  isDfi?: boolean
  percentage: BigNumber
}

function BreakdownPercentageItem (props: BreakdownPercentageItemProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind('flex flex-row items-center p-1 rounded-xl mr-1 mb-1')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
    >
      {props.type === 'available'
        ? (props.isDfi === true && (
          <SymbolIcon symbol='DFI' styleProps={tailwind('w-4 h-4')} />
        ))
        : (
          <ThemedIcon
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-500')}
            iconType='MaterialIcons'
            name='lock'
            size={16}
          />
        )}
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs', { 'ml-1': props.type === 'available' && props.isDfi === true })}
      >
        {translate('screens/BalancesScreen', `${props.type === 'available' ? 'Available: ' : 'Locked: '}`)}
      </ThemedText>
      <NumberFormat
        value={props.percentage.toFixed(2)}
        thousandSeparator
        decimalScale={2}
        displayType='text'
        suffix='%'
        renderText={value =>
          <ThemedText
            style={tailwind('text-xs')}
            testID={`${props.type}_percentage`}
          >
            {value}
          </ThemedText>}
      />
    </ThemedView>
  )
}
