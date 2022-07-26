import { ThemedViewV2, ThemedTouchableOpacityV2 } from '@components/themed'
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
import { useState } from 'react'
import { EmptyPortfolio } from './EmptyPortfolio'
import { TokenIcon } from './TokenIcon'
import { TokenNameTextV2 } from './TokenNameTextV2'
import { TokenAmountTextV2 } from './TokenAmountTextV2'

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
    <ThemedViewV2>
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
      <View testID='card_balance_row_container' style={tailwind('mx-5')}>
        {filteredTokens.map((item) => (
          <PortfolioItemRow
            key={item.symbol}
            onPress={() => navigation.navigate({
              name: 'Balance',
              params: { token: item, usdAmount: item.usdAmount },
              merge: true
            })}
            token={item}
            denominationCurrency={denominationCurrency}
          />
        ))}
      </View>
      {
        // display empty balance component if tokens under selected tab does not exist
        filteredTokens.length === 0 && hasFetchedToken && tabButtonLabel !== '' &&
          <EmptyBalances type={tabButtonLabel} />
      }
    </ThemedViewV2>
  )
}

function PortfolioItemRow ({
  token,
  onPress,
  denominationCurrency
}: { token: PortfolioRowToken, onPress: () => void, denominationCurrency: string }): JSX.Element {
  const testID = `portfolio_row_${token.id}`

  return (
    <ThemedTouchableOpacityV2
      onPress={onPress}
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      style={tailwind('px-5 py-4.5 rounded-lg-v2 my-1 border-0')}
      testID={testID}
    >
      <View style={tailwind('flex flex-row items-start')}>
        <View style={tailwind('w-7/12 flex-row items-center')}>
          <TokenIcon testID={`${testID}_icon`} token={token} height={36} width={36} />
          <TokenNameTextV2 displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
        </View>
        <View style={tailwind('w-5/12')}>
          <TokenAmountTextV2
            tokenAmount={token.amount}
            usdAmount={token.usdAmount}
            testID={testID}
            denominationCurrency={denominationCurrency}
          />
        </View>
      </View>
    </ThemedTouchableOpacityV2>
  )
}
