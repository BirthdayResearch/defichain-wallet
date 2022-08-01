import { ThemedViewV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { PortfolioRowToken } from '../PortfolioScreen'
import { StackNavigationProp } from '@react-navigation/stack'
import { View } from '@components'
import { tailwind } from '@tailwind'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { EmptyTokensScreen } from './EmptyTokensScreen'
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
  navigation: StackNavigationProp<PortfolioParamList>
  buttonGroupOptions?: {
    onButtonGroupPress: (key: ButtonGroupTabKey) => void
    activeButtonGroup: ButtonGroupTabKey
    setActiveButtonGroup: (key: ButtonGroupTabKey) => void
  }
  denominationCurrency: string
  tabButtonLabel: string
}

export function PortfolioCard ({
  isZeroBalance,
  filteredTokens,
  navigation,
  buttonGroupOptions,
  denominationCurrency
}: PortfolioCardProps): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))

  // return empty portfolio if no DFI and other tokens
  if (isZeroBalance) {
    return <EmptyTokensScreen type={ButtonGroupTabKey.AllTokens} />
  }

  return (
    <ThemedViewV2>
      <View testID='card_balance_row_container' style={tailwind('mx-5')}>
        {filteredTokens.length > 0
          ? (
            <>
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
            </>
          )
: (
  <>
    {hasFetchedToken &&
      <EmptyTokensScreen type={buttonGroupOptions?.activeButtonGroup} />}
  </>
          )}
      </View>
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
        <View style={tailwind('w-5/12 flex-row justify-end')}>
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
