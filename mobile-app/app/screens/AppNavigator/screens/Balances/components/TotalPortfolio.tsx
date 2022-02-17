import { View } from '@components'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { getUSDPrecisedPrice } from '../../Auctions/helpers/usd-precision'
import { BalanceText } from './BalanceText'

interface TotalPortfolioProps {
  totalUSDValue: BigNumber
  onToggleDisplayBalances: () => Promise<void>
  isBalancesDisplayed: boolean
}

export function TotalPortfolio (props: TotalPortfolioProps): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-4 my-4 p-4 rounded-lg flex flex-row justify-between items-center')}
      testID='total_portfolio_card'
    >
      <View style={tailwind('w-10/12 flex-grow')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-sm text-gray-500')}
        >
          {translate('screens/BalancesScreen', 'Total Portfolio Value (USD)')}
        </ThemedText>
        {
          !hasFetchedToken
            ? (
              <View style={tailwind('mt-1')}>
                <TextSkeletonLoader
                  viewBoxWidth='260'
                  viewBoxHeight='28'
                  textWidth='180'
                  textHeight='23'
                  iContentLoaderProps={{
                    height: '28',
                    testID: 'total_portfolio_skeleton_loader'
                  }}
                />
              </View>
            )
            : (
              <NumberFormat
                displayType='text'
                prefix='$'
                renderText={(value) =>
                  <BalanceText
                    dark={tailwind('text-gray-200')}
                    light={tailwind('text-black')}
                    style={tailwind('mr-2 flex-wrap text-2xl font-bold')}
                    testID='total_usd_amount'
                    value={value}
                  />}
                thousandSeparator
                value={getUSDPrecisedPrice(props.totalUSDValue)}
              />
            )
        }

      </View>
      <ThemedTouchableOpacity
        testID='toggle_balance'
        light={tailwind('bg-transparent border-gray-200')}
        dark={tailwind('bg-transparent border-gray-700')}
        style={tailwind('p-1.5 border rounded text-center')}
        onPress={props.onToggleDisplayBalances}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
          name={`${props.isBalancesDisplayed ? 'visibility' : 'visibility-off'}`}
          size={20}
          testID='toggle_balance_icon'
        />
      </ThemedTouchableOpacity>
    </ThemedView>
  )
}
