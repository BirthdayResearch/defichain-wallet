import { View } from '@components'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import ContentLoader, { Rect, IContentLoaderProps } from 'react-content-loader/native'
import NumberFormat from 'react-number-format'
import { getUSDPrecisedPrice } from '../../Auctions/helpers/usd-precision'
import { BalanceText } from './BalanceText'

interface TotalPortfolioProps {
  totalUSDValue: BigNumber
  onToggleDisplayBalances: () => Promise<void>
  isBalancesDisplayed: boolean
}

export function TotalPortfolio (props: TotalPortfolioProps): JSX.Element {
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
          props.totalUSDValue.isNaN()
? (
  <PortfolioSkeletonLoader />
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

function PortfolioSkeletonLoader (props: JSX.IntrinsicAttributes & IContentLoaderProps & { children?: React.ReactNode }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('items-center justify-center')}
      testID=''
    >
      <ContentLoader
        backgroundColor={isLight ? '#ecebeb' : '#2f2f2f'}
        foregroundColor={isLight ? '#ffffff' : '#4a4a4a'}
        height={32}
        preserveAspectRatio='xMidYMid slice'
        speed={2}
        viewBox='0 0 277 32'
        width='100%'
        {...props}
      >
        <Rect x='0' y='0' rx='5' ry='5' width='200' height='30' />
      </ContentLoader>
    </ThemedView>
  )
}
