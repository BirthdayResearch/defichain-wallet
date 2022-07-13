import {
  ThemedView,
  ThemedTouchableOpacity
} from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { PortfolioRowToken } from '../PortfolioScreen'
import { StackNavigationProp } from '@react-navigation/stack'
import { View } from '@components'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { EmptyBalances } from './EmptyBalances'
import { TokenNameText } from '@screens/AppNavigator/screens/Portfolio/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Portfolio/components/TokenAmountText'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { getNativeIcon } from '@components/icons/assets'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { TokenBreakdownPercentage } from './TokenBreakdownPercentage'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'
import { EmptyPortfolio } from './EmptyPortfolio'

export enum ButtonGroupTabKey {
  AllTokens = 'ALL_TOKENS',
  LPTokens = 'LP_TOKENS',
  Crypto = 'CRYPTO',
  dTokens = 'd_TOKENS'
}

interface PortfolioCardProps {
  isZeroBalance: boolean
  filteredTokens: PortfolioRowToken[]
  dstTokens: PortfolioRowToken[]
  navigation: StackNavigationProp<PortfolioParamList>
  buttonGroupOptions?: {
    onButtonGroupPress: (key: ButtonGroupTabKey) => void
    activeButtonGroup: string
    setActiveButtonGroup: (key: ButtonGroupTabKey) => void
  }
  denominationCurrency: string
}

export function PortfolioCard ({
  isZeroBalance,
  filteredTokens,
  dstTokens,
  navigation,
  buttonGroupOptions,
  denominationCurrency
}: PortfolioCardProps): JSX.Element {
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.AllTokens,
      label: translate('screens/PortfolioScreen', 'All tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
    },
    {
      id: ButtonGroupTabKey.LPTokens,
      label: translate('screens/PortfolioScreen', 'LP tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.LPTokens)
    },
    {
      id: ButtonGroupTabKey.Crypto,
      label: translate('screens/PortfolioScreen', 'Crypto'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.Crypto)
    },
    {
      id: ButtonGroupTabKey.dTokens,
      label: translate('screens/PortfolioScreen', 'dTokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.dTokens)
    }
  ]
  const [tabButtonLabel, setTabButtonLabel] = useState('')
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    if (buttonGroupOptions !== undefined) {
      buttonGroupOptions.setActiveButtonGroup(buttonGroupTabKey)
      buttonGroupOptions.onButtonGroupPress(buttonGroupTabKey)
      setButtonLabel(buttonGroupTabKey)
    }
  }

  const setButtonLabel = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    switch (buttonGroupTabKey) {
      case (ButtonGroupTabKey.LPTokens):
        return setTabButtonLabel('LP tokens')
      case (ButtonGroupTabKey.Crypto):
        return setTabButtonLabel('Crypto')
      case (ButtonGroupTabKey.dTokens):
        return setTabButtonLabel('dTokens')
    }
  }

  // return empty component if there are DFI but no other tokens
  if (!isZeroBalance && dstTokens.length === 0) {
    return <></>
  }

  // return empty portfolio if no DFI and other tokens
  if (isZeroBalance) {
    return <EmptyPortfolio />
  }

  return (
    <ThemedView>
      {
        // filter tab
        buttonGroupOptions !== undefined &&
        (
          <>
            <View style={tailwind('p-4')}>
              <ButtonGroup
                buttons={buttonGroup}
                activeButtonGroupItem={buttonGroupOptions.activeButtonGroup}
                labelStyle={tailwind('font-medium text-xs text-center py-0.5')}
                testID='portfolio_button_group'
              />
            </View>
          </>
        )
      }
      <View testID='card_balance_row_container'>
        {filteredTokens.map((item) => (
          <View key={item.symbol} style={tailwind('p-4 pt-1.5 pb-1.5')}>
            <PortfolioItemRow
              onPress={() => navigation.navigate({
                name: 'TokenDetail',
                params: { token: item },
                merge: true
              })}
              token={item}
              denominationCurrency={denominationCurrency}
            />
          </View>
        ))}
      </View>
      {
        // display empty balance component if tokens under selected tab does not exist
        filteredTokens.length === 0 && hasFetchedToken && tabButtonLabel !== '' &&
          <EmptyBalances type={tabButtonLabel} />
      }
    </ThemedView>
  )
}

function PortfolioItemRow ({
  token,
  onPress,
  denominationCurrency
}: { token: PortfolioRowToken, onPress: () => void, denominationCurrency: string }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `portfolio_row_${token.id}`
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const lockedToken = useTokenLockedBalance({ displaySymbol: token.displaySymbol, denominationCurrency }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)
  const loanTokens = useSelector((state: RootState) => state.loans.loanTokens)
  const hasLockedBalance = useMemo((): boolean => {
    return collateralTokens.some(collateralToken => collateralToken.token.displaySymbol === token.displaySymbol) ||
      loanTokens.some(loanToken => loanToken.token.displaySymbol === token.displaySymbol)
  }, [token])

  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800')}
      light={tailwind('bg-white')}
      style={tailwind('p-4 rounded-lg')}
    >
      <ThemedTouchableOpacity
        onPress={onPress}
        dark={tailwind('border-0')}
        light={tailwind('border-0')}
        testID={testID}
      >
        <View style={tailwind('flex-row items-center flex-grow')}>
          <Icon testID={`${testID}_icon`} />
          <TokenNameText displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
          <TokenAmountText
            tokenAmount={token.amount}
            usdAmount={token.usdAmount}
            testID={testID}
            isBalancesDisplayed={isBalancesDisplayed}
            denominationCurrency={denominationCurrency}
          />
        </View>
        {hasLockedBalance && !lockedToken.amount.isZero() &&
          (
            <TokenBreakdownPercentage
              displaySymbol={token.displaySymbol}
              symbol={token.symbol}
              lockedAmount={lockedToken.amount}
              testID={token.displaySymbol}
            />
          )}
      </ThemedTouchableOpacity>
    </ThemedView>
  )
}
