import { View } from '@components'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Platform, TouchableOpacity } from 'react-native'
import { getPrecisedCurrencyValue, getPrecisedTokenValue } from '../../Auctions/helpers/precision-token-value'
import { BalanceText } from './BalanceText'
import { useEffect, useState } from 'react'
import { BalanceTextV2 } from './BalanceTextV2'
import { TextSkeletonLoaderV2 } from '@components/TextSkeletonLoaderV2'

export enum PortfolioButtonGroupTabKey {
  USDT = 'USDT',
  DFI = 'DFI',
  BTC = 'BTC'
}

interface TotalPortfolioProps {
  totalAvailableValue: BigNumber
  totalLockedValue: BigNumber
  totalLoansValue: BigNumber
  portfolioButtonGroup: PortfolioButtonGroup[]
  denominationCurrency: string
  setDenominationCurrency: (key: PortfolioButtonGroupTabKey) => void
}

interface PortfolioButtonGroup {
  id: PortfolioButtonGroupTabKey
  label: string
  handleOnPress: () => void
}

export function TotalPortfolio (props: TotalPortfolioProps): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const { hasFetchedVaultsData } = useSelector((state: RootState) => (state.loans))
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const denominationCurrency = props.denominationCurrency // for 'BTC' or 'DFI' denomination
  const totalPortfolioValue = BigNumber.max(0, new BigNumber(props.totalAvailableValue).plus(props.totalLockedValue).minus(props.totalLoansValue))
  const [activeButtonGroup, setActiveButtonGroup] = useState<PortfolioButtonGroup>()
  const onCurrencySwitch = (): void => {
    const activeIndex = props.portfolioButtonGroup.findIndex(tab => tab.id === props.denominationCurrency)
    let nextIndex = activeIndex + 1
    if (activeIndex === props.portfolioButtonGroup.length - 1) {
      nextIndex = 0
    }
    props.setDenominationCurrency(props.portfolioButtonGroup[nextIndex].id)
  }

  useEffect(() => {
    setActiveButtonGroup(props.portfolioButtonGroup.find(button => button.id === props.denominationCurrency))
  }, [props.denominationCurrency])

  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00')}
      dark={tailwind('bg-mono-dark-v2-00')}
      style={tailwind('px-5 py-5 rounded-b-xl-v2')}
      testID='total_portfolio_card'
    >
      {
        (hasFetchedToken && hasFetchedVaultsData)
          ? (
            <View style={tailwind('flex flex-row items-center justify-between')}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onCurrencySwitch}
                style={tailwind('flex flex-row items-center w-10/12')}
                testID='portfolio_currency_switcher'
              >
                <NumberFormat
                  displayType='text'
                  prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
                  renderText={(value) =>
                    <BalanceTextV2
                      style={[tailwind('font-semibold-v2 mr-2 flex flex-row items-center'), { fontSize: 28, lineHeight: 36 }]}
                      testID='total_usd_amount'
                      value={value}
                    >
                      {activeButtonGroup !== undefined && <CurrencySwitcher currency={activeButtonGroup.label} />}
                    </BalanceTextV2>}
                  thousandSeparator
                  value={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? getPrecisedCurrencyValue(totalPortfolioValue) : getPrecisedTokenValue(totalPortfolioValue)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded(!isExpanded)}
                style={tailwind('')}
                testID='toggle_portfolio'
              >
                <ThemedIcon
                  light={tailwind('text-mono-light-v2-900')}
                  dark={tailwind('text-mono-dark-v2-900')}
                  iconType='Feather'
                  name={!isExpanded ? 'chevron-down' : 'chevron-up'}
                  size={30}
                />
              </TouchableOpacity>
            </View>
          )
          : (
            <View style={tailwind('mt-1')}>
              <TextSkeletonLoaderV2
                viewBoxWidth='260'
                viewBoxHeight='32'
                textWidth='180'
                textHeight='20'
                textVerticalOffset='4'
                iContentLoaderProps={{
                  height: '32',
                  testID: 'total_portfolio_skeleton_loader'
                }}
              />
            </View>
          )
      }
      {
        isExpanded &&
          <ThemedViewV2
            style={tailwind('mt-5 border-t-0.5')}
            light={tailwind('border-mono-light-v2-300')}
            dark={tailwind('border-mono-dark-v2-300')}
          >
            <View style={tailwind('mt-5')}>
              <USDValueRow
                testId='total_available_usd_amount'
                isLoading={!hasFetchedToken}
                label={translate('screens/PortfolioScreen', 'available')}
                value={props.totalAvailableValue}
                isAddition
                denominationCurrency={denominationCurrency}
              />
            </View>
            <USDValueRow
              testId='total_locked_usd_amount'
              isLoading={!hasFetchedVaultsData}
              label={translate('screens/PortfolioScreen', 'locked in vault(s)')}
              value={props.totalLockedValue}
              isAddition
              denominationCurrency={denominationCurrency}
            />
            {
              props.totalLoansValue.gt(0) && (
                <USDValueRow
                  testId='outstanding_loans_amount'
                  isLoading={!hasFetchedVaultsData}
                  label={translate('screens/PortfolioScreen', 'loans')}
                  value={props.totalLoansValue}
                  isAddition={false}
                  denominationCurrency={denominationCurrency}
                />
              )
            }
          </ThemedViewV2>
      }
    </ThemedViewV2>
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
      <ThemedTextV2
        light={tailwind(props.isAddition ? 'text-green-v2' : 'text-red-v2')}
        dark={tailwind(props.isAddition ? 'text-green-v2' : 'text-red-v2')}
        style={tailwind('mr-1 w-2 text-sm font-normal-v2')}
      >
        {props.isAddition ? '+' : '-'}
      </ThemedTextV2>
      <NumberFormat
        displayType='text'
        // TODO: modify condition when API is ready for denomination currency change for other pages other than BalanceScreen page
        prefix={(props.denominationCurrency === undefined || props.denominationCurrency === PortfolioButtonGroupTabKey.USDT) ? '$' : undefined}
        suffix={(props.denominationCurrency !== undefined && props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT) ? ` ${props.denominationCurrency}` : undefined}
        renderText={(value) =>
          <BalanceText
            light={tailwind(props.isAddition ? 'text-green-v2' : 'text-red-v2')}
            dark={tailwind(props.isAddition ? 'text-green-v2' : 'text-red-v2')}
            style={tailwind('flex-wrap text-sm font-normal-v2 ')}
            testID={props.testId}
            value={value}
          />}
        thousandSeparator
        value={props.denominationCurrency === PortfolioButtonGroupTabKey.USDT ? getPrecisedCurrencyValue(props.value) : getPrecisedTokenValue(props.value)}
      />
      <ThemedTextV2
        style={tailwind('text-sm font-normal-v2 ml-1')}
      >
        {props.label}
      </ThemedTextV2>
    </View>
  )
}

function CurrencySwitcher ({ currency }: { currency: string }): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind('py-1 px-2 rounded-lg border-0.5', { '-mb-1.5': Platform.OS === 'android' })}
      light={tailwind('border-mono-light-v2-900')}
      dark={tailwind('border-mono-dark-v2-900')}
    >
      <ThemedTextV2
        style={tailwind('text-xs text-center font-normal-v2')}
        testID='portfolio_active_currency'
      >
        {currency}
      </ThemedTextV2>
    </ThemedViewV2>
  )
}
