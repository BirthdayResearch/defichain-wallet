import { View } from '@components'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { TouchableOpacity } from 'react-native'
import { getUSDPrecisedPrice } from '../../Auctions/helpers/usd-precision'
import { BalanceText } from './BalanceText'
import { useState } from 'react'

interface TotalPortfolioProps {
  totalAvailableUSDValue: BigNumber
  totalLockedUSDValue: BigNumber
  onToggleDisplayBalances: () => Promise<void>
  isBalancesDisplayed: boolean
}

export function TotalPortfolio (props: TotalPortfolioProps): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const { hasFetchedVaultsData } = useSelector((state: RootState) => (state.loans))
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-4 my-4 p-4 rounded-lg')}
      testID='total_portfolio_card'
    >
      <View style={tailwind('flex flex-row justify-between items-center w-full')}>
        <View style={tailwind('w-10/12 flex-grow')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-sm text-gray-500')}
          >
            {translate('screens/BalancesScreen', 'Total Portfolio Value')}
          </ThemedText>
          {
            (hasFetchedToken && hasFetchedVaultsData)
              ? (
                <View style={tailwind('flex flex-row justify-start items-center flex-wrap mr-2 w-full')}>
                  <NumberFormat
                    displayType='text'
                    prefix='$'
                    renderText={(value) =>
                      <BalanceText
                        dark={tailwind('text-gray-200')}
                        light={tailwind('text-black')}
                        style={tailwind('flex-wrap text-2xl font-bold max-w-3/4')}
                        testID='total_usd_amount'
                        value={value}
                      />}
                    thousandSeparator
                    value={getUSDPrecisedPrice(new BigNumber(props.totalAvailableUSDValue).plus(props.totalLockedUSDValue))}
                  />
                  <TouchableOpacity
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={tailwind('flex flex-row')}
                    testID='toggle_portfolio'
                  >
                    <ThemedIcon
                      light={tailwind('text-primary-500')}
                      dark={tailwind('text-darkprimary-500')}
                      iconType='MaterialIcons'
                      name={!isExpanded ? 'expand-more' : 'expand-less'}
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
              )
              : (
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
            testID='toggle_usd_breakdown_icon'
          />
        </ThemedTouchableOpacity>
      </View>
      {
      isExpanded &&
        <ThemedView
          style={tailwind('mb-2 mt-2 border-t')}
          light={tailwind('border-gray-100')}
          dark={tailwind('border-gray-700')}
        >
          <View style={tailwind('mt-2')}>
            <USDValueRow
              testId='total_available_usd_amount'
              isLoading={!hasFetchedToken}
              label={translate('screens/BalancesScreen', 'available')}
              value={props.totalAvailableUSDValue}
            />
          </View>
          <USDValueRow
            testId='total_locked_usd_amount'
            isLoading={!hasFetchedVaultsData}
            label={translate('screens/BalancesScreen', 'locked in vault(s)')}
            value={props.totalLockedUSDValue}
          />
        </ThemedView>
      }
    </ThemedView>
  )
}

function USDValueRow (props: {isLoading: boolean, testId: string, value: BigNumber, label: string }): JSX.Element {
  if (props.isLoading) {
    return (
      <View style={tailwind('mt-1')}>
        <TextSkeletonLoader
          iContentLoaderProps={{
            height: '14',
            testID: `${props.testId}_skeleton_loader`
          }}
          viewBoxWidth='260'
          textWidth='120'
        />
      </View>
    )
  }
  return (
    <View style={tailwind('flex flex-row justify-start items-center w-full')}>
      <NumberFormat
        displayType='text'
        prefix='$'
        renderText={(value) =>
          <BalanceText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('flex-wrap text-sm font-medium max-w-3/4')}
            testID={props.testId}
            value={value}
          />}
        thousandSeparator
        value={getUSDPrecisedPrice(props.value)}
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs text-gray-500 ml-1')}
      >
        {props.label}
      </ThemedText>
    </View>
  )
}
