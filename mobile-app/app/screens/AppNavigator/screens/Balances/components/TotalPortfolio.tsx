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
import { getPrecisedTokenValue } from '../../Auctions/helpers/precision-token-value'
import { BalanceText } from './BalanceText'
import { useState } from 'react'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { SymbolIcon } from '@components/SymbolIcon'

export enum PortfolioButtonGroupTabKey {
  USDT = 'USDT',
  DFI = 'DFI',
  BTC = 'BTC'
}

interface TotalPortfolioProps {
  totalAvailableValue: BigNumber
  totalLockedValue: BigNumber
  totalLoansValue: BigNumber
  onToggleDisplayBalances: () => Promise<void>
  isBalancesDisplayed: boolean
  portfolioButtonGroupOptions?: {
    activePortfolioButtonGroup: string
    setActivePortfolioButtonGroup: (key: PortfolioButtonGroupTabKey) => void
  }
  portfolioButtonGroup: Array<{
    id: PortfolioButtonGroupTabKey
    label: string
    handleOnPress: () => void
  }>
  denominationCurrency?: string
}

export function TotalPortfolio (props: TotalPortfolioProps): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const { hasFetchedVaultsData } = useSelector((state: RootState) => (state.loans))
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const denominationCurrency = props.portfolioButtonGroupOptions?.activePortfolioButtonGroup // for 'BTC' or 'DFI' denomination
  const totalPortfolioValue = BigNumber.max(0, new BigNumber(props.totalAvailableValue).plus(props.totalLockedValue).minus(props.totalLoansValue))

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('m-4 mb-2 px-4 pb-4 pt-2 rounded-lg')}
      testID='total_portfolio_card'
    >
      <View style={tailwind('justify-evenly')}>
        <View style={tailwind('flex flex-row items-center py-1')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-sm text-gray-500')}
          >
            {translate('screens/BalancesScreen', 'Total Portfolio Value')}
          </ThemedText>
          <View style={tailwind('px-2')}>
            <ThemedTouchableOpacity
              testID='toggle_balance'
              light={tailwind('bg-transparent border-gray-200')}
              dark={tailwind('bg-transparent border-gray-700')}
              onPress={props.onToggleDisplayBalances}
            >
              <ThemedIcon
                iconType='MaterialIcons'
                dark={tailwind('text-darkprimary-500')}
                light={tailwind('text-primary-500')}
                name={`${props.isBalancesDisplayed ? 'visibility' : 'visibility-off'}`}
                size={18}
                testID='toggle_usd_breakdown_icon'
              />
            </ThemedTouchableOpacity>
          </View>
          {
            props.portfolioButtonGroupOptions !== undefined &&
            (
              <View style={[tailwind('py-1.5'), { marginLeft: 'auto' }]}>
                <ButtonGroup
                  buttons={props.portfolioButtonGroup}
                  activeButtonGroupItem={props.portfolioButtonGroupOptions.activePortfolioButtonGroup}
                  modalStyle={tailwind('text-xs text-center')}
                  testID='portfolio_button_group'
                  lightThemeStyle={tailwind('bg-white')}
                  customButtonGroupStyle={tailwind('px-2.5 py-1 rounded break-words justify-center')}
                  customActiveStyle={{
                    light: tailwind('bg-gray-100'),
                    dark: tailwind('bg-black')
                  }}
                />
              </View>
            )
          }
        </View>
      </View>
      {
        (hasFetchedToken && hasFetchedVaultsData)
          ? (
            <View style={tailwind('flex flex-row items-center')}>
              <NumberFormat
                displayType='text'
                prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
                renderText={(value) =>
                  <BalanceText
                    dark={tailwind('text-gray-200')}
                    light={tailwind('text-black')}
                    style={tailwind('flex-wrap text-2xl font-bold max-w-3/4')}
                    testID='total_usd_amount'
                    value={value}
                  />}
                thousandSeparator
                value={getPrecisedTokenValue(totalPortfolioValue)}
              />
              {
                denominationCurrency !== PortfolioButtonGroupTabKey.USDT && denominationCurrency && (
                  <View style={tailwind('pl-1.5')} testID={`portfolio_display_${denominationCurrency}_currency`}>
                    <SymbolIcon symbol={`${denominationCurrency}`} styleProps={tailwind('w-4 h-4')} />
                  </View>
                )
              }
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
                viewBoxHeight='34'
                textWidth='180'
                textHeight='23'
                textVerticalOffset='4'
                iContentLoaderProps={{
                  height: '34',
                  testID: 'total_portfolio_skeleton_loader'
                }}
              />
            </View>
          )
      }
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
                value={props.totalAvailableValue}
                isAddition
                denominationCurrency={denominationCurrency}
              />
            </View>
            <USDValueRow
              testId='total_locked_usd_amount'
              isLoading={!hasFetchedVaultsData}
              label={translate('screens/BalancesScreen', 'locked in vault(s)')}
              value={props.totalLockedValue}
              isAddition
              denominationCurrency={denominationCurrency}
            />
            {
              props.totalLoansValue.gt(0) && (
                <USDValueRow
                  testId='outstanding_loans_amount'
                  isLoading={!hasFetchedVaultsData}
                  label={translate('screens/BalancesScreen', 'loans')}
                  value={props.totalLoansValue}
                  isAddition={false}
                  denominationCurrency={denominationCurrency}
                />
              )
            }
          </ThemedView>
      }
    </ThemedView>
  )
}

function USDValueRow (props: { isLoading: boolean, testId: string, value: BigNumber, label: string, isAddition: boolean, denominationCurrency?: string}): JSX.Element {
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
      <ThemedText
        light={tailwind(props.isAddition ? 'text-gray-500' : 'text-error-500')}
        dark={tailwind(props.isAddition ? 'text-gray-400' : 'text-error-300')} style={tailwind('mr-1 w-2')}
      >
        {props.isAddition ? '+' : '-'}
      </ThemedText>
      <NumberFormat
        displayType='text'
        // TODO: modify condition when API is ready for denomination currency change for other pages other than BalanceScreen page
        prefix={(props.denominationCurrency === undefined || props.denominationCurrency === PortfolioButtonGroupTabKey.USDT) ? '$' : undefined}
        suffix={(props.denominationCurrency !== undefined && props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT) ? ` ${props.denominationCurrency}` : undefined}
        renderText={(value) =>
          <BalanceText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('flex-wrap text-sm font-medium max-w-3/4')}
            testID={props.testId}
            value={value}
          />}
        thousandSeparator
        value={getPrecisedTokenValue(props.value)}
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
